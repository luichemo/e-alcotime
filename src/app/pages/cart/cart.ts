import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
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

  async clearCart(): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove all items from your cart.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      this.cartService.clearCart();
      Swal.fire('Cleared!', 'Your cart has been emptied.', 'success');
    }
  }

  getItemTotal(item: CartItem): number {
    const price = item.product.discountPrice || item.product.price;
    return price * item.quantity;
  }
}