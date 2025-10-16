// FILE: src/app/pages/product-detail/product-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  quantity: number = 1;
  loading: boolean = true;
  addedToCart: boolean = false;
  isDescriptionExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }
  
  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  loadProduct(id: string): void {
    this.loading = true;
    // Reset quantity when loading a new product
    this.quantity = 1;
    
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.loadRelatedProducts(product.category);
        } else {
          this.router.navigate(['/products']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.router.navigate(['/products']);
        this.loading = false;
      }
    });
  }

  loadRelatedProducts(category: string): void {
    this.productService.getProductsByCategory(category).subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter(p => p.id !== this.product?.id)
          .slice(0, 4);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    this.quantity--;
  }
  
  clearCart(): void {
    this.cartService.clearCart();
  }

  isCartNotEmpty(): boolean {
    return this.cartService.getItemCount() > 0;
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.addedToCart = true;
      
      setTimeout(() => {
        this.addedToCart = false;
      }, 2000);
    }
  }

  isInCart(): boolean {
    return this.product ? this.cartService.isInCart(this.product.id!) : false;
  }

  getCartQuantity(): number {
    return this.product ? this.cartService.getProductQuantity(this.product.id!) : 0;
  }
}