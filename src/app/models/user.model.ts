export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth: Date;
  isOver18: boolean;
  role: 'customer' | 'admin';
  createdAt: Date;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}