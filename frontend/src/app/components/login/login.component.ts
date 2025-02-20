import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent, RouterLink],
  template: `
    <div
      class="min-h-screen bg-gray-100 dark:bg-dark-primary transition-colors"
    >
      <!-- Minimal Header -->
      <div class="absolute top-4 right-4">
        <app-theme-toggle />
      </div>

      <!-- Centered Login Form -->
      <div class="min-h-screen flex flex-col items-center justify-center px-4">
        <div class="max-w-sm w-full space-y-8">
          <!-- App Name -->
          <div class="text-center">
            <h1
              class="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2"
            >
              Pet Weight Monitor
            </h1>
            <h2 class="text-xl text-gray-600 dark:text-dark-muted">
              Sign in to continue
            </h2>
          </div>

          <!-- Login Form -->
          <div
            class="bg-white dark:bg-dark-secondary p-8 rounded-lg shadow-md animate-fadeIn"
          >
            <form class="space-y-6" (ngSubmit)="login()">
              <div class="space-y-4">
                <div>
                  <label for="username" class="sr-only">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    [(ngModel)]="username"
                    class="input appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all"
                    placeholder="Username"
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
                    class="input appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-dark-text rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div
                *ngIf="error"
                class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm text-center animate-fadeIn"
                role="alert"
              >
                {{ error }}
              </div>

              <div>
                <button
                  type="submit"
                  [disabled]="isLoading"
                  class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span
                    class="absolute left-0 inset-y-0 flex items-center pl-3"
                  >
                    <svg
                      *ngIf="!isLoading"
                      class="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <svg
                      *ngIf="isLoading"
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
                  </span>
                  {{ isLoading ? 'Signing in...' : 'Sign in' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Links -->
          <div class="flex flex-col items-center space-y-2 text-sm">
            <a
              routerLink="/forgot-password"
              class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot your password?
            </a>
            <div class="text-gray-600 dark:text-dark-muted">
              Don't have an account?
              <a
                routerLink="/register"
                class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.login(this.username, this.password);
      this.router.navigate(['/animals']);
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }
}
