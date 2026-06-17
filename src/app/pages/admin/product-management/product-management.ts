// FILE: src/app/pages/admin/product-management/product-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { ProductService, getSearchVariations } from '../../../services/product';
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
    category: 'wine' as 'wine' | 'beer' | 'spirits' | 'champagne' | 'whiskey' | 'cognac' | 'sparkling_wine' | 'tequila' | 'rum' | 'gin' | 'gift' | 'vape' | 'other',
    price: 0,
    discountPrice: 0,
    alcoholContent: 0,
    volume: 0,
    imageUrl: '',
    stock: 0,
    brand: '',
    country: '',
    isAvailable: true,
    nameKa: '',
    nameEn: '',
    descriptionKa: '',
    descriptionEn: '',
    brandKa: '',
    brandEn: '',
    countryKa: '',
    countryEn: '',
    technology: '',
    flavor: '',
    taste: '',
    technologyKa: '',
    technologyEn: '',
    flavorKa: '',
    flavorEn: '',
    tasteKa: '',
    tasteEn: ''
  };

  loading = false;
  translating = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';

  get filteredProducts(): Product[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.products;
    const variations = getSearchVariations(term);
    return this.products.filter(p => 
      variations.some(vTerm =>
        (p.name && p.name.toLowerCase().includes(vTerm)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(vTerm)) ||
        (p.nameKa && p.nameKa.toLowerCase().includes(vTerm)) ||
        (p.brand && p.brand.toLowerCase().includes(vTerm)) ||
        (p.brandEn && p.brandEn.toLowerCase().includes(vTerm)) ||
        (p.brandKa && p.brandKa.toLowerCase().includes(vTerm)) ||
        (p.category && p.category.toLowerCase().includes(vTerm)) ||
        (p.country && p.country.toLowerCase().includes(vTerm)) ||
        (p.countryEn && p.countryEn.toLowerCase().includes(vTerm)) ||
        (p.countryKa && p.countryKa.toLowerCase().includes(vTerm))
      )
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
      isAvailable: product.isAvailable,
      nameKa: product.nameKa || product.name || '',
      nameEn: product.nameEn || product.name || '',
      descriptionKa: product.descriptionKa || product.description || '',
      descriptionEn: product.descriptionEn || product.description || '',
      brandKa: product.brandKa || product.brand || '',
      brandEn: product.brandEn || product.brand || '',
      countryKa: product.countryKa || product.country || '',
      countryEn: product.countryEn || product.country || '',
      technology: product.technology || '',
      flavor: product.flavor || '',
      taste: product.taste || '',
      technologyKa: product.technologyKa || product.technology || '',
      technologyEn: product.technologyEn || product.technology || '',
      flavorKa: product.flavorKa || product.flavor || '',
      flavorEn: product.flavorEn || product.flavor || '',
      tasteKa: product.tasteKa || product.taste || '',
      tasteEn: product.tasteEn || product.taste || ''
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
      isAvailable: true,
      nameKa: '',
      nameEn: '',
      descriptionKa: '',
      descriptionEn: '',
      brandKa: '',
      brandEn: '',
      countryKa: '',
      countryEn: '',
      technology: '',
      flavor: '',
      taste: '',
      technologyKa: '',
      technologyEn: '',
      flavorKa: '',
      flavorEn: '',
      tasteKa: '',
      tasteEn: ''
    };
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    // Populate standard properties with English inputs prior to saving/adding.
    this.formData.name = this.formData.nameEn;
    this.formData.description = this.formData.descriptionEn;
    this.formData.brand = this.formData.brandEn;
    this.formData.country = this.formData.countryEn;
    this.formData.technology = this.formData.technologyEn;
    this.formData.flavor = this.formData.flavorEn;
    this.formData.taste = this.formData.tasteEn;

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

  async translateText(text: string): Promise<string> {
    if (!text || !text.trim()) return '';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ka&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Translation request failed');
      const data = await res.json();
      if (data && data[0]) {
        return data[0].map((x: any) => x[0]).join('');
      }
      return '';
    } catch (error) {
      console.error('Translation error:', error);
      return '';
    }
  }

  async autoTranslate(): Promise<void> {
    this.translating = true;
    this.errorMessage = '';
    try {
      const tasks = [
        { source: this.formData.nameKa, targetField: 'nameEn' },
        { source: this.formData.brandKa, targetField: 'brandEn' },
        { source: this.formData.descriptionKa, targetField: 'descriptionEn' },
        { source: this.formData.countryKa, targetField: 'countryEn' },
        { source: this.formData.technologyKa, targetField: 'technologyEn' },
        { source: this.formData.flavorKa, targetField: 'flavorEn' },
        { source: this.formData.tasteKa, targetField: 'tasteEn' },
      ];

      let translatedCount = 0;
      for (const task of tasks) {
        if (task.source && task.source.trim()) {
          const translated = await this.translateText(task.source);
          if (translated) {
            (this.formData as any)[task.targetField] = translated;
            translatedCount++;
          }
        }
      }

      if (translatedCount > 0) {
        Swal.fire({
          title: this.translateService.instant('PRODUCT_MGMT.TRANSLATION_SUCCESS_TITLE') || 'Translation Complete',
          text: this.translateService.instant('PRODUCT_MGMT.TRANSLATION_SUCCESS_TEXT') || 'Georgian values have been translated to English.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'No Text to Translate',
          text: 'Please enter values in Georgian fields first.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err: any) {
      console.error(err);
      this.errorMessage = 'Auto-translation failed. Please fill English values manually.';
    } finally {
      this.translating = false;
    }
  }
}