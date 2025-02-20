import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Router } from '@angular/router';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-dark-primary">
      <!-- Notification -->
      <div
        *ngIf="notification"
        class="fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white animate-slideIn z-50"
        [ngClass]="
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        "
      >
        {{ notification.message }}
      </div>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div
            class="bg-white dark:bg-dark-secondary rounded-lg shadow px-5 py-6 sm:px-6"
          >
            <div class="space-y-6">
              <!-- Profile Picture Section -->
              <div>
                <h3
                  class="text-lg font-medium text-gray-900 dark:text-dark-text mb-4"
                >
                  Profile Picture
                </h3>
                <app-image-upload
                  [currentImageUrl]="profilePictureUrl"
                  buttonText="Change Profile Picture"
                  (imageUploaded)="onProfilePictureUploaded($event)"
                ></app-image-upload>
              </div>

              <!-- Username Section -->
              <div>
                <h3
                  class="text-lg font-medium text-gray-900 dark:text-dark-text"
                >
                  Username
                </h3>
                <div class="mt-2 flex items-center space-x-4">
                  <input
                    type="text"
                    [(ngModel)]="username"
                    [class.border-red-500]="usernameError"
                    class="input flex-grow"
                  />
                  <button
                    (click)="updateUsername()"
                    [disabled]="isLoading"
                    class="btn btn-primary"
                  >
                    Update Username
                  </button>
                </div>
                <p *ngIf="usernameError" class="mt-1 text-sm text-red-500">
                  {{ usernameError }}
                </p>
              </div>

              <!-- Email Section -->
              <div>
                <h3
                  class="text-lg font-medium text-gray-900 dark:text-dark-text"
                >
                  Email
                </h3>
                <div class="mt-2 flex items-center space-x-4">
                  <input
                    type="email"
                    [(ngModel)]="email"
                    [class.border-red-500]="emailError"
                    class="input flex-grow"
                  />
                  <button
                    (click)="updateEmail()"
                    [disabled]="isLoading"
                    class="btn btn-primary"
                  >
                    Update Email
                  </button>
                </div>
                <p *ngIf="emailError" class="mt-1 text-sm text-red-500">
                  {{ emailError }}
                </p>
              </div>

              <!-- Password Section -->
              <div>
                <h3
                  class="text-lg font-medium text-gray-900 dark:text-dark-text"
                >
                  Change Password
                </h3>
                <div class="mt-2 space-y-4">
                  <input
                    type="password"
                    [(ngModel)]="currentPassword"
                    placeholder="Current Password"
                    class="input w-full"
                  />
                  <input
                    type="password"
                    [(ngModel)]="newPassword"
                    placeholder="New Password"
                    [class.border-red-500]="passwordError"
                    class="input w-full"
                  />
                  <input
                    type="password"
                    [(ngModel)]="confirmPassword"
                    placeholder="Confirm New Password"
                    [class.border-red-500]="passwordError"
                    class="input w-full"
                  />
                  <button
                    (click)="updatePassword()"
                    [disabled]="isLoading"
                    class="btn btn-primary w-full"
                  >
                    Update Password
                  </button>
                </div>
                <p *ngIf="passwordError" class="mt-1 text-sm text-red-500">
                  {{ passwordError }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes slideIn {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .animate-slideIn {
        animation: slideIn 0.3s ease-out;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  username = '';
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  profilePictureUrl: string | null = null;

  isLoading = false;
  usernameError = '';
  emailError = '';
  passwordError = '';

  notification: { type: 'success' | 'error'; message: string } | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private showNotification(type: 'success' | 'error', message: string) {
    this.notification = { type, message };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  loadUserData() {
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        this.username = user.username;
        this.email = user.email || '';
        if (user.profile_picture) {
          const filename = user.profile_picture.filename;
          this.profilePictureUrl = filename.startsWith('http')
            ? filename
            : this.apiService.getMediaUrl(filename);
        } else {
          this.profilePictureUrl = null;
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.showNotification('error', 'Failed to load user data');
      },
    });
  }

  onProfilePictureUploaded(mediaId: string) {
    this.apiService.updateProfile({ profile_picture_id: mediaId }).subscribe({
      next: (user) => {
        if (user.profile_picture) {
          const filename = user.profile_picture.filename;
          this.profilePictureUrl = filename.startsWith('http')
            ? filename
            : this.apiService.getMediaUrl(filename);
          this.showNotification(
            'success',
            'Profile picture updated successfully'
          );
        }
      },
      error: (error) => {
        console.error('Error updating profile picture:', error);
        this.showNotification('error', 'Failed to update profile picture');
      },
    });
  }

  async updateUsername() {
    if (!this.username.trim()) {
      this.usernameError = 'Username cannot be empty';
      return;
    }

    this.isLoading = true;
    this.usernameError = '';

    try {
      await this.apiService
        .updateProfile({ username: this.username.trim() })
        .toPromise();
      this.showNotification('success', 'Username updated successfully');
    } catch (error: any) {
      if (error.status === 409) {
        this.usernameError = 'Username is already taken';
        this.showNotification('error', 'Username is already taken');
      } else {
        this.usernameError = 'Failed to update username';
        this.showNotification('error', 'Failed to update username');
      }
    } finally {
      this.isLoading = false;
    }
  }

  async updateEmail() {
    if (!this.email.trim()) {
      this.emailError = 'Email cannot be empty';
      return;
    }

    this.isLoading = true;
    this.emailError = '';

    try {
      await this.apiService
        .updateProfile({ email: this.email.trim() })
        .toPromise();
      this.showNotification('success', 'Email updated successfully');
    } catch (error: any) {
      this.emailError = error.message || 'Failed to update email';
      this.showNotification('error', this.emailError);
    } finally {
      this.isLoading = false;
    }
  }

  async updatePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'All password fields are required';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    this.isLoading = true;
    this.passwordError = '';

    try {
      await this.apiService
        .updatePassword(this.currentPassword, this.newPassword)
        .toPromise();
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.showNotification('success', 'Password updated successfully');
    } catch (error: any) {
      if (error.status === 400) {
        this.passwordError = 'Current password is incorrect';
      } else {
        this.passwordError = error.message || 'Failed to update password';
      }
      this.showNotification('error', this.passwordError);
    } finally {
      this.isLoading = false;
    }
  }
}
