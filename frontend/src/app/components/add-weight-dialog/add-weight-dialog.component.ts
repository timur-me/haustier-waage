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
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Add Weight Entry</h2>
          <button 
            class="text-gray-400 hover:text-gray-500"
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
            <label for="weight" class="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              step="0.1"
              min="0"
              required
              [(ngModel)]="weight"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter weight in kilograms"
            />
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              required
              [(ngModel)]="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              class="btn"
              (click)="close()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isLoading"
            >
              {{ isLoading ? 'Adding...' : 'Add Entry' }}
            </button>
          </div>

          <div *ngIf="error" class="text-red-500 text-sm">
            {{ error }}
          </div>
        </form>
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