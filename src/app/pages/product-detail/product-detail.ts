import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
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
  imgLoaded: { [id: string]: boolean } = {};

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

  getRating(): number {
    if (!this.product) return 0;
    const val = this.product.alcoholContent || 0;
    if (val <= 4) return 1.5;
    if (val >= 40) return 5;
    const calculated = 1.5 + ((val - 4) / 36) * 3.5;
    return Math.round(calculated * 2) / 2;
  }

  getStarsArray(): string[] {
    const rating = this.getRating();
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push('bi-star-fill');
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push('bi-star-half');
      } else {
        stars.push('bi-star');
      }
    }
    return stars;
  }

  loadProduct(id: string): void {
    this.loading = true;
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
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  clearCart(): void {
    this.cartService.clearCart();
  }

  isCartNotEmpty(): boolean {
    return this.cartService.getItemCount() > 0;
  }

  addToCart(product?: Product): void {
    if (product) {
      this.cartService.addToCart(product, 1);
    } else if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.addedToCart = true;
      
      setTimeout(() => {
        this.addedToCart = false;
      }, 2000);
    }
  }

  isInCart(product?: Product): boolean {
    if (product) {
      return this.cartService.isInCart(product.id!);
    }
    return this.product ? this.cartService.isInCart(this.product.id!) : false;
  }

  getCartQuantity(): number {
    return this.product ? this.cartService.getProductQuantity(this.product.id!) : 0;
  }

  getDiscountPercentage(product: Product): number {
    if (!product.price || !product.discountPrice) return 0;
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }
}