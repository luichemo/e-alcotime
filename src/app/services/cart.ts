
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

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.getCurrentCart();
    const existingItemIndex = currentCart.items.findIndex(
      item => item.product.id === product.id
    );

    if (existingItemIndex > -1) {
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      currentCart.items.push({ product, quantity });
    }

    this.updateCart(currentCart);
  }

  removeFromCart(productId: string): void {
    const currentCart = this.getCurrentCart();
    currentCart.items = currentCart.items.filter(
      item => item.product.id !== productId
    );
    this.updateCart(currentCart);
  }

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

  getItemCount(): number {
    return this.getCurrentCart().items.reduce(
      (count, item) => count + item.quantity, 
      0
    );
  }

  private calculateTotals(cart: Cart): Cart {
    cart.subtotal = cart.items.reduce(
      (total, item) => {
        const price = item.product.discountPrice || item.product.price;
        return total + (price * item.quantity);
      },
      0
    );

    cart.tax = cart.subtotal * 0;

    cart.total = cart.subtotal + cart.tax;

    return cart;
  }

  private updateCart(cart: Cart): void {
    cart.updatedAt = new Date();
    const updatedCart = this.calculateTotals(cart);
    this.cartSubject.next(updatedCart);
    this.saveCartToStorage(updatedCart);
  }

  private saveCartToStorage(cart: Cart): void {
    try {
      console.log('Saving cart to localStorage:', cart);
      localStorage.setItem('alcotime_cart', JSON.stringify(cart));
      console.log('Cart saved successfully');
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  private getCartFromStorage(): Cart {
    try {
      console.log('Loading cart from localStorage...');
      const savedCart = localStorage.getItem('alcotime_cart');
      
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        cart.updatedAt = new Date(cart.updatedAt);
        cart.items.forEach((item: any) => {
          if (item.product.createdAt) {
            item.product.createdAt = new Date(item.product.createdAt);
          }
          if (item.product.updatedAt) {
            item.product.updatedAt = new Date(item.product.updatedAt);
          }
        });
        return cart;
      }
      
      console.log('No saved cart found, returning empty cart');
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
  setUserId(userId: string): void {
    const currentCart = this.getCurrentCart();
    currentCart.userId = userId;
    this.updateCart(currentCart);
  }

  isInCart(productId: string): boolean {
    return this.getCurrentCart().items.some(
      item => item.product.id === productId
    );
  }

  getProductQuantity(productId: string): number {
    const item = this.getCurrentCart().items.find(
      item => item.product.id === productId
    );
    return item ? item.quantity : 0;
  }
}