// FILE: src/app/pages/admin/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../models/product.model';
import { Order } from '../../../models/order.model';
import { OrderService } from '../../../services/order';
import { ProductService } from '../../../services/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  totalProducts: number = 0;
  totalOrders: number = 0;
  pendingOrders: number = 0;
  totalRevenue: number = 0;
  
  recentOrders: Order[] = [];
  lowStockProducts: Product[] = [];
  
  loading: boolean = true;

  constructor(
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
    }, 500);
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load products
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
        this.lowStockProducts = products
          .filter(p => p.stock < 10 && p.stock > 0)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });

    // Load orders
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.totalOrders = orders.length;
        this.pendingOrders = orders.filter(o => o.status === 'pending').length;
        this.totalRevenue = orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, order) => sum + order.total, 0);
        
        this.recentOrders = orders.slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
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
}