import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css'
})
export class OrderConfirmation implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  order: Order | null = null;
  orderId: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.orderId) {
      this.error = this.translateService.instant('ORDER_CONFIRMATION.ERROR_ID_NOT_FOUND');
      this.loading = false;
      return;
    }
    
    this.loadOrderDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrderDetails(): void {
    this.orderService.getOrderById(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          
          if (!this.order) {
            this.error = this.translateService.instant('ORDER_CONFIRMATION.ERROR_ORDER_NOT_FOUND');
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.error = this.translateService.instant('ORDER_CONFIRMATION.ERROR_LOAD_FAILED');
          this.loading = false;
        }
      });
  }

  getOrderItemsCount(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getEstimatedDeliveryDate(): string {
    if (!this.order) return '';
    
    const orderDate = this.order.createdAt.toDate();
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    
    const locale = this.translateService.currentLang === 'ka' ? 'ka-GE' : 'en-US';
    return deliveryDate.toLocaleDateString(locale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  printOrder(): void {
    window.print();
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}