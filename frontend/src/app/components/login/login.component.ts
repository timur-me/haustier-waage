import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ThemeToggleComponent,
    RouterLink,
    NotificationComponent,
  ],
  template: `
    <div
      class="min-h-screen bg-gray-100 dark:bg-dark-primary transition-colors"
    >
      <!-- Minimal Header -->
      <div class="absolute top-4 right-4">
        <app-theme-toggle />
      </div>

      <!-- Notification Component -->
      <app-notification />

      <!-- Centered Login Form -->
      <div
        class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div class="max-w-md w-full space-y-8">
          <!-- Logo and Title -->
          <div class="text-center">
            <img
              class="mx-auto h-24 w-auto"
              src="assets/images/logo.svg"
              alt="Pet Weight Monitor"
            />
            <h2
              class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-dark-text"
            >
              Sign in to your account
            </h2>
          </div>

          <!-- Error message -->
          <div
            *ngIf="error"
            class="bg-red-50 dark:bg-red-900/20 p-4 rounded-md"
          >
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <!-- Login Form -->
          <div class="mt-8">
            <form
              #loginForm="ngForm"
              class="space-y-4"
              (ngSubmit)="onSubmit(loginForm)"
              novalidate
            >
              <div>
                <label for="username" class="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  [(ngModel)]="username"
                  class="input w-full"
                  placeholder="Username"
                  [disabled]="isLoading"
                />
              </div>
              <div>
                <label for="password" class="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  [(ngModel)]="password"
                  class="input w-full"
                  placeholder="Password"
                  [disabled]="isLoading"
                />
              </div>

              <!-- Login Button -->
              <div class="mt-4">
                <button
                  type="submit"
                  [disabled]="isLoading || !loginForm.form.valid"
                  class="btn btn-primary w-full flex justify-center items-center"
                >
                  <span *ngIf="isLoading" class="animate-spin mr-2">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  {{ isLoading ? 'Signing in...' : 'Sign in' }}
                </button>
              </div>
            </form>

            <!-- Links -->
            <div class="mt-6 text-center text-sm space-y-2">
              <p class="text-gray-600 dark:text-dark-muted">
                Don't have an account?
                <a
                  routerLink="/register"
                  class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Register
                </a>
              </p>
              <p>
                <a
                  routerLink="/forgot-password"
                  class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot your password?
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Check for redirected username (from username change)
    const redirectUsername = localStorage.getItem('redirectUsername');
    if (redirectUsername) {
      this.username = redirectUsername;
      localStorage.removeItem('redirectUsername'); // Clear it after use
    }

    // If user is already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  async onSubmit(form: any) {
    if (!form.valid) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.login(this.username, this.password);
      this.notificationService.showSuccess('Successfully logged in');
      this.router.navigate(['/']);
    } catch (error: any) {
      this.error = error.message || 'An error occurred during login';
      this.isLoading = false;
      form.form.setErrors({ invalidLogin: true });
    }
  }
}
