// FILE: src/app/pages/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.loading = true;

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.loading = false;
      
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        this.errorMessage = 'This account has been disabled';
      } else {
        this.errorMessage = 'Login failed. Please try again.';
      }
    }
  }
}