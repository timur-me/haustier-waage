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
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Pet Weight Monitor
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Please enter your username to continue
          </p>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="login()">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              [(ngModel)]="username"
              class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <button
              type="submit"
              [disabled]="isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>

          <div *ngIf="error" class="text-red-500 text-sm text-center">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
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
        // Store the token in localStorage
        localStorage.setItem('token', response.access_token);
        // Navigate to the animals page
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