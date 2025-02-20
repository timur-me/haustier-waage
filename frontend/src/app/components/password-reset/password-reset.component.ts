import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-dark-primary"
    >
      <div
        class="w-full max-w-md transform transition-all duration-300 ease-in-out hover:scale-[1.02]"
      >
        <div
          class="bg-white dark:bg-dark-secondary rounded-lg shadow-xl overflow-hidden transition-colors"
        >
          <div class="px-8 pt-8 pb-4">
            <h2
              class="text-center text-3xl font-extrabold text-gray-900 dark:text-dark-text animate-fadeIn"
            >
              {{ token ? 'Reset Your Password' : 'Forgot Password' }}
            </h2>
            <p
              class="mt-2 text-center text-sm text-gray-600 dark:text-dark-muted animate-slideUp"
            >
              {{
                token
                  ? 'Enter your new password below'
                  : 'Enter your email to receive a reset link'
              }}
            </p>
          </div>

          <form
            *ngIf="!token"
            class="px-8 pb-8 space-y-6"
            (ngSubmit)="requestReset()"
          >
            <div class="animate-slideUp" style="animation-delay: 100ms">
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                [(ngModel)]="email"
                class="appearance-none rounded-lg relative block w-full px-4 py-3 border 
                       border-gray-300 dark:border-gray-600 dark:bg-dark-primary 
                       placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 
                       dark:text-dark-text focus:outline-none focus:ring-2 
                       focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                [class.shake]="error"
              />
            </div>

            <div class="animate-slideUp" style="animation-delay: 200ms">
              <button
                type="submit"
                [disabled]="isLoading"
                class="w-full flex justify-center py-3 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 
                       dark:hover:bg-blue-600 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 
                       transition-all duration-200 transform hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  *ngIf="isLoading"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
              </button>
            </div>
          </form>

          <form
            *ngIf="token"
            class="px-8 pb-8 space-y-6"
            (ngSubmit)="confirmReset()"
          >
            <div class="animate-slideUp" style="animation-delay: 100ms">
              <label for="password" class="sr-only">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                [(ngModel)]="password"
                class="appearance-none rounded-lg relative block w-full px-4 py-3 border 
                       border-gray-300 dark:border-gray-600 dark:bg-dark-primary 
                       placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 
                       dark:text-dark-text focus:outline-none focus:ring-2 
                       focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition-all duration-200"
                placeholder="Enter new password"
                [class.shake]="error"
              />
            </div>

            <div class="animate-slideUp" style="animation-delay: 150ms">
              <label for="confirm-password" class="sr-only"
                >Confirm New Password</label
              >
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                [(ngModel)]="confirmPassword"
                class="appearance-none rounded-lg relative block w-full px-4 py-3 border 
                       border-gray-300 dark:border-gray-600 dark:bg-dark-primary 
                       placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 
                       dark:text-dark-text focus:outline-none focus:ring-2 
                       focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition-all duration-200"
                placeholder="Confirm new password"
                [class.shake]="error"
              />
            </div>

            <div class="animate-slideUp" style="animation-delay: 200ms">
              <button
                type="submit"
                [disabled]="isLoading"
                class="w-full flex justify-center py-3 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 
                       dark:hover:bg-blue-600 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 
                       transition-all duration-200 transform hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  *ngIf="isLoading"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                {{ isLoading ? 'Resetting...' : 'Reset Password' }}
              </button>
            </div>
          </form>

          <div
            class="text-center pb-8 animate-slideUp"
            style="animation-delay: 250ms"
          >
            <p class="text-sm text-gray-600 dark:text-dark-muted">
              Remember your password?
              <a
                href="#"
                class="font-medium text-blue-600 hover:text-blue-500 
                       dark:text-blue-400 dark:hover:text-blue-300"
                (click)="login($event)"
              >
                Sign in
              </a>
            </p>
          </div>

          <div *ngIf="error" class="px-8 pb-8">
            <div
              class="text-red-500 dark:text-red-400 text-sm text-center animate-fadeIn"
            >
              {{ error }}
            </div>
          </div>

          <div *ngIf="success" class="px-8 pb-8">
            <div
              class="text-green-500 dark:text-green-400 text-sm text-center animate-fadeIn"
            >
              {{ success }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-10px);
        }
        75% {
          transform: translateX(10px);
        }
      }
      .shake {
        animation: shake 0.5s ease-in-out;
      }
    `,
  ],
})
export class PasswordResetComponent {
  email = '';
  password = '';
  confirmPassword = '';
  token: string | null = null;
  isLoading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Check for reset token in URL
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || null;
    });
  }

  requestReset() {
    if (!this.email.trim()) {
      this.error = 'Please enter your email';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    this.authService.requestPasswordReset(this.email.trim()).subscribe({
      next: (response) => {
        this.success = response.message;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Password reset request error:', error);
        this.error =
          error.error?.detail || 'Failed to send reset link. Please try again.';
        this.isLoading = false;
      },
    });
  }

  confirmReset() {
    if (!this.password || !this.confirmPassword) {
      this.error = 'Please enter both passwords';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (!this.token) {
      this.error = 'Invalid reset token';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    this.authService.confirmPasswordReset(this.token, this.password).subscribe({
      next: (response) => {
        this.success = response.message;
        this.isLoading = false;
        // Redirect to login after a short delay
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        console.error('Password reset confirmation error:', error);
        this.error =
          error.error?.detail || 'Failed to reset password. Please try again.';
        this.isLoading = false;
      },
    });
  }

  login(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
