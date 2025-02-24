import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay flex items-center justify-center">
      <div class="dialog p-6 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p class="text-gray-600 dark:text-dark-muted mb-6">{{ message }}</p>
        <div class="flex justify-end space-x-4">
          <button
            class="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-secondary dark:text-dark-muted dark:hover:bg-gray-700"
            (click)="onCancel()"
          >
            Cancel
          </button>
          <button class="btn btn-danger" (click)="onConfirm()">Delete</button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteConfirmationDialogComponent {
  @Input() message = 'Are you sure you want to delete this item?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
