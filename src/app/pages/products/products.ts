import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';

interface PriceRange {
  min: number;
  max: number;
  label: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'name';
  loading: boolean = true;

  showOnSale: boolean = false;
  selectedBrands: string[] = [];
  selectedPriceRange: string = 'all';
  minAlcoholContent: number = 0;
  maxAlcoholContent: number = 100;
  selectedVolumes: number[] = [];
  selectedCountries: string[] = [];
  inStockOnly: boolean = false;

  availableBrands: string[] = [];
  availableCountries: string[] = [];
  availableVolumes: number[] = [];

  priceRanges: PriceRange[] = [
    { min: 0, max: 999999, label: 'All Prices' },
    { min: 0, max: 20, label: 'Under ₾20' },
    { min: 20, max: 50, label: '₾20 - ₾50' },
    { min: 50, max: 100, label: '₾50 - ₾100' },
    { min: 100, max: 200, label: '₾100 - ₾200' },
    { min: 200, max: 999999, label: 'Over ₾200' }
  ];

  categories = [
    { value: 'all', label: 'All Products', icon: 'bi-grid' },
    { value: 'wine', label: 'Wine', icon: 'bi-droplet' },
    { value: 'spirits', label: 'Spirits', icon: 'bi-thermometer-high' },
    { value: 'beer', label: 'Beer', icon: 'bi-moisture' },
    { value: 'champagne', label: 'Champagne', icon: 'bi-stars' },
    { value: 'other', label: 'Other', icon: 'bi-three-dots' }
  ];

  showFilters: boolean = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.loadProducts();
    });
  }

  getCategoryCount(category: string): number {
    if (category === 'all') return this.products.length;
    return this.products.filter(p => p.category === category).length;
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.extractFilterOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  extractFilterOptions(): void {
    this.availableBrands = [...new Set(this.products.map(p => p.brand))].sort();
    
    this.availableCountries = [...new Set(this.products.map(p => p.country))].sort();
    
    this.availableVolumes = [...new Set(this.products.map(p => p.volume))].sort((a, b) => a - b);
  }

  applyFilters(): void {
    let filtered = [...this.products];

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.showOnSale) {
      filtered = filtered.filter(p => p.discountPrice && p.discountPrice < p.price);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.country.toLowerCase().includes(term)
      );
    }

    if (this.selectedBrands.length > 0) {
      filtered = filtered.filter(p => this.selectedBrands.includes(p.brand));
    }

    if (this.selectedPriceRange !== 'all') {
      const range = this.priceRanges.find(r => 
        `${r.min}-${r.max}` === this.selectedPriceRange
      );
      if (range) {
        filtered = filtered.filter(p => {
          const price = p.discountPrice || p.price;
          return price >= range.min && price <= range.max;
        });
      }
    }

    filtered = filtered.filter(p => 
      p.alcoholContent >= this.minAlcoholContent && 
      p.alcoholContent <= this.maxAlcoholContent
    );

    if (this.selectedVolumes.length > 0) {
      filtered = filtered.filter(p => this.selectedVolumes.includes(p.volume));
    }

    if (this.selectedCountries.length > 0) {
      filtered = filtered.filter(p => this.selectedCountries.includes(p.country));
    }

    if (this.inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  sortProducts(products: Product[]): Product[] {
    return products.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-high':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'alcohol-low':
          return a.alcoholContent - b.alcoholContent;
        case 'alcohol-high':
          return b.alcoholContent - a.alcoholContent;
        default:
          return 0;
      }
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleOnSale(): void {
    this.showOnSale = !this.showOnSale;
    this.applyFilters();
  }

  toggleBrand(brand: string): void {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters();
  }

  onPriceRangeChange(): void {
    this.applyFilters();
  }

  onAlcoholContentChange(): void {
    this.applyFilters();
  }

  toggleVolume(volume: number): void {
    const index = this.selectedVolumes.indexOf(volume);
    if (index > -1) {
      this.selectedVolumes.splice(index, 1);
    } else {
      this.selectedVolumes.push(volume);
    }
    this.applyFilters();
  }

  toggleCountry(country: string): void {
    const index = this.selectedCountries.indexOf(country);
    if (index > -1) {
      this.selectedCountries.splice(index, 1);
    } else {
      this.selectedCountries.push(country);
    }
    this.applyFilters();
  }

  toggleStockFilter(): void {
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.showOnSale = false;
    this.selectedBrands = [];
    this.selectedPriceRange = 'all';
    this.minAlcoholContent = 0;
    this.maxAlcoholContent = 100;
    this.selectedVolumes = [];
    this.selectedCountries = [];
    this.inStockOnly = false;
    this.sortBy = 'name';
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCategory !== 'all') count++;
    if (this.showOnSale) count++;
    if (this.selectedBrands.length > 0) count += this.selectedBrands.length;
    if (this.selectedPriceRange !== 'all') count++;
    if (this.minAlcoholContent > 0 || this.maxAlcoholContent < 100) count++;
    if (this.selectedVolumes.length > 0) count += this.selectedVolumes.length;
    if (this.selectedCountries.length > 0) count += this.selectedCountries.length;
    if (this.inStockOnly) count++;
    return count;
  }

  toggleFiltersPanel(): void {
    this.showFilters = !this.showFilters;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  isInCart(product: Product): boolean {
    return this.cartService.isInCart(product.id!);
  }

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands.includes(brand);
  }

  isVolumeSelected(volume: number): boolean {
    return this.selectedVolumes.includes(volume);
  }

  isCountrySelected(country: string): boolean {
    return this.selectedCountries.includes(country);
  }
}