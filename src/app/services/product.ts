
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
import { Observable, from, map, combineLatest, startWith } from 'rxjs';
import { Product } from '../models/product.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore, private translate: TranslateService) {
    this.productsCollection = collection(this.firestore, 'products');
  }

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

  getAllProducts(): Observable<Product[]> {
    const products$ = from(getDocs(this.productsCollection)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
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
    const q = query(
      this.productsCollection,
      where('isAvailable', '==', true)
    );

    const products$ = from(getDocs(q)).pipe(
      map(snapshot => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        
        // Sort in memory by createdAt descending
        return products.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      })
    );
    return this.localizeProductsStream(products$);
  }

  getFeaturedProducts(limitCount: number = 8): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('isAvailable', '==', true)
    );

    const products$ = from(getDocs(q)).pipe(
      map(snapshot => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        
        // Sort and limit in memory by createdAt descending
        return products
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, limitCount);
      })
    );
    return this.localizeProductsStream(products$);
  }

  getDiscountedProducts(limitCount: number = 8): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('isAvailable', '==', true)
    );

    const products$ = from(getDocs(q)).pipe(
      map(snapshot => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        
        // Filter products that have a discountPrice, then sort and limit
        return products
          .filter(p => !!p.discountPrice)
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, limitCount);
      })
    );
    return this.localizeProductsStream(products$);
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
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'products', id);
      await deleteDoc(docRef);
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
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }
}