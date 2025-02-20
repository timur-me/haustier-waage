import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Router } from '@angular/router';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">Profile Settings</h1>

        <!-- Profile Picture Section -->
        <div class="mb-8">
          <div class="flex items-start space-x-4">
            <div class="relative">
              <img
                [src]="
                  profilePictureUrl || 'assets/images/placeholder-profile.svg'
                "
                alt="Profile picture"
                class="w-32 h-32 rounded-full object-cover"
                (error)="handleImageError($event)"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                (click)="openImageUpload()"
              >
                <span class="text-white text-sm">Change Photo</span>
              </div>
              <app-image-upload
                #imageUpload
                [currentImageUrl]="profilePictureUrl"
                buttonText="Change"
                (imageUploaded)="onProfilePictureUploaded($event)"
                class="hidden"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-2">Profile Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500 dark:text-dark-muted">
                    Username
                  </p>
                  <p class="font-medium">{{ username }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-dark-muted">
                    Email
                  </p>
                  <p class="font-medium">{{ email || 'Not set' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-dark-muted">
                    First Name
                  </p>
                  <p class="font-medium">{{ firstName || 'Not set' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-dark-muted">
                    Last Name
                  </p>
                  <p class="font-medium">{{ lastName || 'Not set' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-dark-muted">
                    Account Created
                  </p>
                  <p class="font-medium">{{ createdAt | date }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-dark-muted">
                    Email Verified
                  </p>
                  <p class="font-medium">{{ emailVerified ? 'Yes' : 'No' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Sections -->
        <div class="space-y-6">
          <!-- Username Section -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold mb-4">Change Username</h3>
            <div class="max-w-md">
              <input
                type="text"
                [(ngModel)]="newUsername"
                class="input w-full mb-2"
                placeholder="Enter new username"
              />
              <p *ngIf="usernameError" class="text-red-500 text-sm mb-2">
                {{ usernameError }}
              </p>
              <button
                (click)="updateUsername()"
                class="btn btn-primary"
                [disabled]="isLoading"
              >
                {{ isLoading ? 'Updating...' : 'Update Username' }}
              </button>
            </div>
          </div>

          <!-- Email Section -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold mb-4">Change Email</h3>
            <div class="max-w-md">
              <input
                type="email"
                [(ngModel)]="newEmail"
                class="input w-full mb-2"
                placeholder="Enter new email"
              />
              <p *ngIf="emailError" class="text-red-500 text-sm mb-2">
                {{ emailError }}
              </p>
              <button
                (click)="updateEmail()"
                class="btn btn-primary"
                [disabled]="isLoading"
              >
                {{ isLoading ? 'Updating...' : 'Update Email' }}
              </button>
            </div>
          </div>

          <!-- Password Section -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold mb-4">Change Password</h3>
            <div class="max-w-md space-y-3">
              <input
                type="password"
                [(ngModel)]="currentPassword"
                class="input w-full"
                placeholder="Current password"
              />
              <input
                type="password"
                [(ngModel)]="newPassword"
                class="input w-full"
                placeholder="New password"
              />
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                class="input w-full"
                placeholder="Confirm new password"
              />
              <p *ngIf="passwordError" class="text-red-500 text-sm">
                {{ passwordError }}
              </p>
              <button
                (click)="updatePassword()"
                class="btn btn-primary"
                [disabled]="isLoading"
              >
                {{ isLoading ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </div>

          <!-- Name Section -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold mb-4">Update Name</h3>
            <div class="max-w-md grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  [(ngModel)]="firstName"
                  class="input w-full"
                  placeholder="First name"
                />
              </div>
              <div>
                <input
                  type="text"
                  [(ngModel)]="lastName"
                  class="input w-full"
                  placeholder="Last name"
                />
              </div>
              <div class="col-span-2">
                <button
                  (click)="updateName()"
                  class="btn btn-primary"
                  [disabled]="isLoading"
                >
                  {{ isLoading ? 'Updating...' : 'Update Name' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification -->
      <div
        *ngIf="notification"
        class="fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-slideIn"
        [ngClass]="{
          'bg-green-500 text-white': notification.type === 'success',
          'bg-red-500 text-white': notification.type === 'error'
        }"
      >
        {{ notification.message }}
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
  firstName = '';
  lastName = '';
  emailVerified = false;
  createdAt = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  profilePictureUrl: string | null = null;
  newUsername = '';
  newEmail = '';

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
      next: (user: User) => {
        this.username = user.username;
        this.email = user.email || '';
        this.firstName = user.first_name || '';
        this.lastName = user.last_name || '';
        this.emailVerified = user.email_verified;
        this.createdAt = user.created_at;
        if (user.profile_picture) {
          this.profilePictureUrl = this.apiService.getMediaUrl(
            user.profile_picture.filename
          );
        }
      },
      error: (error: any) => {
        console.error('Error loading user data:', error);
        this.showNotification('error', 'Failed to load user data');
      },
    });
  }

  onProfilePictureUploaded(mediaId: string) {
    this.isLoading = true;
    this.apiService
      .updateProfile({
        profile_picture_id: mediaId,
      })
      .subscribe({
        next: (user: User) => {
          this.isLoading = false;
          if (user.profile_picture) {
            this.profilePictureUrl = this.apiService.getMediaUrl(
              user.profile_picture.filename
            );
          }
          this.showNotification(
            'success',
            'Profile picture updated successfully'
          );
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error updating profile picture:', error);
          this.showNotification('error', 'Failed to update profile picture');
        },
      });
  }

  async updateUsername() {
    if (!this.newUsername) {
      this.usernameError = 'Username cannot be empty';
      return;
    }

    this.isLoading = true;
    this.usernameError = '';

    try {
      await this.apiService
        .updateProfile({ username: this.newUsername })
        .toPromise();

      // Store the new username in localStorage
      localStorage.setItem('redirectUsername', this.newUsername);

      // Show success notification
      this.showNotification('success', 'Username updated successfully');

      // Wait for 2 seconds before redirecting
      setTimeout(() => {
        this.authService.logout(); // This will clear auth state
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      this.usernameError = error.error?.detail || 'Failed to update username';
    } finally {
      this.isLoading = false;
    }
  }

  async updateEmail() {
    if (!this.newEmail) {
      this.emailError = 'Email is required';
      return;
    }

    this.isLoading = true;
    this.emailError = '';

    try {
      await this.apiService
        .updateProfile({
          email: this.newEmail,
        })
        .toPromise();

      this.email = this.newEmail;
      this.newEmail = '';
      this.showNotification('success', 'Email updated successfully');
    } catch (error) {
      this.emailError = 'Failed to update email';
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
        this.passwordError = 'Failed to update password';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async updateName() {
    this.isLoading = true;

    try {
      await this.apiService
        .updateProfile({
          first_name: this.firstName || undefined,
          last_name: this.lastName || undefined,
        })
        .toPromise();

      this.showNotification('success', 'Name updated successfully');
    } catch (error) {
      this.showNotification('error', 'Failed to update name');
    } finally {
      this.isLoading = false;
    }
  }

  openImageUpload() {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-profile.svg';
  }
}
