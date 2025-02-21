import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PasswordService } from './password.service';

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private passwordService: PasswordService
  ) {}

  /**
   * Sends a password reset email to the specified email address
   * @param email The user's email address
   * @returns Observable of the API response
   */
  sendPasswordResetEmail(email: string): Observable<PasswordResetResponse> {
    const data: PasswordResetRequest = { email };
    console.log('Sending password reset request:', data);
    return this.http.post<PasswordResetResponse>(
      `${this.apiUrl}/auth/password-reset`,
      data
    );
  }

  /**
   * Sends an email verification link to the specified email address
   * @param email The user's email address
   * @returns Observable of the API response
   */
  sendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-email`, { email });
  }

  /**
   * Verifies the email using the token from the verification link
   * @param token The verification token from the email link
   * @returns Observable of the API response
   */
  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-email/${token}`, {});
  }

  /**
   * Resets the password using the token from the reset link
   * @param token The reset token from the email link
   * @param newPassword The new password
   * @returns Observable of the API response
   */
  resetPassword(
    token: string,
    newPassword: string
  ): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${this.apiUrl}/auth/reset-password/${token}/confirm`,
      {
        password: newPassword,
      }
    );
  }
}
