import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../../services/email.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 flex items-center justify-center relative"
    >
      <!-- Theme Toggle -->
      <div class="absolute top-4 right-4">
        <app-theme-toggle />
      </div>

      <div class="w-full max-w-md px-6 py-8">
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center"
        >
          <!-- Logo -->
          <img
            src="assets/images/logo.svg"
            alt="Pet Weight Monitor"
            class="w-24 h-24 mx-auto mb-6"
          />

          <!-- Loading State -->
          <div *ngIf="isLoading" class="space-y-4">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
            ></div>
            <p class="text-gray-600 dark:text-gray-300">{{ message }}</p>
          </div>

          <!-- Success State -->
          <div *ngIf="!isLoading && isVerified" class="space-y-6">
            <div class="text-green-500 dark:text-green-400">
              <svg
                class="h-16 w-16 mx-auto animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ message }}
            </h2>
            <button
              (click)="goToLogin()"
              class="w-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Continue to Login
            </button>
          </div>

          <!-- Error State -->
          <div *ngIf="!isLoading && !isVerified && error" class="space-y-6">
            <div class="text-red-500 dark:text-red-400">
              <svg
                class="h-16 w-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-red-600 dark:text-red-400">
              {{ error }}
            </h2>
            <button
              (click)="goToLogin()"
              class="w-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  isVerified = false;
  error = '';
  message = 'Verifying your email...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.error = 'Invalid verification link';
      return;
    }

    this.verifyEmail(token);
  }

  verifyEmail(token: string) {
    this.emailService.verifyEmail(token).subscribe({
      next: () => {
        this.isLoading = false;
        this.isVerified = true;
        this.message = 'Your email has been verified!';
        this.notificationService.showSuccess('Email verified successfully');
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error.detail || 'Failed to verify email';
        this.message = 'Email verification failed';
        this.notificationService.showError(this.error);
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
