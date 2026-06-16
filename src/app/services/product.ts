
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import { Observable, from, map, combineLatest, startWith, of } from 'rxjs';
import { Product } from '../models/product.model';
import { TranslateService } from '@ngx-translate/core';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 წუთი

interface CacheEntry {
  data: Product[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsCollection: CollectionReference<DocumentData>;

  // ---- In-memory cache ----
  private cache = new Map<string, CacheEntry>();

  constructor(private firestore: Firestore, private translate: TranslateService) {
    this.productsCollection = collection(this.firestore, 'products');
  }

  /** კეშის ინვალიდაცია — გამოიძახე ნებისმიერი write ოპერაციის შემდეგ */
  invalidateCache(): void {
    this.cache.clear();
  }

  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_TTL_MS;
  }

  private getCached(key: string): Product[] | null {
    return this.isCacheValid(key) ? this.cache.get(key)!.data : null;
  }

  private setCached(key: string, data: Product[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ---- Localization ----

  private localizeProduct(product: Product, lang: string): Product {
    return {
      ...product,
      name: lang === 'ka' ? (product.nameKa || product.name) : (product.nameEn || product.name),
      description: lang === 'ka' ? (product.descriptionKa || product.description) : (product.descriptionEn || product.description),
      brand: lang === 'ka' ? (product.brandKa || product.brand) : (product.brandEn || product.brand),
      country: lang === 'ka' ? (product.countryKa || product.country) : (product.countryEn || product.country),
      technology: lang === 'ka' ? (product.technologyKa || product.technology) : (product.technologyEn || product.technology),
      flavor: lang === 'ka' ? (product.flavorKa || product.flavor) : (product.flavorEn || product.flavor),
      taste: lang === 'ka' ? (product.tasteKa || product.taste) : (product.tasteEn || product.taste),
    };
  }

  private localizeProductsStream(products$: Observable<Product[]>): Observable<Product[]> {
    return combineLatest([
      products$,
      this.translate.onLangChange.pipe(startWith({ lang: this.translate.currentLang || 'en' }))
    ]).pipe(
      map(([products, event]) => products.map(p => this.localizeProduct(p, event.lang)))
    );
  }

  private localizeProductStream(product$: Observable<Product | null>): Observable<Product | null> {
    return combineLatest([
      product$,
      this.translate.onLangChange.pipe(startWith({ lang: this.translate.currentLang || 'en' }))
    ]).pipe(
      map(([product, event]) => product ? this.localizeProduct(product, event.lang) : null)
    );
  }

  // ---- Queries ----

  getAllProducts(): Observable<Product[]> {
    const cacheKey = 'all';
    const cached = this.getCached(cacheKey);
    const products$ = cached
      ? of(cached)
      : from(getDocs(this.productsCollection)).pipe(
          map(snapshot => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            this.setCached(cacheKey, data);
            return data;
          })
        );
    return this.localizeProductsStream(products$);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('category', '==', category),
      where('isAvailable', '==', true)
    );

    const products$ = from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
      })
    );
    return this.localizeProductsStream(products$);
  }

  getAvailableProducts(): Observable<Product[]> {
    const cacheKey = 'available';
    const cached = this.getCached(cacheKey);

    const products$ = cached
      ? of(cached)
      : from(getDocs(query(this.productsCollection, where('isAvailable', '==', true)))).pipe(
          map(snapshot => {
            const data = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Product))
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              });
            this.setCached(cacheKey, data);
            return data;
          })
        );

    return this.localizeProductsStream(products$);
  }

  getFeaturedProducts(limitCount: number = 8): Observable<Product[]> {
    // კეშიდან ამოვიღეთ getAvailableProducts-ი და slice ვუკეთებთ
    return this.getAvailableProducts().pipe(
      map(products => products.slice(0, limitCount))
    );
  }

  getDiscountedProducts(limitCount: number = 8): Observable<Product[]> {
    // Firestore query-ში ვფილტრავთ discountPrice > 0 — ნაცვლად ყველა პროდუქტის ჩამოტვირთვისა
    const cacheKey = 'discounted';
    const cached = this.getCached(cacheKey);

    const products$ = cached
      ? of(cached)
      : from(
          getDocs(
            query(
              this.productsCollection,
              where('isAvailable', '==', true),
              where('discountPrice', '>', 0)
            )
          )
        ).pipe(
          map(snapshot => {
            const data = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Product))
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              });
            this.setCached(cacheKey, data);
            return data;
          })
        );

    return this.localizeProductsStream(products$).pipe(
      map(products => products.slice(0, limitCount))
    );
  }

  getProductById(id: string): Observable<Product | null> {
    const docRef = doc(this.firestore, 'products', id);
    const product$ = from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Product;
        }
        return null;
      })
    );
    return this.localizeProductStream(product$);
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products =>
        products.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.productsCollection, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      this.invalidateCache();
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'products', id);
      await updateDoc(docRef, {
        ...product,
        updatedAt: new Date()
      });
      this.invalidateCache();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'products', id);
      await deleteDoc(docRef);
      this.invalidateCache();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'products', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentStock = docSnap.data()['stock'] || 0;
        await updateDoc(docRef, {
          stock: currentStock + quantity,
          updatedAt: new Date()
        });
        this.invalidateCache();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }
}