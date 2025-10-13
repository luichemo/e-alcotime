// FILE: src/app/app.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { footerComponent } from "./components/footer/footer";
import { AgeVerification } from './components/age-verification/age-verification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, footerComponent, AgeVerification],
  template: `
  <app-age-verification></app-age-verification>
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
  styles: []
})
export class AppComponent {
  title = 'alcohol-store';
}