// FILE: src/app/pages/forgot-password/forgot-password.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  email: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.loading = true;

    try {
      await this.authService.resetPassword(this.email);
      this.successMessage = 'Password reset email sent! Check your inbox.';
      this.email = '';
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error: any) {
      this.loading = false;
      
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Too many requests. Please try again later.';
      } else {
        this.errorMessage = 'Failed to send reset email. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}