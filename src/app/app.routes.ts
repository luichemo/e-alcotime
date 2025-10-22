
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { Privacy } from './pages/privacy/privacy';
import { Terms } from './pages/terms/terms';
import { ForgotPassword } from './pages/forgot-password/forgot-password';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then(m => m.Products)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard]
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () => import('./pages/order-confirmation/order-confirmation').then(m => m.OrderConfirmation),
    canActivate: [authGuard]
  },
  {
    path: 'order-history',
    loadComponent: () => import('./pages/order-history/order-history').then(m => m.OrderHistory),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    component: ForgotPassword
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/product-management/product-management').then(m => m.ProductManagement)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin/order-management/order-management').then(m => m.OrderManagement)
      }
    ]
  },
  {
    path: 'terms',
    component: Terms
  },
  {
    path: 'privacy',
    component: Privacy
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];