import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PasswordService } from './password.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenRefreshTimer: any;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );

  constructor(
    private http: HttpClient,
    private passwordService: PasswordService,
    private router: Router
  ) {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
    this.initializeTokenRefresh();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<void> {
    const passwordValidation = this.passwordService.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('\n'));
    }

    const { hash: passwordHash, salt } =
      await this.passwordService.hashPassword(password);
    return this.http
      .post<void>(`${this.API_URL}/register`, {
        username,
        email,
        password_hash: passwordHash,
        salt,
      })
      .toPromise();
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    try {
      const response = await this.http
        .post<AuthResponse>(`${this.API_URL}/login`, formData.toString(), {
          headers,
        })
        .toPromise();

      if (!response) {
        throw new Error('Username or password is incorrect');
      }

      localStorage.setItem('token', response.access_token);
      this.isAuthenticatedSubject.next(true);
      this.scheduleTokenRefresh(response.expires_in);
      return response;
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Username or password is incorrect');
      } else if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else {
        throw new Error('An error occurred during login. Please try again.');
      }
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.access_token);
    this.isAuthenticatedSubject.next(true);
    this.scheduleTokenRefresh(response.expires_in);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private initializeTokenRefresh(): void {
    if (this.hasValidToken()) {
      this.refreshToken().subscribe({
        error: () => this.logout(),
      });
    }
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Refresh token 1 minute before expiry
    const refreshTime = (expiresIn - 60) * 1000;
    if (refreshTime <= 0) {
      this.logout();
      return;
    }

    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => this.logout(),
      });
    }, refreshTime);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/refresh-token`, {})
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/password-reset-request`,
      { email }
    );
  }

  confirmPasswordReset(
    token: string,
    new_password: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/password-reset-confirm`,
      {
        token,
        new_password,
      }
    );
  }
}
