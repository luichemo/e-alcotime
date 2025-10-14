// FILE: src/app/pages/checkout/checkout.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
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
export class Checkout implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  cart: Cart | null = null;
  currentStep: number = 1;
  
  // Shipping Info
  shippingAddress: Address = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
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
    // Subscribe to cart
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
        if (!cart || cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      });

    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userEmail = user.email || '';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.validateShipping()) {
      this.currentStep = 2;
      this.errorMessage = '';
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
      this.errorMessage = '';
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  validateShipping(): boolean {
    if (!this.shippingAddress.fullName || !this.shippingAddress.phone ||
        !this.shippingAddress.street || !this.shippingAddress.city || 
        !this.shippingAddress.state || !this.shippingAddress.zipCode || 
        !this.shippingAddress.country) {
      this.errorMessage = 'Please fill in all shipping address fields';
      return false;
    }
    this.errorMessage = '';
    return true;
  }

// FILE: src/app/pages/checkout/checkout.component.ts
// Update the placeOrder() method:

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
    const user = await firstValueFrom(this.authService.currentUser$);
    
    if (!user) {
      this.loading = false;
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Create the order
    const orderId = await this.orderService.createOrder(
      user.uid,
      this.userEmail,
      this.cart,
      this.shippingAddress,
      this.paymentMethod
    );

    // Clear cart after successful order
    this.cartService.clearCart();

    this.loading = false;

    // ✅ Redirect to order confirmation page instead of alert
    this.router.navigate(['/order-confirmation', orderId]);

  } catch (error: any) {
    this.loading = false;
    this.errorMessage = error.message || 'Failed to place order. Please try again.';
    console.error('Order error:', error);
  }
}

  getShippingFee(): number {
    return 0.00; // Free shipping
  }

  getFinalTotal(): number {
    return this.cart ? this.cart.total + this.getShippingFee() : 0;
  }
}