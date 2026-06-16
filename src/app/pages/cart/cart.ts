import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Cart, CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartData: Cart | null = null;

  constructor(
    private cartService: CartService,
    private translateService: TranslateService
  ) {}

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

  async removeItem(productId: string): Promise<void> {
    const title = this.translateService.instant('CART.CLEAR_CONFIRM_TITLE');
    const text = this.translateService.instant('CART.REMOVE_CONFIRM');
    const confirmButtonText = this.translateService.instant('CART.CLEAR_CONFIRM_YES');
    const cancelButtonText = this.translateService.instant('CART.CLEAR_CONFIRM_CANCEL');

    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText
    });

    if (result.isConfirmed) {
      this.cartService.removeFromCart(productId);
    }
  }

  async clearCart(): Promise<void> {
    const title = this.translateService.instant('CART.CLEAR_CONFIRM_TITLE');
    const text = this.translateService.instant('CART.CLEAR_CONFIRM_TEXT');
    const confirmButtonText = this.translateService.instant('CART.CLEAR_CONFIRM_YES');
    const cancelButtonText = this.translateService.instant('CART.CLEAR_CONFIRM_CANCEL');

    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText
    });

    if (result.isConfirmed) {
      this.cartService.clearCart();
      const successTitle = this.translateService.instant('CART.CLEAR_SUCCESS_TITLE');
      const successText = this.translateService.instant('CART.CLEAR_SUCCESS_TEXT');
      Swal.fire(successTitle, successText, 'success');
    }
  }

  getItemTotal(item: CartItem): number {
    const price = item.product.discountPrice || item.product.price;
    return price * item.quantity;
  }

  getCartItemsCount(): number {
    return this.cartData ? this.cartData.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }
}