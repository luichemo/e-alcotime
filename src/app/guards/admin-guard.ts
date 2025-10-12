import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = await authService.isAdmin();
  
  if (isAdmin) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};