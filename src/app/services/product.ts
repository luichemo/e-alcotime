
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
import { Observable, from, map } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.productsCollection = collection(this.firestore, 'products');
  }

  getAllProducts(): Observable<Product[]> {
    return from(getDocs(this.productsCollection)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
      })
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('category', '==', category),
      where('isAvailable', '==', true)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
      })
    );
  }

  getAvailableProducts(): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('isAvailable', '==', true)
    );

    return from(getDocs(q)).pipe(
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
  }

  getFeaturedProducts(limitCount: number = 8): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('isAvailable', '==', true)
    );

    return from(getDocs(q)).pipe(
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
  }

  getDiscountedProducts(limitCount: number = 8): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('isAvailable', '==', true)
    );

    return from(getDocs(q)).pipe(
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
  }

  getProductById(id: string): Observable<Product | null> {
    const docRef = doc(this.firestore, 'products', id);
    return from(getDoc(docRef)).pipe(
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