import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  dateOfBirth: string = '';
  agreeTerms: boolean = false;
  
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

    if (!this.displayName || !this.email || !this.password || !this.dateOfBirth) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_REQUIRED_FIELDS');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_PASSWORDS_MISMATCH');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_PASSWORD_LENGTH');
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_AGREE_TERMS');
      return;
    }

    const birthDate = new Date(this.dateOfBirth);
    const age = this.calculateAge(birthDate);
    
    if (age < 18) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_UNDERAGE');
      return;
    }

    this.loading = true;

    try {
      await this.authService.register(
        this.email,
        this.password,
        this.displayName,
        birthDate,
        this.phoneNumber || undefined
      );

      this.successMessage = this.translateService.instant('AUTH.SUCCESS_REGISTRATION');
      
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);

    } catch (error: any) {
      this.loading = false;
      
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_EMAIL_IN_USE');
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_INVALID_EMAIL');
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_WEAK_PASSWORD');
      } else {
        this.errorMessage = error.message || this.translateService.instant('AUTH.ERROR_REGISTRATION_FAILED');
      }
    }
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getMaxDate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }
}