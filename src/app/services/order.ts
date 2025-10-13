// FILE: src/app/services/order.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, orderBy, doc, updateDoc, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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

  // Create a new order from cart
  async createOrder(
    userId: string,
    userEmail: string,
    cart: Cart,
    shippingAddress: Address,
    paymentMethod: string
  ): Promise<string> {
    // Convert cart items to order items
    const orderItems: OrderItem[] = cart.items.map(item => ({
      productId: item.product.id || '',
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl
    }));

    // Create order object - Map Address fields to Order shippingAddress fields
    const orderData: Omit<Order, 'id'> = {
      userId,
      userEmail,
      items: orderItems,
      total: cart.total,
      status: 'pending',
      shippingAddress: {
        fullName: shippingAddress.fullName || '',
        address: `${shippingAddress.street}, ${shippingAddress.state}`,  // ✅ Combine street and state
        city: shippingAddress.city,
        postalCode: shippingAddress.zipCode,  // ✅ Map zipCode to postalCode
        phone: shippingAddress.phone || ''
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(this.ordersCollection, orderData);
    return docRef.id;
  }

  // Get all orders (Admin)
  getAllOrders(): Observable<Order[]> {
    const q = query(this.ordersCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  // Get orders by user ID
  getUserOrders(userId: string): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orderRef = doc(this.firestore, 'orders', orderId);
    return updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    });
  }
}