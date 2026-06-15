// FILE: src/app/pages/admin/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../models/product.model';
import { Order } from '../../../models/order.model';
import { OrderService } from '../../../services/order';
import { ProductService } from '../../../services/product';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
  seeding: boolean = false;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
    }, 500);
    this.loadDashboardData();
  }

  async seedSampleProducts(): Promise<void> {
    const result = await Swal.fire({
      title: this.translateService.instant('ADMIN_PANEL.SEED_CONFIRM_TITLE'),
      text: this.translateService.instant('ADMIN_PANEL.SEED_CONFIRM_TEXT'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('ADMIN_PANEL.SEED_CONFIRM_YES'),
      cancelButtonText: this.translateService.instant('ADMIN_PANEL.SEED_CONFIRM_CANCEL'),
      confirmButtonColor: '#ad8d66',
      cancelButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    this.seeding = true;
    try {
      const sampleProducts: Omit<Product, 'id'>[] = [
        {
          name: "Château Margaux 2015",
          brand: "Château Margaux",
          country: "France",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "wine",
          price: 1200,
          discountPrice: 1100,
          alcoholContent: 13.5,
          volume: 0.75,
          imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600",
          stock: 8,
          isAvailable: true
        },
        {
          name: "Cloudy Bay Sauvignon Blanc",
          brand: "Cloudy Bay",
          country: "New Zealand",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "wine",
          price: 95,
          discountPrice: 85,
          alcoholContent: 13,
          volume: 0.75,
          imageUrl: "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?q=80&w=600",
          stock: 24,
          isAvailable: true
        },
        {
          name: "Macallan 18 Year Double Cask",
          brand: "The Macallan",
          country: "Scotland",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "spirits",
          price: 420,
          discountPrice: 0,
          alcoholContent: 43,
          volume: 0.7,
          imageUrl: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600",
          stock: 12,
          isAvailable: true
        },
        {
          name: "Grey Goose L'Orange Vodka",
          brand: "Grey Goose",
          country: "France",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "spirits",
          price: 85,
          discountPrice: 75,
          alcoholContent: 40,
          volume: 1.0,
          imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=600",
          stock: 15,
          isAvailable: true
        },
        {
          name: "Hendrick's Gin",
          brand: "Hendrick's",
          country: "Scotland",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "spirits",
          price: 90,
          discountPrice: 80,
          alcoholContent: 41.4,
          volume: 0.7,
          imageUrl: "https://images.unsplash.com/photo-1608885898957-a599fb1698d6?q=80&w=600",
          stock: 18,
          isAvailable: true
        },
        {
          name: "Chimay Blue Grande Réserve",
          brand: "Chimay",
          country: "Belgium",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "beer",
          price: 18,
          discountPrice: 15,
          alcoholContent: 9,
          volume: 0.33,
          imageUrl: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=600",
          stock: 40,
          isAvailable: true
        },
        {
          name: "BrewDog Punk IPA",
          brand: "BrewDog",
          country: "United Kingdom",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "beer",
          price: 9,
          discountPrice: 0,
          alcoholContent: 5.4,
          volume: 0.33,
          imageUrl: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?q=80&w=600",
          stock: 60,
          isAvailable: true
        },
        {
          name: "Dom Pérignon Vintage 2012",
          brand: "Dom Pérignon",
          country: "France",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "champagne",
          price: 350,
          discountPrice: 320,
          alcoholContent: 12.5,
          volume: 0.75,
          imageUrl: "https://images.unsplash.com/photo-1594487523089-f4c7ab536a7b?q=80&w=600",
          stock: 10,
          isAvailable: true
        },
        {
          name: "Veuve Clicquot Yellow Label",
          brand: "Veuve Clicquot",
          country: "France",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "champagne",
          price: 160,
          discountPrice: 145,
          alcoholContent: 12,
          volume: 0.75,
          imageUrl: "https://images.unsplash.com/photo-1516596429074-ba3b3b43e8e7?q=80&w=600",
          stock: 20,
          isAvailable: true
        },
        {
          name: "Aperol Aperitivo",
          brand: "Aperol",
          country: "Italy",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
          category: "other",
          price: 48,
          discountPrice: 42,
          alcoholContent: 11,
          volume: 0.7,
          imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600",
          stock: 30,
          isAvailable: true
        }
      ];

      for (const p of sampleProducts) {
        await this.productService.addProduct(p);
      }

      await Swal.fire({
        title: this.translateService.instant('ADMIN_PANEL.SEED_SUCCESS_TITLE'),
        text: this.translateService.instant('ADMIN_PANEL.SEED_SUCCESS_TEXT'),
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      this.loadDashboardData();
    } catch (error: any) {
      console.error('Seeding error:', error);
      await Swal.fire({
        title: this.translateService.instant('ADMIN_PANEL.SEED_FAIL_TITLE'),
        text: error.message || 'Something went wrong while seeding.',
        icon: 'error'
      });
    } finally {
      this.seeding = false;
    }
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