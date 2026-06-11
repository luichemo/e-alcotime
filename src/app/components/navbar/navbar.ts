import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  cartItemCount: number = 0;
  isMenuOpen: boolean = false;
  isSidebarOpen: boolean = false;
  currentRoute: string = '';
  isAdmin: boolean = false;
  isScrolled: boolean = false;

  // Search variables
  searchQuery: string = '';
  allProducts: Product[] = [];
  searchResults: Product[] = [];
  showSearchResults: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
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
    this.currentUser$ = this.authService.currentUser$;
    
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
    });

    this.currentUser$.subscribe(async (user) => {
      setTimeout(() => {
    }, 2000);
      if (user) {
        const userData = await this.authService.getUserData(user.uid).toPromise();
        this.isAdmin = userData?.role === 'admin';
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
    this.closeMenu();
  }

  onSelectProduct(productId: string): void {
    this.showSearchResults = false;
    this.searchResults = [];
    this.searchQuery = '';
    this.router.navigate(['/product', productId]);
    this.closeMenu();
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