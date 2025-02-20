import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../../services/email.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ message }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="flex justify-center">
            <div
              *ngIf="isLoading"
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
            ></div>

            <div *ngIf="!isLoading && isVerified" class="text-center">
              <svg
                class="mx-auto h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p class="mt-2 text-sm text-gray-600">
                Your email has been verified successfully!
              </p>
              <button
                (click)="goToLogin()"
                class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Login
              </button>
            </div>

            <div *ngIf="!isLoading && !isVerified && error" class="text-center">
              <svg
                class="mx-auto h-12 w-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p class="mt-2 text-sm text-red-600">
                {{ error }}
              </p>
              <button
                (click)="goToLogin()"
                class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Login
              </button>
            </div>
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
