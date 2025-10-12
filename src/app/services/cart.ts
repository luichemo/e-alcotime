// FILE: src/app/services/cart.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getCartFromStorage());
  public cart$: Observable<Cart> = this.cartSubject.asObservable();

  constructor() {}

  // Get current cart value
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  // Add item to cart
  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.getCurrentCart();
    const existingItemIndex = currentCart.items.findIndex(
      item => item.product.id === product.id
    );

    if (existingItemIndex > -1) {
      // Item exists, update quantity
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // New item, add to cart
      currentCart.items.push({ product, quantity });
    }

    this.updateCart(currentCart);
  }

  // Remove item from cart
  removeFromCart(productId: string): void {
    const currentCart = this.getCurrentCart();
    currentCart.items = currentCart.items.filter(
      item => item.product.id !== productId
    );
    this.updateCart(currentCart);
  }

  // Update item quantity
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.getCurrentCart();
    const itemIndex = currentCart.items.findIndex(
      item => item.product.id === productId
    );

    if (itemIndex > -1) {
      currentCart.items[itemIndex].quantity = quantity;
      this.updateCart(currentCart);
    }
  }

  // Clear cart
  clearCart(): void {
    const emptyCart: Cart = {
      userId: this.getCurrentCart().userId,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      updatedAt: new Date()
    };
    this.updateCart(emptyCart);
  }

  // Get cart item count
  getItemCount(): number {
    return this.getCurrentCart().items.reduce(
      (count, item) => count + item.quantity, 
      0
    );
  }

  // Calculate totals
  private calculateTotals(cart: Cart): Cart {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce(
      (total, item) => {
        const price = item.product.discountPrice || item.product.price;
        return total + (price * item.quantity);
      },
      0
    );

    // Calculate tax (10% for example)
    cart.tax = cart.subtotal * 0.10;

    // Calculate total
    cart.total = cart.subtotal + cart.tax;

    return cart;
  }

  // Update cart and save to storage
  private updateCart(cart: Cart): void {
    cart.updatedAt = new Date();
    const updatedCart = this.calculateTotals(cart);
    this.cartSubject.next(updatedCart);
    this.saveCartToStorage(updatedCart);
  }

  // Save cart to localStorage
  private saveCartToStorage(cart: Cart): void {
    try {
      // Store cart in memory (not localStorage as per restrictions)
      // In a real app with backend, you'd save to Firestore
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Get cart from storage
  private getCartFromStorage(): Cart {
    try {
      // Initialize empty cart (in real app, load from Firestore)
      return {
        userId: '',
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error loading cart:', error);
      return {
        userId: '',
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        updatedAt: new Date()
      };
    }
  }

  // Set user ID for cart
  setUserId(userId: string): void {
    const currentCart = this.getCurrentCart();
    currentCart.userId = userId;
    this.updateCart(currentCart);
  }

  // Check if product is in cart
  isInCart(productId: string): boolean {
    return this.getCurrentCart().items.some(
      item => item.product.id === productId
    );
  }

  // Get quantity of specific product in cart
  getProductQuantity(productId: string): number {
    const item = this.getCurrentCart().items.find(
      item => item.product.id === productId
    );
    return item ? item.quantity : 0;
  }
}