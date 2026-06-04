// FILE: src/app/pages/forgot-password/forgot-password.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
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
    private router: Router,
    private translateService: TranslateService
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_EMAIL_REQUIRED');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_EMAIL_INVALID');
      return;
    }

    this.loading = true;

    try {
      await this.authService.resetPassword(this.email);
      this.successMessage = this.translateService.instant('AUTH.SUCCESS_RESET_EMAIL');
      this.email = '';
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error: any) {
      this.loading = false;
      
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_RESET_USER_NOT_FOUND');
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_INVALID_EMAIL');
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_TOO_MANY_REQUESTS');
      } else {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_RESET_FAILED');
      }
    } finally {
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}