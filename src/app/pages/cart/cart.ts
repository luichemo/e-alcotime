// FILE: src/app/pages/cart/cart.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Cart, CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartData: Cart | null = null;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartData = cart;
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.product.stock) {
      this.updateQuantity(item.product.id!, item.quantity + 1);
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item.product.id!, item.quantity - 1);
    }
  }

  removeItem(productId: string): void {
    if (confirm('Remove this item from cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  getItemTotal(item: CartItem): number {
    const price = item.product.discountPrice || item.product.price;
    return price * item.quantity;
  }
}