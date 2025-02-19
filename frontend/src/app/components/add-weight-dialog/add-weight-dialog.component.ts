import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WeightEntry } from '../../models/weight.model';

@Component({
  selector: 'app-add-weight-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 dialog-overlay">
      <div class="bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-md w-full mx-auto dialog">
        <div class="px-6 pt-6 pb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-dark-text mb-4 animate-fadeIn">
            Add Weight Entry
          </h3>
          <form (ngSubmit)="submit()" class="space-y-4">
            <div class="animate-slideUp" style="animation-delay: 100ms">
              <label for="weight" class="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                [(ngModel)]="weight"
                step="0.1"
                required
                class="input w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 
                       dark:focus:ring-blue-400 focus:border-transparent 
                       bg-white dark:bg-dark-primary text-gray-900 
                       dark:text-dark-text placeholder-gray-500 
                       dark:placeholder-gray-400 transition-all duration-200"
                [class.border-red-500]="error && !weight"
              />
              <p *ngIf="error && !weight" class="mt-1 text-sm text-red-500 dark:text-red-400 animate-fadeIn">
                Weight is required
              </p>
            </div>

            <div class="animate-slideUp" style="animation-delay: 200ms">
              <label for="date" class="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">
                Date and Time
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                [(ngModel)]="date"
                required
                class="input w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 
                       dark:focus:ring-blue-400 focus:border-transparent 
                       bg-white dark:bg-dark-primary text-gray-900 
                       dark:text-dark-text transition-all duration-200"
                [class.border-red-500]="error && !date"
              />
              <p *ngIf="error && !date" class="mt-1 text-sm text-red-500 dark:text-red-400 animate-fadeIn">
                Date and time are required
              </p>
            </div>

            <div class="flex justify-end space-x-3 pt-4 animate-slideUp" style="animation-delay: 300ms">
              <button
                type="button"
                (click)="close()"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-muted 
                       bg-white dark:bg-dark-primary border border-gray-300 
                       dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 
                       dark:hover:bg-dark-secondary focus:outline-none focus:ring-2 
                       focus:ring-blue-500 dark:focus:ring-blue-400 
                       transition-all duration-200 transform hover:scale-[1.02]"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                       dark:bg-blue-500 border border-transparent rounded-lg 
                       shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       dark:focus:ring-blue-400 transition-all duration-200 
                       transform hover:scale-[1.02] disabled:opacity-50 
                       disabled:cursor-not-allowed"
              >
                <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Adding...' : 'Add Entry' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AddWeightDialogComponent {
  @Input({ required: true }) animalId!: string;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() weightAdded = new EventEmitter<WeightEntry>();

  weight = 0;
  date = new Date().toISOString().slice(0, 16); // Current date-time in format required by datetime-local
  isLoading = false;
  error = '';

  constructor(private apiService: ApiService) {}

  close() {
    this.closeDialog.emit();
  }

  submit() {
    if (!this.weight) {
      this.error = 'Please enter a weight';
      return;
    }

    if (!this.date) {
      this.error = 'Please select a date';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.apiService.addWeightEntry(this.animalId, this.weight, new Date(this.date)).subscribe({
      next: (entry) => {
        this.weightAdded.emit(entry);
        this.close();
      },
      error: (error) => {
        console.error('Error adding weight entry:', error);
        this.error = 'Failed to add weight entry. Please try again.';
        this.isLoading = false;
      }
    });
  }
} 