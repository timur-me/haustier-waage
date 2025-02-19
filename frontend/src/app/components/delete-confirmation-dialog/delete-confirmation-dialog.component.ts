import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Delete Confirmation</h2>
          <button 
            class="text-gray-400 hover:text-gray-500"
            (click)="cancel()"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mt-2">
          <p class="text-sm text-gray-500">
            {{ message }}
          </p>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            class="btn"
            (click)="cancel()"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            (click)="confirm()"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DeleteConfirmationDialogComponent {
  @Input() message = '';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.cancelled.emit();
  }
} 