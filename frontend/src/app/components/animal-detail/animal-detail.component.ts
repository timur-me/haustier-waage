import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { AnimalWithWeights } from '../../models/animal.model';
import { WeightEntry } from '../../models/weight.model';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { AddWeightDialogComponent } from '../add-weight-dialog/add-weight-dialog.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

interface EditingWeight {
  id: string;
  weight: number;
  date: string;
}

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    ImageUploadComponent,
    AddWeightDialogComponent,
    DeleteConfirmationDialogComponent,
    RouterLink,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Back Button -->
      <a
        routerLink="/animals"
        class="inline-flex items-center text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
        Back to Animals
      </a>

      <!-- Loading State -->
      <div *ngIf="!animal" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Animal Details -->
      <div *ngIf="animal" class="space-y-8">
        <!-- Header -->
        <div class="flex items-start gap-6">
          <!-- Profile Picture -->
          <div class="flex-shrink-0">
            <div
              (click)="openImageUpload()"
              class="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-secondary relative group cursor-pointer"
            >
              <img
                *ngIf="getProfilePictureUrl()"
                [src]="getProfilePictureUrl()"
                [alt]="animal.name"
                class="w-full h-full object-cover"
                (error)="handleImageError($event)"
              />
              <div
                *ngIf="!getProfilePictureUrl()"
                class="w-full h-full flex items-center justify-center text-gray-400"
              >
                <img
                  src="/assets/images/placeholder-pet.svg"
                  alt="Default pet image"
                  class="w-16 h-16"
                />
              </div>
              <div
                class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <span class="text-white text-sm">Change Photo</span>
              </div>
              <app-image-upload
                #imageUpload
                [currentImageUrl]="getProfilePictureUrl()"
                buttonText="Change"
                (imageUploaded)="onProfilePictureUploaded($event)"
                class="hidden"
              />
            </div>
          </div>

          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <h1
                    *ngIf="!isEditingName"
                    class="text-3xl font-bold text-gray-900 dark:text-dark-text"
                  >
                    {{ animal.name }}
                  </h1>
                  <input
                    *ngIf="isEditingName"
                    type="text"
                    [(ngModel)]="editingName"
                    (keyup.enter)="saveName()"
                    (keyup.escape)="cancelNameEdit()"
                    class="text-3xl font-bold bg-transparent border-b border-blue-500 focus:outline-none text-gray-900 dark:text-dark-text"
                    [class.dark]="true"
                  />
                  <button
                    *ngIf="!isEditingName"
                    (click)="startNameEdit()"
                    class="text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      />
                    </svg>
                  </button>
                </div>
                <p class="text-gray-600 dark:text-dark-muted">
                  {{ animal.species || 'No species' }}
                  {{ animal.breed ? '• ' + animal.breed : '' }}
                </p>
                <p
                  *ngIf="animal.birth_date"
                  class="text-sm text-gray-500 dark:text-dark-muted mt-1"
                >
                  Born: {{ animal.birth_date | date }}
                </p>
              </div>
              <button
                (click)="showDeleteConfirmation = true"
                class="btn btn-danger"
              >
                Delete Pet
              </button>
            </div>
          </div>
        </div>

        <!-- Weight Chart -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text">
              Weight History
            </h2>
            <button
              (click)="showAddWeightDialog = true"
              class="btn btn-primary"
            >
              Add Weight
            </button>
          </div>

          <div *ngIf="weightChart" class="h-[400px]">
            <canvas
              baseChart
              [type]="weightChart.type"
              [data]="weightChart.data"
              [options]="weightChart.options"
            >
            </canvas>
          </div>

          <!-- Weight History Table -->
          <div class="mt-8 overflow-x-auto">
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead>
                <tr>
                  <th class="table-header px-6 py-3">Date</th>
                  <th class="table-header px-6 py-3">Weight (kg)</th>
                  <th class="table-header px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  *ngFor="let weight of animal.weightHistory"
                  class="table-row"
                >
                  <td class="table-cell px-6 py-4">
                    <ng-container
                      *ngIf="editingEntry?.id !== weight.id; else dateEdit"
                    >
                      {{ weight.date | date : 'medium' }}
                    </ng-container>
                    <ng-template #dateEdit>
                      <input
                        type="datetime-local"
                        [ngModel]="editingEntry?.date"
                        (ngModelChange)="editingEntry!.date = $event"
                        class="input w-full"
                      />
                    </ng-template>
                  </td>
                  <td class="table-cell px-6 py-4">
                    <ng-container
                      *ngIf="editingEntry?.id !== weight.id; else weightEdit"
                    >
                      {{ weight.weight }}
                    </ng-container>
                    <ng-template #weightEdit>
                      <input
                        type="number"
                        [ngModel]="editingEntry?.weight"
                        (ngModelChange)="editingEntry!.weight = $event"
                        class="input w-full"
                        step="0.1"
                      />
                    </ng-template>
                  </td>
                  <td class="table-cell px-6 py-4">
                    <div class="flex space-x-2">
                      <ng-container
                        *ngIf="editingEntry?.id !== weight.id; else editActions"
                      >
                        <button
                          (click)="startEditingWeight(weight)"
                          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          (click)="deleteWeight(weight.id)"
                          class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </ng-container>
                      <ng-template #editActions>
                        <button
                          (click)="saveEditingWeight()"
                          class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Save
                        </button>
                        <button
                          (click)="editingEntry = null"
                          class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </ng-template>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="animal.weightHistory.length === 0">
                  <td
                    colspan="3"
                    class="table-cell px-6 py-4 text-center text-gray-500 dark:text-dark-muted"
                  >
                    No weight entries yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add Weight Dialog -->
      <app-add-weight-dialog
        *ngIf="showAddWeightDialog && animal"
        [animalId]="animal.id"
        (closeDialog)="showAddWeightDialog = false"
        (weightAdded)="onWeightAdded($event)"
      />

      <!-- Delete Confirmation Dialog -->
      <app-delete-confirmation-dialog
        *ngIf="showDeleteConfirmation"
        message="Are you sure you want to delete this pet? This action cannot be undone."
        (confirmed)="deleteAnimal()"
        (cancelled)="showDeleteConfirmation = false"
      />
    </div>
  `,
})
export class AnimalDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  animalId!: string;
  animal: AnimalWithWeights | null = null;
  weightChart: {
    data: ChartConfiguration<'line'>['data'];
    options: ChartConfiguration<'line'>['options'];
    type: 'line';
  } | null = null;

  showAddWeightDialog = false;
  showDeleteConfirmation = false;
  editingEntry: EditingWeight | null = null;
  isEditingName = false;
  editingName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public apiService: ApiService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimal();
    this.setupWebSocket();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnimal() {
    this.apiService.getAnimal(this.animalId).subscribe({
      next: (animal) => {
        this.animal = {
          ...animal,
          weights: [],
          weightHistory: [],
          lastWeight: null,
        };

        this.apiService.getWeights(this.animalId).subscribe({
          next: (weights) => {
            this.animal!.weights = weights;
            // Sort for table (newest first)
            this.animal!.weightHistory = [...weights].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            // Get latest weight from the sorted array
            const latestWeight = this.animal!.weightHistory[0];
            this.animal!.lastWeight = latestWeight ? latestWeight.weight : null;
            this.updateChart();
          },
        });
      },
      error: () => {
        this.router.navigate(['/animals']);
      },
    });
  }

  private setupWebSocket() {
    this.webSocketService.connect();

    // Handle weight updates
    this.webSocketService
      .getWeightUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe((weight) => {
        if (this.animal && weight.animal_id === this.animal.id) {
          const index = this.animal.weights.findIndex(
            (w) => w.id === weight.id
          );
          if (index !== -1) {
            this.animal.weights[index] = weight;
          } else {
            // Check if this weight was already added in the last second (to prevent duplicates)
            const recentlyAdded = this.animal.weights.some(
              (w) =>
                Math.abs(
                  new Date(w.date).getTime() - new Date(weight.date).getTime()
                ) < 1000 && w.weight === weight.weight
            );
            if (!recentlyAdded) {
              this.animal.weights.push(weight);
            }
          }
          this.handleWeightUpdate();
        }
      });

    // Handle weight deletions
    this.webSocketService
      .getWeightDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id, animal_id }) => {
        if (this.animal && animal_id === this.animal.id) {
          this.animal.weights = this.animal.weights.filter((w) => w.id !== id);
          this.handleWeightUpdate();
        }
      });

    // Handle animal updates (including name and profile picture changes)
    this.webSocketService
      .getAnimalUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedAnimal) => {
        if (this.animal && updatedAnimal.id === this.animal.id) {
          // Create a new object reference to trigger change detection
          this.animal = {
            ...this.animal, // Keep existing properties as base
            name: updatedAnimal.name || this.animal.name,
            description: updatedAnimal.description || this.animal.description,
            birth_date: updatedAnimal.birth_date || this.animal.birth_date,
            species: updatedAnimal.species || this.animal.species,
            breed: updatedAnimal.breed || this.animal.breed,
            profile_picture:
              updatedAnimal.profile_picture || this.animal.profile_picture,
            // Preserve weight-related data
            weights: this.animal.weights,
            weightHistory: this.animal.weightHistory,
            lastWeight: this.animal.lastWeight,
          };

          // Exit name editing mode if active
          if (this.isEditingName) {
            this.isEditingName = false;
            this.editingName = '';
          }
        }
      });

    // Handle animal deletions
    this.webSocketService
      .getAnimalDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((animalId) => {
        if (this.animal && animalId === this.animal.id) {
          this.router.navigate(['/animals']);
        }
      });
  }

  onProfilePictureUploaded(mediaId: string) {
    if (!this.animal) return;

    this.apiService
      .updateAnimal(this.animal.id, {
        profile_picture_id: mediaId,
      })
      .subscribe({
        next: (updatedAnimal) => {
          if (this.animal) {
            this.animal = {
              ...this.animal,
              ...updatedAnimal,
            };
          }
        },
        error: (error) => {
          console.error('Error updating profile picture:', error);
        },
      });
  }

  private updateChart() {
    if (!this.animal) return;

    // Sort chronologically for chart (oldest first)
    const sortedWeights = [...this.animal.weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const dates = sortedWeights.map((w) =>
      new Date(w.date).toLocaleDateString()
    );
    const weights = sortedWeights.map((w) => w.weight);

    this.weightChart = {
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Weight (kg)',
            data: weights,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
      type: 'line',
    };
  }

  private handleWeightUpdate() {
    if (!this.animal) return;

    // Sort for table (newest first)
    this.animal.weightHistory = [...this.animal.weights].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Get latest weight from the sorted array
    const latestWeight = this.animal.weightHistory[0];
    this.animal.lastWeight = latestWeight ? latestWeight.weight : null;
    this.updateChart(); // Chart will sort chronologically internally
  }

  onWeightAdded(weight: WeightEntry) {
    // Don't add the weight immediately, wait for WebSocket update
    this.showAddWeightDialog = false;
  }

  startEditingWeight(weight: WeightEntry) {
    this.editingEntry = {
      id: weight.id,
      weight: weight.weight,
      date: new Date(weight.date).toISOString().slice(0, 16),
    };
  }

  updateEditingWeight(weight: number) {
    if (this.editingEntry) {
      this.editingEntry.weight = weight;
    }
  }

  saveEditingWeight() {
    if (!this.editingEntry || !this.animal) return;

    this.apiService
      .updateWeight(this.editingEntry.id, {
        weight: this.editingEntry.weight,
        date: new Date(this.editingEntry.date),
      })
      .subscribe({
        next: (updatedWeight) => {
          if (this.animal) {
            const index = this.animal.weights.findIndex(
              (w) => w.id === updatedWeight.id
            );
            if (index !== -1) {
              this.animal.weights[index] = updatedWeight;
              this.handleWeightUpdate();
            }
          }
          this.editingEntry = null;
        },
        error: (error) => {
          console.error('Error updating weight:', error);
        },
      });
  }

  deleteWeight(weightId: string) {
    if (!this.animal) return;

    this.apiService.deleteWeight(weightId).subscribe({
      next: () => {
        if (this.animal) {
          this.animal.weights = this.animal.weights.filter(
            (w) => w.id !== weightId
          );
          this.handleWeightUpdate();
        }
      },
      error: (error) => {
        console.error('Error deleting weight:', error);
      },
    });
  }

  deleteAnimal() {
    if (!this.animal) return;

    this.apiService.deleteAnimal(this.animal.id).subscribe({
      next: () => {
        this.router.navigate(['/animals']);
      },
      error: (error) => {
        console.error('Error deleting animal:', error);
      },
    });
  }

  getProfilePictureUrl(): string | null {
    if (!this.animal || !this.animal.profile_picture) return null;
    const filename = this.animal.profile_picture.filename;
    return filename.startsWith('http')
      ? filename
      : this.apiService.getMediaUrl(filename);
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.classList.add('opacity-50');
    img.src = '/assets/images/placeholder-pet.svg';
  }

  startNameEdit() {
    this.isEditingName = true;
    this.editingName = this.animal!.name;
  }

  cancelNameEdit() {
    this.isEditingName = false;
    this.editingName = '';
  }

  saveName() {
    if (!this.animal || !this.editingName.trim()) {
      this.cancelNameEdit();
      return;
    }

    this.apiService
      .updateAnimal(this.animal.id, {
        name: this.editingName.trim(),
      })
      .subscribe({
        next: (updatedAnimal) => {
          if (this.animal) {
            this.animal = {
              ...this.animal,
              ...updatedAnimal,
            };
          }
          this.isEditingName = false;
        },
        error: (error) => {
          console.error('Error updating animal name:', error);
          this.cancelNameEdit();
        },
      });
  }

  openImageUpload() {
    const imageUploadElement = document.querySelector(
      'app-image-upload input[type="file"]'
    ) as HTMLInputElement;
    if (imageUploadElement) {
      imageUploadElement.click();
    }
  }
}
