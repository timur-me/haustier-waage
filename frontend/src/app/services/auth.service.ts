import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';
import { User } from '../models/user.model';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenRefreshTimer: any;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Check for existing token and load user data
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      this.loadUserData().catch(() => this.logout());
    }
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private async loadUserData(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${environment.apiUrl}/api/users/me`)
      );
      if (user) {
        console.log('Loaded user data:', user); // Debug log
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/register`, {
          username,
          email,
          password,
        })
      );

      await this.handleAuthResponse(response);
      this.notificationService.showSuccess(
        'Registration successful! Please check your email to verify your account.'
      );
      await this.router.navigate(['/verify-email-notice']);
    } catch (error: any) {
      if (error.status === 409) {
        this.notificationService.showError('Email already registered');
      } else {
        this.notificationService.showError(
          'An error occurred during registration'
        );
      }
      throw error;
    }
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/login`, {
          username,
          password,
        })
      );

      await this.handleAuthResponse(response);
      this.notificationService.showSuccess('Successfully logged in');

      // Load user data and check email verification status
      await this.loadUserData();
      const user = this.getCurrentUser();
      console.log('Current user state:', user); // Debug log

      if (!user) {
        throw new Error('Failed to load user data after login');
      }

      if (!user.email_verified) {
        console.log('Email not verified, redirecting to notice page'); // Debug log
        await this.router.navigate(['/verify-email-notice']);
      } else {
        console.log('Email verified, redirecting to main page'); // Debug log
        await this.router.navigate(['/']);
      }
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else {
        throw new Error('An error occurred during login');
      }
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    await this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private async handleAuthResponse(response: AuthResponse): Promise<void> {
    localStorage.setItem('token', response.access_token);
    this.isAuthenticatedSubject.next(true);
    await this.loadUserData();
    this.scheduleTokenRefresh(response.expires_in);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Refresh 1 minute before expiration
    const refreshTime = (expiresIn - 60) * 1000;
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshToken().subscribe({
        next: async (response) => {
          await this.handleAuthResponse(response);
        },
        error: () => {
          this.logout();
        },
      });
    }, refreshTime);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token`, {});
  }

  async isEmailVerified(): Promise<boolean> {
    let user = this.currentUserSubject.value;
    if (!user) {
      try {
        await this.loadUserData();
        user = this.currentUserSubject.value;
      } catch (error) {
        console.error('Failed to load user data:', error);
        return false;
      }
    }
    console.log('Checking email verification status:', user?.email_verified); // Debug log
    return user?.email_verified ?? false;
  }
}
