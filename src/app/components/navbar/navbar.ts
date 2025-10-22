// FILE: src/app/components/navbar/navbar.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    });

    // Track current route
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    // Check if user is admin
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