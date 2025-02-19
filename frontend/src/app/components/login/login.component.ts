import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-dark-primary">
      <div class="w-full max-w-md transform transition-all duration-300 ease-in-out hover:scale-[1.02]">
        <div class="bg-white dark:bg-dark-secondary rounded-lg shadow-xl overflow-hidden transition-colors">
          <div class="px-8 pt-8 pb-4">
            <h2 class="text-center text-3xl font-extrabold text-gray-900 dark:text-dark-text animate-fadeIn">
              Welcome to Pet Weight Monitor
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600 dark:text-dark-muted animate-slideUp">
              Please enter your username to continue
            </p>
          </div>
          <form class="px-8 pb-8 space-y-6" (ngSubmit)="login()">
            <div class="animate-slideUp" style="animation-delay: 100ms">
              <label for="username" class="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                [(ngModel)]="username"
                class="appearance-none rounded-lg relative block w-full px-4 py-3 border 
                       border-gray-300 dark:border-gray-600 dark:bg-dark-primary 
                       placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 
                       dark:text-dark-text focus:outline-none focus:ring-2 
                       focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
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
                <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Signing in...' : 'Sign in' }}
              </button>
            </div>

            <div *ngIf="error" class="text-red-500 dark:text-red-400 text-sm text-center animate-fadeIn">
              {{ error }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    .shake {
      animation: shake 0.5s ease-in-out;
    }
  `]
})
export class LoginComponent {
  username = '';
  isLoading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  login() {
    if (!this.username.trim()) {
      this.error = 'Please enter a username';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.apiService.login(this.username).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.access_token);
        this.router.navigate(['/animals']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = 'Failed to sign in. Please try again.';
        this.isLoading = false;
      }
    });
  }
} 