import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <input
        #fileInput
        type="file"
        accept="image/*"
        (change)="onFileSelected($event)"
        class="hidden"
      />
      <button
        type="button"
        (click)="fileInput.click()"
        class="btn btn-primary flex items-center space-x-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{{ buttonText }}</span>
      </button>
      <img
        *ngIf="currentImageUrl"
        [src]="currentImageUrl"
        alt="Current image"
        class="mt-2 rounded-lg max-w-xs"
        (error)="handleImageError($event)"
      />
    </div>
  `,
})
export class ImageUploadComponent {
  @Input() buttonText = 'Upload Image';
  @Input() currentImageUrl: string | null = null;
  @Output() imageUploaded = new EventEmitter<string>();

  constructor(private apiService: ApiService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.apiService.uploadMedia(formData).subscribe({
        next: (response) => {
          this.imageUploaded.emit(response.id);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
        },
      });
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-profile.svg';
  }
}
