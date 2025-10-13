

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cart } from '../../models/cart.model';
import { Address } from '../../models/user.model';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  cart: Cart | null = null;
  currentStep: number = 1;
  
  // Shipping Info
  shippingAddress: Address = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };

  // Payment Info
  paymentMethod: string = 'credit-card';
  
  loading: boolean = false;
  errorMessage: string = '';
  userEmail: string = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (!cart || cart.items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userEmail = user.email || '';
      }
    });
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.validateShipping()) {
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateShipping(): boolean {
    if (!this.shippingAddress.street || !this.shippingAddress.city || 
        !this.shippingAddress.state || !this.shippingAddress.zipCode || 
        !this.shippingAddress.country) {
      this.errorMessage = 'Please fill in all shipping address fields';
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  async placeOrder(): Promise<void> {
    if (!this.cart || this.cart.items.length === 0) {
      this.errorMessage = 'Your cart is empty';
      return;
    }

    if (!this.validateShipping()) {
      this.currentStep = 1;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const user = await this.authService.currentUser$.toPromise();
      
      if (!user) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
        return;
      }

      const orderId = await this.orderService.createOrder(
        user.uid,
        this.userEmail,
        this.cart,
        this.shippingAddress,
        this.paymentMethod
      );

      // Clear cart after successful order
      this.cartService.clearCart();

      // Redirect to success page (or show success message)
      alert(`Order placed successfully! Order ID: ${orderId}`);
      this.router.navigate(['/products']);

    } catch (error: any) {
      this.loading = false;
      this.errorMessage = error.message || 'Failed to place order. Please try again.';
      console.error('Order error:', error);
    }
  }

  getShippingFee(): number {
    return 0.00; // Fixed shipping fee
  }

  getFinalTotal(): number {
    return this.cart ? this.cart.total + this.getShippingFee() : 0;
  }
}