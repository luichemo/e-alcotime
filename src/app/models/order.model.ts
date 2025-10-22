// FILE: src/app/models/order.model.ts

import { Timestamp } from 'firebase/firestore';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;  // ✅ Changed from 'productImage' to 'imageUrl'
  // Remove 'subtotal' - we can calculate it when needed
}

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  paymentMethod:any
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}