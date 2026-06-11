import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { Observable, map } from 'rxjs';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  featuredProducts$: Observable<Product[]> | null = null;
  isAuthenticated$: Observable<boolean>;
  currentYear: number = new Date().getFullYear();

  // Mobile search variables
  searchQuery: string = '';
  allProducts: Product[] = [];
  searchResults: Product[] = [];
  showSearchResults: boolean = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchResults = false;
    }
  }

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }

  ngOnInit(): void {
    this.loadFeaturedProducts();

    // Preload products once for high-performance instant filtering in home mobile search
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
      },
      error: (error) => {
        console.error('Error loading products for home mobile search:', error);
      }
    });
  }

  loadFeaturedProducts(): void {
    this.featuredProducts$ = this.productService.getFeaturedProducts(8);
  }

  onSearchInput(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.searchResults = this.allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    ).slice(0, 5);

    this.showSearchResults = true;
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim()) {
      this.showSearchResults = true;
    }
  }

  onSearchSubmit(): void {
    const query = this.searchQuery.trim();
    if (!query) return;

    this.showSearchResults = false;
    this.searchResults = [];
    this.router.navigate(['/products'], { queryParams: { search: query } });
    this.searchQuery = '';
  }

  onSelectProduct(productId: string): void {
    this.showSearchResults = false;
    this.searchResults = [];
    this.searchQuery = '';
    this.router.navigate(['/product', productId]);
  }
}