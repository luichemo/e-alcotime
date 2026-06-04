import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { Observable, map } from 'rxjs';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class footerComponent implements OnInit {
  featuredProducts$: Observable<Product[]> | null = null;
  isAuthenticated$: Observable<boolean>;
  currentYear: number = new Date().getFullYear();

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {
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