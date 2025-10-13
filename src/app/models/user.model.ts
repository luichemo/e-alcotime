// FILE: src/app/models/user.model.ts

export interface Address {
  fullName?: string;  // ✅ Add this
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;  // ✅ Add this
}

// FILE: src/app/models/user.model.ts

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  isOver18?: boolean;
  photoURL?: string;
  role: 'user' | 'admin' | 'customer';  // ✅ Add 'customer' as an option
  addresses?: Address[];
  createdAt: Date;
}