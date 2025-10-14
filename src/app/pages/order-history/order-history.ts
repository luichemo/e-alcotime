// FILE: src/app/pages/order-history/order-history.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistory implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
    }, 500);
    this.loadUserOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadUserOrders(): Promise<void> {
    this.loading = true;
    
    try {
      const user = await firstValueFrom(this.authService.currentUser$);
      
      if (!user) {
        this.error = 'Please log in to view your orders';
        this.loading = false;
        return;
      }

      this.orderService.getUserOrders(user.uid)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (orders) => {
            this.orders = orders;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading orders:', error);
            this.error = 'Failed to load orders';
            this.loading = false;
          }
        });
    } catch (error) {
      console.error('Error getting user:', error);
      this.error = 'Failed to load orders';
      this.loading = false;
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'pending': 'bi-clock',
      'processing': 'bi-arrow-repeat',
      'shipped': 'bi-truck',
      'delivered': 'bi-check-circle',
      'cancelled': 'bi-x-circle'
    };
    return statusIcons[status] || 'bi-question-circle';
  }

  getOrderItemsCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'pending' || order.status === 'processing';
  }

  async cancelOrder(orderId: string): Promise<void> {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await this.orderService.updateOrderStatus(orderId, 'cancelled');
      
      // Update local order
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'cancelled';
      }
      
      // Update selected order if it's the one being cancelled
      if (this.selectedOrder?.id === orderId) {
        this.selectedOrder.status = 'cancelled';
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please contact support.');
    }
  }
}