import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { AuthService } from '../../services/auth.service';
import { NotificationComponent } from '../notification/notification.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ThemeToggleComponent,
    NotificationComponent,
    RouterModule,
  ],
  template: `
    <div
      class="min-h-screen bg-gray-100 dark:bg-dark-primary transition-colors"
    >
      <!-- Header -->
      <header class="bg-white dark:bg-dark-secondary shadow">
        <div
          class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
        >
          <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text">
            Pet Weight Monitor
          </h1>
          <div class="flex items-center space-x-4">
            <app-theme-toggle />
            <button
              (click)="logout()"
              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Notification Component -->
      <app-notification />

      <!-- Main Content -->
      <main>
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <!-- Replace with your content -->
          <div class="px-4 py-6 sm:px-0">
            <div
              class="border-4 border-dashed border-gray-200 dark:border-dark-border rounded-lg h-96 flex items-center justify-center"
            >
              <p class="text-gray-500 dark:text-dark-muted text-xl">
                Welcome to Pet Weight Monitor! Your dashboard content will
                appear here.
              </p>
            </div>
          </div>
          <!-- /End replace -->
        </div>
      </main>
    </div>
  `,
})
export class HomeComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
