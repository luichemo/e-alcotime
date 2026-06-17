import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ProductService, getSearchVariations } from '../../services/product';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  cartItemCount: number = 0;
  isMenuOpen: boolean = false;
  isSidebarOpen: boolean = false;
  currentRoute: string = '';
  isAdmin: boolean = false;
  isScrolled: boolean = false;

  private subNavbarAutoplayIntervalId: any = null;
  canScrollLeft: boolean = false;
  canScrollRight: boolean = false;

  // Search variables
  searchQuery: string = '';
  allProducts: Product[] = [];
  searchResults: Product[] = [];
  showSearchResults: boolean = false;
  isMobileSearchOpen: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    this.checkScrollLimits();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container') && !target.closest('.mobile-search-overlay')) {
      this.showSearchResults = false;
    }
  }

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private translate: TranslateService,
    private productService: ProductService
  ) {
    this.currentUser$ = this.authService.getCurrentUserData();
    
    // Set default and active languages
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('alcotime_lang') || 'en';
    this.translate.use(savedLang);
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('alcotime_lang', lang);
  }

  getCurrentLang(): string {
    return this.translate.currentLang || 'en';
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    });

    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      this.isMobileSearchOpen = false;
    });

    this.currentUser$.subscribe((user) => {
      if (user) {
        this.isAdmin = user.role === 'admin';
      } else {
        this.isAdmin = false;
      }
    });

    // Preload products once for high-performance instant filtering in navbar
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
      },
      error: (error) => {
        console.error('Error loading products for navbar search:', error);
      }
    });

    this.startSubNavbarAutoplay();

    // Check initial scroll limits after rendering has completed
    setTimeout(() => {
      this.checkScrollLimits();
    }, 500);
  }

  ngOnDestroy(): void {
    this.stopSubNavbarAutoplay();
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

  openMobileSearch(): void {
    this.isMobileSearchOpen = true;
    this.closeMenu();
    this.isSidebarOpen = false;
    setTimeout(() => {
      const inputEl = document.querySelector('.mobile-search-input') as HTMLInputElement;
      if (inputEl) {
        inputEl.focus();
      }
    }, 100);
  }

  closeMobileSearch(): void {
    this.isMobileSearchOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  clearSearchQuery(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
    const inputEl = document.querySelector('.mobile-search-input') as HTMLInputElement;
    if (inputEl) {
      inputEl.focus();
    }
  }

  onSearchSubmit(): void {
    const query = this.searchQuery.trim();
    if (!query) return;

    this.showSearchResults = false;
    this.searchResults = [];
    this.router.navigate(['/products'], { queryParams: { search: query } });
    this.searchQuery = '';
    this.isMobileSearchOpen = false;
    this.closeMenu();
  }

  onSelectProduct(productId: string): void {
    this.showSearchResults = false;
    this.searchResults = [];
    this.searchQuery = '';
    this.isMobileSearchOpen = false;
    this.router.navigate(['/product', productId]);
    this.closeMenu();
  }

  scrollSubNavbar(direction: 'left' | 'right'): void {
    const container = document.querySelector('.sub-navbar-container');
    if (!container) return;
    const scrollAmount = 250; // smooth scroll step
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    this.resetSubNavbarAutoplay();
    // Update scroll limits after manual interaction
    setTimeout(() => this.checkScrollLimits(), 300);
  }

  startSubNavbarAutoplay(): void {
    this.stopSubNavbarAutoplay();
    this.subNavbarAutoplayIntervalId = setInterval(() => {
      this.autoScrollSubNavbar();
    }, 5000);
  }

  stopSubNavbarAutoplay(): void {
    if (this.subNavbarAutoplayIntervalId) {
      clearInterval(this.subNavbarAutoplayIntervalId);
      this.subNavbarAutoplayIntervalId = null;
    }
  }

  resetSubNavbarAutoplay(): void {
    this.startSubNavbarAutoplay();
  }

  autoScrollSubNavbar(): void {
    const container = document.querySelector('.sub-navbar-container');
    if (!container) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    if (maxScrollLeft <= 0) return;

    if (container.scrollLeft >= maxScrollLeft - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: 250, behavior: 'smooth' });
    }
    // Update scroll limits after autoplay scroll begins
    setTimeout(() => this.checkScrollLimits(), 300);
  }

  checkScrollLimits(): void {
    const container = document.querySelector('.sub-navbar-container');
    if (!container) return;
    this.canScrollLeft = container.scrollLeft > 5;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    this.canScrollRight = container.scrollLeft < maxScrollLeft - 5;
  }

  isAdminPage(): boolean {
    return this.currentRoute.startsWith('/admin');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  toggleMenu(): void {
    this.toggleSidebar();
  }

  closeMenu(): void {
    this.closeSidebar();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.closeMenu();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}