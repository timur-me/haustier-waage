import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="notificationService.notification$ | async as notification"
      class="fixed top-4 right-4 z-50 animate-slideIn"
      role="alert"
    >
      <div
        class="rounded-lg p-4 shadow-lg"
        [ngClass]="{
          'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100':
            notification.type === 'success',
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100':
            notification.type === 'error',
          'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100':
            notification.type === 'info'
        }"
      >
        <div class="flex items-center">
          <!-- Success Icon -->
          <svg
            *ngIf="notification.type === 'success'"
            class="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Error Icon -->
          <svg
            *ngIf="notification.type === 'error'"
            class="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Info Icon -->
          <svg
            *ngIf="notification.type === 'info'"
            class="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clip-rule="evenodd"
            />
          </svg>

          <p>{{ notification.message }}</p>

          <button
            class="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            (click)="notificationService.hide()"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}
}
