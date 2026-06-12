// FILE: src/app/pages/admin/product-management/product-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './product-management.html',
  styleUrls: ['./product-management.css']
})
export class ProductManagement implements OnInit {
  products: Product[] = [];
  showAddModal = false;
  editingProduct: Product | null = null;

  // Form fields
  formData = {
    name: '',
    description: '',
    category: 'wine' as 'wine' | 'beer' | 'spirits' | 'champagne' | 'whiskey' | 'cognac' | 'sparkling_wine' | 'tequila' | 'rum' | 'gin' | 'other',
    price: 0,
    discountPrice: 0,
    alcoholContent: 0,
    volume: 0,
    imageUrl: '',
    stock: 0,
    brand: '',
    country: '',
    isAvailable: true
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';

  get filteredProducts(): Product[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.products;
    return this.products.filter(p => 
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.brand && p.brand.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.country && p.country.toLowerCase().includes(term))
    );
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  // Pagination
  currentPage = 1;
  pageSize = 8;

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProducts.length);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  constructor(
    private productService: ProductService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {

    this.loadProducts();
  }

  loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          this.products = products;
          this.currentPage = 1;
          resolve();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.errorMessage = this.translateService.instant('PRODUCT_MGMT.ERROR_LOAD_FAILED');
          reject(error);
        }
      });
    });
  }

  openAddModal(): void {
    this.resetForm();
    this.editingProduct = null;
    this.showAddModal = true;
  }

  openEditModal(product: Product): void {
    this.editingProduct = product;
    this.formData = {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      alcoholContent: product.alcoholContent,
      volume: product.volume,
      imageUrl: product.imageUrl,
      stock: product.stock,
      brand: product.brand,
      country: product.country,
      isAvailable: product.isAvailable
    };
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
    this.errorMessage = '';
  }

  resetForm(): void {
    this.formData = {
      name: '',
      description: '',
      category: 'wine',
      price: 0,
      discountPrice: 0,
      alcoholContent: 0,
      volume: 0,
      imageUrl: '',
      stock: 0,
      brand: '',
      country: '',
      isAvailable: true
    };
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const saveOperation = this.editingProduct && this.editingProduct.id
      ? this.productService.updateProduct(this.editingProduct.id, this.formData)
      : this.productService.addProduct(this.formData);

    saveOperation.then(() => {
      this.loading = false;
      this.successMessage = this.editingProduct
        ? this.translateService.instant('PRODUCT_MGMT.SUCCESS_UPDATE')
        : this.translateService.instant('PRODUCT_MGMT.SUCCESS_ADD');

      // Close modal immediately
      this.closeModal();

      // Reload products
      this.loadProducts();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }).catch((error: any) => {
      this.loading = false;
      this.errorMessage = error.message || this.translateService.instant('PRODUCT_MGMT.ERROR_SAVE_FAILED');
    });
  }

  deleteProduct(product: Product): void {
    if (!product.id) return;
    Swal.fire({
      title: this.translateService.instant('PRODUCT_MGMT.DELETE_CONFIRM_TITLE'),
      text: this.translateService.instant('PRODUCT_MGMT.DELETE_CONFIRM_TEXT'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: this.translateService.instant('PRODUCT_MGMT.DELETE_CONFIRM_YES'),
      cancelButtonText: this.translateService.instant('PRODUCT_MGMT.DELETE_CONFIRM_CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: this.translateService.instant('PRODUCT_MGMT.DELETE_SUCCESS_TITLE'),
          text: this.translateService.instant('PRODUCT_MGMT.DELETE_SUCCESS_TEXT'),
          icon: "success"
        });
        this.productService.deleteProduct(product.id).then(() => {
          this.successMessage = this.translateService.instant('PRODUCT_MGMT.SUCCESS_DELETE');
          this.loadProducts();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }).catch((error: any) => {
          this.errorMessage = error.message || this.translateService.instant('PRODUCT_MGMT.ERROR_DELETE_FAILED');
        });
      }
    });

  }

  toggleAvailability(product: Product): void {
    if (!product.id) return;

    this.productService.updateProduct(product.id, {
      isAvailable: !product.isAvailable
    }).then(() => {
      this.loadProducts();
    }).catch((error: any) => {
      this.errorMessage = error.message || this.translateService.instant('PRODUCT_MGMT.ERROR_UPDATE_FAILED');
    });
  }
}