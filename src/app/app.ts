// FILE: src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar';
import { footerComponent } from "./components/footer/footer";
import { AgeVerification } from './components/age-verification/age-verification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, footerComponent, AgeVerification],
  template: `
    <app-age-verification></app-age-verification>
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer *ngIf="!isAdminRoute"></app-footer>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'alcohol-store';
  isAdminRoute: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check initial route
    this.isAdminRoute = this.router.url.startsWith('/admin');

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute = event.url.startsWith('/admin');
    });
  }
}