import { TestBed } from '@angular/core/testing';
import { CartService } from './cart';
import { Product } from '../models/product.model';

describe('CartService', () => {
  let service: CartService;
  
  const mockProduct: Product = {
    id: 'p1',
    name: 'Test Wine',
    description: 'A test wine description',
    category: 'wine',
    price: 100,
    discountPrice: 80,
    alcoholContent: 12.5,
    volume: 750,
    imageUrl: 'http://test.com/image.jpg',
    stock: 10,
    brand: 'Test Brand',
    country: 'Italy',
    isAvailable: true
  };

  const mockProduct2: Product = {
    id: 'p2',
    name: 'Test Beer',
    description: 'A test beer description',
    category: 'beer',
    price: 10,
    discountPrice: 0,
    alcoholContent: 5.0,
    volume: 330,
    imageUrl: 'http://test.com/beer.jpg',
    stock: 5,
    brand: 'Test Brand 2',
    country: 'Belgium',
    isAvailable: true
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.removeItem('alcotime_cart');
    
    TestBed.configureTestingModule({
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.removeItem('alcotime_cart');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty cart', () => {
    const cart = service.getCurrentCart();
    expect(cart.items.length).toBe(0);
    expect(cart.subtotal).toBe(0);
    expect(cart.total).toBe(0);
  });

  it('should add a product to the cart with correct total based on discount price', () => {
    service.addToCart(mockProduct, 1);
    
    const cart = service.getCurrentCart();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].product.id).toBe('p1');
    expect(cart.items[0].quantity).toBe(1);
    // Should use the discountPrice (80) instead of standard price (100)
    expect(cart.subtotal).toBe(80);
    expect(cart.total).toBe(80);
  });

  it('should use standard price if no discountPrice exists', () => {
    service.addToCart(mockProduct2, 2);
    
    const cart = service.getCurrentCart();
    expect(cart.subtotal).toBe(20); // 10 * 2
    expect(cart.total).toBe(20);
  });

  it('should increment quantity when adding the same product', () => {
    service.addToCart(mockProduct, 1);
    service.addToCart(mockProduct, 2);
    
    const cart = service.getCurrentCart();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.subtotal).toBe(240); // 80 * 3
  });

  it('should update quantity correctly', () => {
    service.addToCart(mockProduct, 1);
    service.updateQuantity('p1', 5);
    
    const cart = service.getCurrentCart();
    expect(cart.items[0].quantity).toBe(5);
    expect(cart.subtotal).toBe(400); // 80 * 5
  });

  it('should remove item if quantity updated to 0 or less', () => {
    service.addToCart(mockProduct, 1);
    service.updateQuantity('p1', 0);
    
    const cart = service.getCurrentCart();
    expect(cart.items.length).toBe(0);
  });

  it('should remove a product from the cart', () => {
    service.addToCart(mockProduct, 1);
    service.addToCart(mockProduct2, 1);
    service.removeFromCart('p1');
    
    const cart = service.getCurrentCart();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].product.id).toBe('p2');
    expect(cart.subtotal).toBe(10);
  });

  it('should clear the cart', () => {
    service.addToCart(mockProduct, 2);
    service.clearCart();
    
    const cart = service.getCurrentCart();
    expect(cart.items.length).toBe(0);
    expect(cart.subtotal).toBe(0);
    expect(cart.total).toBe(0);
  });

  it('should identify if an item is in the cart', () => {
    service.addToCart(mockProduct, 1);
    expect(service.isInCart('p1')).toBeTrue();
    expect(service.isInCart('p2')).toBeFalse();
  });
});
