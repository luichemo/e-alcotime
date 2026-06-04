
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, query, where, orderBy, doc, updateDoc, getDoc, getDocs, CollectionReference, DocumentReference } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { Order, OrderItem } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Address } from '../models/user.model';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.ordersCollection = collection(this.firestore, 'orders');
  }

  async createOrder(
    userId: string,
    userEmail: string,
    cart: Cart,
    shippingAddress: Address,
    paymentMethod: string
  ): Promise<string> {
    const orderItems: OrderItem[] = cart.items.map(item => ({
      productId: item.product.id || '',
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl
    }));

    const orderData: Omit<Order, 'id'> = {
      userId,
      userEmail,
      items: orderItems,
      total: cart.total,
      status: 'pending',
      paymentMethod: paymentMethod,
      shippingAddress: {
        fullName: shippingAddress.fullName || '',
        address: `${shippingAddress.street}, ${shippingAddress.state}`,
        city: shippingAddress.city,
        postalCode: shippingAddress.zipCode,
        phone: shippingAddress.phone || ''
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(this.ordersCollection, orderData);
    return docRef.id;
  }

  getOrderById(orderId: string): Observable<Order | null> {
    const orderRef = doc(this.firestore, 'orders', orderId);
    
    return from(getDoc(orderRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Order;
        }
        return null;
      })
    );
  }

  getAllOrders(): Observable<Order[]> {
    const q = query(this.ordersCollection, orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Order));
      })
    );
  }

  getUserOrders(userId: string): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      where('userId', '==', userId)
    );
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const orders = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Order));
        
        return orders.sort((a, b) => {
          const timeA = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
      })
    );
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orderRef = doc(this.firestore, 'orders', orderId);
    return updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    });
  }
}