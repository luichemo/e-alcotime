// FILE: src/app/pages/products/products.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'name';
  loading: boolean = true;

  categories = [
    { value: 'all', label: 'All Products', icon: 'bi-grid' },
    { value: 'wine', label: 'Wine', icon: 'bi-droplet' },
    { value: 'spirits', label: 'Spirits', icon: 'bi-thermometer-high' },
    { value: 'beer', label: 'Beer', icon: 'bi-moisture' },
    { value: 'champagne', label: 'Champagne', icon: 'bi-stars' },
    { value: 'other', label: 'Other', icon: 'bi-three-dots' }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for category from query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.loadProducts();
    });
  }
  getCategoryCount(category: string): number {
  if (category === 'all') return this.products.length;
  return this.products.filter(p => p.category === category).length;
}
  loadProducts(): void {
    this.loading = true;
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Sort products
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  sortProducts(products: Product[]): Product[] {
    return products.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-high':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  isInCart(product: Product): boolean {
    return this.cartService.isInCart(product.id!);
  }
}