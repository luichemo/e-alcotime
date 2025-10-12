// FILE: src/app/pages/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { Observable, map } from 'rxjs';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  featuredProducts$: Observable<Product[]> | null = null;
  isAuthenticated$: Observable<boolean>;
  currentYear: number = new Date().getFullYear();

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {
    // Check authentication by mapping currentUser$ to boolean
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.featuredProducts$ = this.productService.getFeaturedProducts(8);
  }
}