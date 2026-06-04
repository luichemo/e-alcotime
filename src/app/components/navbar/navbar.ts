import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  cartItemCount: number = 0;
  isMenuOpen: boolean = false;
  currentRoute: string = '';
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private translate: TranslateService
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
  }

  isAdminPage(): boolean {
    return this.currentRoute.startsWith('/admin');
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.closeMenu();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}