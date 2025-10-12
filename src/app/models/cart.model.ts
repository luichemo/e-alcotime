import { Product } from "./product.model";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  updatedAt: Date;
}