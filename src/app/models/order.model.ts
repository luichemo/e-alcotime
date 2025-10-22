
import { Timestamp } from 'firebase/firestore';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;  
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