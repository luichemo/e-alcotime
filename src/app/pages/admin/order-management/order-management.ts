
// FILE: src/app/pages/admin/orders/orders.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Order } from '../../../models/order.model';
import { OrderService } from '../../../services/order';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.html',
  styleUrl: './order-management.css'
})
export class OrderManagement implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;

  loading: boolean = true;
  searchTerm: string = '';
  filterStatus: string = 'all';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    setTimeout(() => {
    }, 1000);
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.filterStatus);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id?.toLowerCase().includes(term) ||
        order.userEmail.toLowerCase().includes(term) ||
        order.shippingAddress.fullName.toLowerCase().includes(term)
      );
    }

    this.filteredOrders = filtered;
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPaginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  async updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<void> {
    try {
      await this.orderService.updateOrderStatus(orderId, newStatus);

      // Update local order
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        this.closeOrderDetails();
      }

      // Update selected order if it's the one being updated
      if (this.selectedOrder?.id === orderId) {
        this.selectedOrder.status = newStatus;
        this.closeOrderDetails();
      }
  
      this.applyFilters();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
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

  // Stats for dashboard cards
  getOrderStats() {
    return {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      processing: this.orders.filter(o => o.status === 'processing').length,
      shipped: this.orders.filter(o => o.status === 'shipped').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled').length
    };
  }

  getTotalRevenue(): number {
    return this.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
  }

  exportOrders(): void {
    // Simple CSV export
    const headers = ['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date'];
    const rows = this.filteredOrders.map(order => [
      order.id?.slice(0, 8) || '',
      order.shippingAddress.fullName,
      order.userEmail,
      this.getOrderItemsCount(order),
      order.total.toFixed(2),
      order.status,
      order.createdAt.toDate().toLocaleDateString()
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}