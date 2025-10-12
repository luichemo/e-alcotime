// FILE: src/app/pages/register/register.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.displayName || !this.email || !this.password || !this.dateOfBirth) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = 'You must agree to the terms and conditions';
      return;
    }

    // Check age
    const birthDate = new Date(this.dateOfBirth);
    const age = this.calculateAge(birthDate);
    
    if (age < 18) {
      this.errorMessage = 'You must be at least 18 years old to register';
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

      this.successMessage = 'Registration successful! Redirecting...';
      
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);

    } catch (error: any) {
      this.loading = false;
      
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Password is too weak';
      } else {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
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