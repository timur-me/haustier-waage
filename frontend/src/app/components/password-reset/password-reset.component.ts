import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmailService } from '../../services/email.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { NotificationComponent } from '../notification/notification.component';
import { catchError, timeout, throwError } from 'rxjs';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ThemeToggleComponent,
    NotificationComponent,
  ],
  template: `
    <div
      class="min-h-screen bg-gray-100 dark:bg-dark-primary transition-colors"
    >
      <!-- Theme toggle in top-right corner -->
      <div class="absolute top-4 right-4">
        <app-theme-toggle />
      </div>

      <!-- Notification Component -->
      <app-notification />

      <!-- Centered Form -->
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
              {{ token ? 'Reset Your Password' : 'Reset Password' }}
            </h2>
            <p
              class="mt-2 text-sm text-gray-600 dark:text-dark-muted"
              *ngIf="!token"
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <!-- Form -->
          <div class="mt-8">
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
              <div class="rounded-md shadow-sm space-y-4">
                <!-- Email field (for requesting reset) -->
                <div *ngIf="!token">
                  <label
                    for="email"
                    class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="input w-full"
                    [class.border-red-500]="
                      resetForm.get('email')?.invalid &&
                      resetForm.get('email')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      resetForm.get('email')?.invalid &&
                      resetForm.get('email')?.touched
                    "
                    class="text-red-500 text-sm mt-1"
                  >
                    Please enter a valid email address
                  </div>
                </div>

                <!-- Password fields (for resetting) -->
                <div *ngIf="token" class="space-y-4">
                  <div>
                    <label
                      for="password"
                      class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1"
                    >
                      New Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      formControlName="password"
                      class="input w-full"
                      [class.border-red-500]="
                        resetForm.get('password')?.invalid &&
                        resetForm.get('password')?.touched
                      "
                    />
                  </div>

                  <div>
                    <label
                      for="confirmPassword"
                      class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      formControlName="confirmPassword"
                      class="input w-full"
                      [class.border-red-500]="
                        resetForm.hasError('mismatch') &&
                        resetForm.get('confirmPassword')?.touched
                      "
                    />
                    <div
                      *ngIf="
                        resetForm.hasError('mismatch') &&
                        resetForm.get('confirmPassword')?.touched
                      "
                      class="text-red-500 text-sm mt-1"
                    >
                      Passwords do not match
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="mt-6">
                <button
                  type="submit"
                  [disabled]="resetForm.invalid || isLoading"
                  class="btn btn-primary w-full flex justify-center items-center"
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
                  {{
                    isLoading
                      ? 'Processing...'
                      : token
                      ? 'Reset Password'
                      : 'Send Reset Link'
                  }}
                </button>
              </div>
            </form>

            <!-- Links -->
            <div class="mt-6 text-center text-sm">
              <a
                routerLink="/login"
                class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Back to login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService,
    private notificationService: NotificationService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');

    if (this.token) {
      this.resetForm = this.fb.group(
        {
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', [Validators.required]],
        },
        { validator: this.passwordMatchValidator }
      );
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  async onSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;

    if (this.token) {
      // Reset password
      try {
        const resetObservable = this.emailService.resetPassword(
          this.token,
          this.resetForm.get('password')?.value
        );

        resetObservable
          .pipe(
            timeout(7500),
            catchError((error) => {
              let errorMessage = 'Failed to reset password';
              if (error.name === 'TimeoutError') {
                errorMessage = 'Request timed out. Please try again.';
              } else if (error.status === 400) {
                errorMessage =
                  'Invalid or expired reset link. Please request a new one.';
              } else {
                errorMessage = error.error?.detail || errorMessage;
              }
              this.notificationService.showError(errorMessage);
              return throwError(() => error);
            })
          )
          .subscribe({
            next: () => {
              this.notificationService.showSuccess(
                'Password reset successfully. You can now login with your new password.'
              );
              this.router.navigate(['/login']);
            },
            error: () => {
              this.isLoading = false;
            },
          });
      } catch (error) {
        this.isLoading = false;
        this.notificationService.showError(
          'An error occurred. Please try again.'
        );
      }
    } else {
      // Request password reset
      const email = this.resetForm.get('email')?.value;
      console.log('Requesting password reset for:', email);

      this.emailService
        .sendPasswordResetEmail(email)
        .pipe(
          timeout(7500),
          catchError((error) => {
            let errorMessage = 'Failed to send reset email';
            if (error.name === 'TimeoutError') {
              errorMessage = 'Request timed out. Please try again.';
            } else {
              errorMessage = error.error?.detail || errorMessage;
            }
            this.notificationService.showError(errorMessage);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Password reset response:', response);
            this.notificationService.showSuccess(
              'If an account exists with this email, you will receive a password reset link shortly. Please check your email.'
            );
            this.resetForm.reset();
          },
          error: () => {
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    }
  }
}
