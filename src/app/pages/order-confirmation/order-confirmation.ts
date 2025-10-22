// FILE: src/app/pages/order-confirmation/order-confirmation.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.orderId) {
      this.error = 'Order ID not found';
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
            this.error = 'Order not found';
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.error = 'Failed to load order details';
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
    
    return deliveryDate.toLocaleDateString('en-US', { 
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