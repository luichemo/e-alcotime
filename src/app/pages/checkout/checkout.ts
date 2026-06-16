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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  cart: Cart | null = null;
  currentStep: number = 1;
  
  shippingAddress: Address = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  };

  paymentMethod: string = 'cash-on-delivery';
  
  // Card details
  cardDetails = {
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  };
  
  loading: boolean = false;
  errorMessage: string = '';
  userEmail: string = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
        if (!cart || cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      });

    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userEmail = user.email || '';
        
        const userData = await firstValueFrom(this.authService.getUserData(user.uid));
        if (userData) {
          this.shippingAddress.fullName = userData.displayName || '';
          this.shippingAddress.phone = userData.phoneNumber || '';
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
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
      if (this.paymentMethod === 'credit-card' && !this.validateCard()) {
        return;
      }
      this.currentStep = 3;
      this.errorMessage = '';
    }
  }

  validateCard(): boolean {
    const card = this.cardDetails;
    if (!card.cardName || !card.cardNumber || !card.cardExpiry || !card.cardCvv) {
      this.errorMessage = this.translateService.instant('CHECKOUT.ERROR_CARD_FIELDS');
      return false;
    }
    const numberClean = card.cardNumber.replace(/\s+/g, '');
    if (numberClean.length < 15 || numberClean.length > 16 || isNaN(Number(numberClean))) {
      this.errorMessage = this.translateService.instant('CHECKOUT.ERROR_CARD_NUMBER');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.cardExpiry)) {
      this.errorMessage = this.translateService.instant('CHECKOUT.ERROR_EXPIRY_FORMAT');
      return false;
    }
    if (card.cardCvv.length < 3 || card.cardCvv.length > 4 || isNaN(Number(card.cardCvv))) {
      this.errorMessage = this.translateService.instant('CHECKOUT.ERROR_CVV_FORMAT');
      return false;
    }
    return true;
  }

  formatCardNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 16) {
      input = input.substring(0, 16);
    }
    const parts = [];
    for (let i = 0; i < input.length; i += 4) {
      parts.push(input.substring(i, i + 4));
    }
    this.cardDetails.cardNumber = parts.join(' ');
  }

  formatExpiry(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 4) {
      input = input.substring(0, 4);
    }
    if (input.length > 2) {
      this.cardDetails.cardExpiry = input.substring(0, 2) + '/' + input.substring(2);
    } else {
      this.cardDetails.cardExpiry = input;
    }
  }

  formatCvv(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 4) {
      input = input.substring(0, 4);
    }
    this.cardDetails.cardCvv = input;
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
      this.errorMessage = this.translateService.instant('CHECKOUT.ERROR_SHIPPING_FIELDS');
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  async placeOrder(): Promise<void> {
    if (!this.cart || this.cart.items.length === 0) {
      this.errorMessage = this.translateService.instant('CHECKOUT.ERROR_CART_EMPTY');
      return;
    }

    if (!this.validateShipping()) {
      this.currentStep = 1;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const user = this.authService.getCurrentUser();
      
      if (!user) {
        this.loading = false;
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

      this.cartService.clearCart();

      this.loading = false;

      this.router.navigate(['/order-confirmation', orderId]);

    } catch (error: any) {
      this.loading = false;
      this.errorMessage = error.message || this.translateService.instant('CHECKOUT.ERROR_PLACE_ORDER_FAILED');
      console.error('Order error:', error);
    }
  }

  getShippingFee(): number {
    return 0.00; 
  }

  getFinalTotal(): number {
    return this.cart ? this.cart.total + this.getShippingFee() : 0;
  }

  getCartItemsCount(): number {
    return this.cart ? this.cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }
}