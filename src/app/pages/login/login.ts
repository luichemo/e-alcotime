import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/';
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = this.translateService.instant('AUTH.ERROR_ENTER_FIELDS');
      return;
    }

    this.loading = true;

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.loading = false;
      
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_USER_NOT_FOUND');
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_WRONG_PASSWORD');
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_INVALID_EMAIL');
      } else if (error.code === 'auth/user-disabled') {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_USER_DISABLED');
      } else {
        this.errorMessage = this.translateService.instant('AUTH.ERROR_LOGIN_FAILED');
      }
    }
  }
}