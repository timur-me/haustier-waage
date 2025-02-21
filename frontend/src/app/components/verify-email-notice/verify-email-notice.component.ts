import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-verify-email-notice',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  template: `
    <div
      class="h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-primary"
    >
      <!-- Theme Toggle -->
      <div class="absolute top-4 right-4">
        <app-theme-toggle />
      </div>
      <div class="w-full max-w-md px-4 -mt-16">
        <!-- Logo and Title -->
        <div class="text-center">
          <img
            class="mx-auto h-24 w-auto"
            src="assets/images/logo.svg"
            alt="Pet Weight Monitor"
          />
          <h2
            class="mt-4 text-2xl font-extrabold text-gray-900 dark:text-dark-text"
          >
            Email Verification Required
          </h2>
        </div>

        <!-- Message -->
        <div
          class="mt-6 bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6"
        >
          <!-- <div class="animate-pulse mb-3">
            <div
              class="h-10 w-10 mx-auto bg-yellow-500 rounded-full flex items-center justify-center"
            >
              <svg
                class="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div> -->
          <p class="text-gray-600 dark:text-dark-muted mb-3">
            Your account has been created, but you need to verify your email
            address before accessing the application.
          </p>
          <p class="text-gray-600 dark:text-dark-muted">
            Please check your email inbox for the verification link. If you
            haven't received the email, check your spam folder.
          </p>
        </div>

        <!-- Additional Info -->
        <div
          class="mt-4 text-center text-sm text-gray-500 dark:text-dark-muted"
        >
          <p>Need help? Contact support at support&#64;petweightmonitor.com</p>
        </div>
      </div>
    </div>
  `,
})
export class VerifyEmailNoticeComponent {}
