import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  dateOfBirth: string = '';
  agreeTerms: boolean = false;
  
  maxDate!: Date;
  startAtDate!: Date;

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.startAtDate = this.maxDate;
  }

  onDateChange(event: any): void {
    const date: Date = event.value;
    if (date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      this.dateOfBirth = `${year}-${month}-${day}`;
    } else {
      this.dateOfBirth = '';
    }
  }

  getDateObject(): Date | null {
    if (!this.dateOfBirth) return null;
    const parts = this.dateOfBirth.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(this.dateOfBirth);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

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
}