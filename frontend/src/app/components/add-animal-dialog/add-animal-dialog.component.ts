import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-add-animal-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay flex items-center justify-center">
      <div class="dialog p-6 max-w-md w-full">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text">Add New Animal</h2>
          <button 
            class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            (click)="close()"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-dark-muted">Animal Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              [(ngModel)]="name"
              class="input w-full mt-1"
              placeholder="Enter animal name"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              class="btn bg-gray-200 dark:bg-dark-primary text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-secondary"
              (click)="close()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isLoading"
            >
              {{ isLoading ? 'Adding...' : 'Add Animal' }}
            </button>
          </div>

          <div *ngIf="error" class="text-red-500 dark:text-red-400 text-sm">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class AddAnimalDialogComponent {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() animalAdded = new EventEmitter<Animal>();

  name = '';
  isLoading = false;
  error = '';

  constructor(private apiService: ApiService) {}

  close() {
    this.closeDialog.emit();
  }

  submit() {
    if (!this.name.trim()) {
      this.error = 'Please enter an animal name';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.apiService.createAnimal({ name: this.name.trim() }).subscribe({
      next: (animal) => {
        this.animalAdded.emit(animal);
        this.close();
      },
      error: (error) => {
        console.error('Error adding animal:', error);
        this.error = 'Failed to add animal. Please try again.';
        this.isLoading = false;
      }
    });
  }
} 