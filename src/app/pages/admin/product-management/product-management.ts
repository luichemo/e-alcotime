// FILE: src/app/pages/admin/product-management/product-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    category: 'wine' as 'wine' | 'beer' | 'spirits' | 'champagne' | 'other',
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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {

    this.loadProducts();
  }

  loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          this.products = products;
          resolve();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.errorMessage = 'Failed to load products';
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
        ? 'Product updated successfully!' 
        : 'Product added successfully!';
      
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
      this.errorMessage = error.message || 'Failed to save product';
    });
  }

  deleteProduct(product: Product): void {
    if (!product.id) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).then(() => {
        this.successMessage = 'Product deleted successfully!';
        this.loadProducts();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }).catch((error: any) => {
        this.errorMessage = error.message || 'Failed to delete product';
      });
    }
  }

  toggleAvailability(product: Product): void {
    if (!product.id) return;
    
    this.productService.updateProduct(product.id, {
      isAvailable: !product.isAvailable
    }).then(() => {
      this.loadProducts();
    }).catch((error: any) => {
      this.errorMessage = error.message || 'Failed to update product';
    });
  }
}