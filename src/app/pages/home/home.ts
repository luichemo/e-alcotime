import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { ProductService, getSearchVariations } from '../../services/product';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private discountedProductsSubject = new BehaviorSubject<Product[]>([]);
  discountedProducts$: Observable<Product[]> = this.discountedProductsSubject.asObservable();
  isAuthenticated$: Observable<boolean>;
  currentYear: number = new Date().getFullYear();

  // Mobile search variables
  searchQuery: string = '';
  allProducts: Product[] = [];
  searchResults: Product[] = [];
  showSearchResults: boolean = false;

  private autoplayIntervalId: any = null;
  canScrollLeft: boolean = false;
  canScrollRight: boolean = false;
  imgLoaded: { [id: string]: boolean } = {};

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchResults = false;
    }
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    this.checkScrollLimits();
  }

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }

  ngOnInit(): void {
    // Single Firestore read — reuse for both discounted carousel and mobile search
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        // Derive discounted products in-memory (no extra Firestore read)
        const discounted = products
          .filter(p => !!p.discountPrice && p.discountPrice < p.price)
          .slice(0, 8);
        this.discountedProductsSubject.next(discounted);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });

    this.startAutoplay();

    // Recalculate scroll limits after products load and render
    setTimeout(() => {
      this.checkScrollLimits();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  // Discounted products are now derived in ngOnInit from the single getAvailableProducts() call

  getDiscountPercentage(product: Product): number {
    if (!product.price || !product.discountPrice) return 0;
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  isInCart(product: Product): boolean {
    return this.cartService.isInCart(product.id!);
  }

  @ViewChild('productCarouselContainer') productCarouselContainer!: ElementRef<HTMLDivElement>;

  scrollProducts(direction: 'left' | 'right'): void {
    if (!this.productCarouselContainer) return;
    const container = this.productCarouselContainer.nativeElement;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    this.resetAutoplay();
    // Update scroll limits after manual interaction
    setTimeout(() => this.checkScrollLimits(), 300);
  }

  startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayIntervalId = setInterval(() => {
      this.autoScrollProducts();
    }, 5000);
  }

  stopAutoplay(): void {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = null;
    }
  }

  resetAutoplay(): void {
    this.startAutoplay();
  }

  autoScrollProducts(): void {
    if (!this.productCarouselContainer) return;
    const container = this.productCarouselContainer.nativeElement;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    if (maxScrollLeft <= 0) return;

    if (container.scrollLeft >= maxScrollLeft - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
    // Update scroll limits after autoplay scroll begins
    setTimeout(() => this.checkScrollLimits(), 300);
  }

  checkScrollLimits(): void {
    if (!this.productCarouselContainer) return;
    const container = this.productCarouselContainer.nativeElement;
    this.canScrollLeft = container.scrollLeft > 5;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    this.canScrollRight = container.scrollLeft < maxScrollLeft - 5;
  }

  onSearchInput(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    const variations = getSearchVariations(query);
    this.searchResults = this.allProducts.filter(product => 
      variations.some(term =>
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.nameEn && product.nameEn.toLowerCase().includes(term)) ||
        (product.nameKa && product.nameKa.toLowerCase().includes(term)) ||
        (product.brand && product.brand.toLowerCase().includes(term)) ||
        (product.brandEn && product.brandEn.toLowerCase().includes(term)) ||
        (product.brandKa && product.brandKa.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term))
      )
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