import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const emailVerifiedGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Email verified guard running...'); // Debug log
  const isVerified = await authService.isEmailVerified();
  console.log('Email verification status:', isVerified); // Debug log

  // If trying to access verify-email-notice while verified, redirect to main page
  if (isVerified && state.url === '/verify-email-notice') {
    console.log('Email already verified, redirecting to main page...'); // Debug log
    await router.navigate(['/']);
    return false;
  }

  // For other routes, require email verification
  if (!isVerified) {
    console.log('Email not verified, redirecting to notice page...'); // Debug log
    await router.navigate(['/verify-email-notice']);
    return false;
  }

  console.log('Email verified, allowing access...'); // Debug log
  return true;
};
