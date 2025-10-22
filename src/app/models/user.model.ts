import { Timestamp } from 'firebase/firestore';

export interface Address {
  fullName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date | Timestamp | any;
  isOver18?: boolean;
  photoURL?: string;
  role: 'customer' | 'admin';
  addresses?: Address[];
  createdAt: Date | Timestamp | any; 
}