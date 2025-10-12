export interface Product {
  id?: string;
  name: string;
  description: string;
  category: 'wine' | 'beer' | 'spirits' | 'champagne' | 'other';
  price: number;
  discountPrice?: number;
  alcoholContent: number; // percentage
  volume: number; // in ml
  imageUrl: string;
  stock: number;
  brand: string;
  country: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}