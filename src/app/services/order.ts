 // FILE: src/app/services/order.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Order, OrderItem } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Address } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.ordersCollection = collection(this.firestore, 'orders');
  }

  // Create new order from cart
  async createOrder(
    userId: string,
    userEmail: string,
    cart: Cart,
    shippingAddress: Address,
    paymentMethod: string
  ): Promise<string> {
    try {
      // Convert cart items to order items
      const orderItems: OrderItem[] = cart.items.map(item => ({
        productId: item.product.id!,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
        subtotal: (item.product.discountPrice || item.product.price) * item.quantity
      }));

      const shippingFee = 5.00; // Fixed shipping fee

      const order: Omit<Order, 'id'> = {
        userId,
        userEmail,
        items: orderItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shippingFee,
        total: cart.total + shippingFee,
        status: 'pending',
        shippingAddress,
        paymentMethod,
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(this.ordersCollection, order);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get user orders
  getUserOrders(userId: string): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
      })
    );
  }

  // Get all orders (Admin only)
  getAllOrders(): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
      })
    );
  }

  // Get order by ID
  getOrderById(orderId: string): Observable<Order | null> {
    const docRef = doc(this.firestore, 'orders', orderId);
    return from(getDoc(docRef)).pipe(
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

  // Update order status (Admin only)
  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'orders', orderId);
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: Order['paymentStatus']
  ): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'orders', orderId);
      await updateDoc(docRef, {
        paymentStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get orders by status (Admin)
  getOrdersByStatus(status: Order['status']): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
      })
    );
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'orders', orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const order = docSnap.data() as Order;
        
        // Only allow cancellation if order is pending or processing
        if (order.status === 'pending' || order.status === 'processing') {
          await updateDoc(docRef, {
            status: 'cancelled',
            updatedAt: new Date()
          });
        } else {
          throw new Error('Order cannot be cancelled at this stage');
        }
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}