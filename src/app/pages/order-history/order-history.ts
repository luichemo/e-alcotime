import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
    private authService: AuthService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadUserOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserOrders(): void {
    this.loading = true;

    try {
      const user = this.authService.getCurrentUser();

      if (!user) {
        this.error = this.translateService.instant('ORDER_HISTORY.ERROR_LOGIN_REQUIRED');
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
            this.error = this.translateService.instant('ORDER_HISTORY.ERROR_LOAD_ORDERS_FAILED');
            this.loading = false;
          }
        });
    } catch (error) {
      console.error('Error getting user:', error);
      this.error = this.translateService.instant('ORDER_HISTORY.ERROR_LOAD_ORDERS_FAILED');
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
    const title = this.translateService.instant('ORDER_HISTORY.CANCEL_CONFIRM_TITLE');
    const text = this.translateService.instant('ORDER_HISTORY.CANCEL_CONFIRM_TEXT_REVERT');
    const confirmButtonText = this.translateService.instant('ORDER_HISTORY.CANCEL_CONFIRM_YES_EXCLAMATION');

    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ad8d66",
      cancelButtonColor: "#d33",
      confirmButtonText
    });

    if (result.isConfirmed) {
      try {
        await this.orderService.updateOrderStatus(orderId, 'cancelled');
        const successTitle = this.translateService.instant('ORDER_HISTORY.CANCEL_SUCCESS_TITLE');
        const successText = this.translateService.instant('ORDER_HISTORY.CANCEL_SUCCESS_TEXT_CONFIRM');
        await Swal.fire({
          title: successTitle,
          text: successText,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        this.loadUserOrders();
      } catch (err: any) {
        console.error('Failed to cancel order:', err);
        const errorTitle = this.translateService.instant('ORDER_HISTORY.CANCEL_ERROR_TITLE');
        const errorText = this.translateService.instant('ORDER_HISTORY.CANCEL_ERROR_TEXT');
        Swal.fire({
          title: errorTitle,
          text: errorText,
          icon: "error"
        });
      }
    }
  }
}