import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThemeToggleComponent],
  template: `
    <div
      class="min-h-screen bg-gray-50 dark:bg-dark-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="text-center">
          <img
            src="assets/images/logo.svg"
            alt="Logo"
            class="mx-auto h-24 w-24 mb-4"
          />
          <h2 class="text-3xl font-bold text-gray-900 dark:text-dark-text">
            Create your account
          </h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Already have an account?
            <a
              routerLink="/login"
              class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </a>
          </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div
            class="bg-white dark:bg-dark-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10"
          >
            <form (ngSubmit)="register()" class="space-y-6">
              <!-- Username field -->
              <div>
                <label
                  for="username"
                  class="block text-sm font-medium text-gray-700 dark:text-dark-text"
                >
                  Username
                </label>
                <div class="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    [(ngModel)]="username"
                    class="input w-full"
                    [class.border-red-500]="error && error.includes('username')"
                  />
                </div>
              </div>

              <!-- Email field -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 dark:text-dark-text"
                >
                  Email address
                </label>
                <div class="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    [(ngModel)]="email"
                    (input)="validateEmail()"
                    class="input w-full"
                    [class.border-red-500]="emailError"
                  />
                </div>
                <p *ngIf="emailError" class="text-red-500 text-sm mt-1">
                  {{ emailError }}
                </p>
              </div>

              <!-- Password field -->
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700 dark:text-dark-text"
                >
                  Password
                </label>
                <div class="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    [(ngModel)]="password"
                    class="input w-full"
                    [class.border-red-500]="error && error.includes('password')"
                  />
                </div>
              </div>

              <!-- Confirm Password field -->
              <div>
                <label
                  for="confirmPassword"
                  class="block text-sm font-medium text-gray-700 dark:text-dark-text"
                >
                  Confirm Password
                </label>
                <div class="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    [(ngModel)]="confirmPassword"
                    class="input w-full"
                    [class.border-red-500]="error && error.includes('password')"
                  />
                </div>
              </div>

              <!-- Error message -->
              <div
                *ngIf="error"
                class="text-red-500 text-sm mt-2 animate-fadeIn"
              >
                {{ error }}
              </div>

              <!-- Submit button -->
              <div>
                <button
                  type="submit"
                  [disabled]="isLoading || !!emailError"
                  class="w-full btn btn-primary relative"
                  [class.opacity-50]="isLoading || !!emailError"
                >
                  <span [class.opacity-0]="isLoading">Create Account</span>
                  <!-- Loading spinner -->
                  <div
                    *ngIf="isLoading"
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <svg
                      class="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                  </div>
                </button>
              </div>
            </form>

            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div
                    class="w-full border-t border-gray-300 dark:border-gray-600"
                  ></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span
                    class="px-2 bg-white dark:bg-dark-secondary text-gray-500 dark:text-dark-muted"
                  >
                    Need help?
                  </span>
                </div>
              </div>

              <div class="mt-6 flex justify-center text-sm">
                <a
                  routerLink="/forgot-password"
                  class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot your password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme toggle in top-right corner -->
      <div class="fixed top-4 right-4">
        <app-theme-toggle />
      </div>
    </div>
  `,
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  error = '';
  emailError = '';

  constructor(private authService: AuthService, private router: Router) {}

  validateEmail() {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.email) {
      this.emailError = 'Email is required';
    } else if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  async register() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.emailError) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.register(this.username, this.email, this.password);
      this.router.navigate(['/animals']);
    } catch (error: any) {
      this.error = error.error?.detail || 'Failed to register';
    } finally {
      this.isLoading = false;
    }
  }
}
