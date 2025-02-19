import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { AnimalWithWeights } from '../../models/animal.model';
import { WeightEntry } from '../../models/weight.model';
import { AddWeightDialogComponent } from '../add-weight-dialog/add-weight-dialog.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

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
    RouterLink, 
    NgChartsModule, 
    AddWeightDialogComponent, 
    DeleteConfirmationDialogComponent,
    FormsModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-6 animate-fadeIn">
        <a routerLink="/animals" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">← Back to Animals</a>
      </div>

      <div *ngIf="isLoading" class="text-center py-8 animate-fadeIn">
        <p class="text-gray-600 dark:text-dark-muted">Loading animal data...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6 animate-slideIn">
        {{ error }}
      </div>

      <div *ngIf="!isLoading && !error && animal" class="card p-6 animate-slideIn">
        <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <div class="flex items-center gap-4 flex-wrap">
              <ng-container *ngIf="!isEditingName; else editNameTemplate">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">{{animal.name}}</h1>
                <button 
                  class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:scale-105"
                  (click)="startEditName()"
                >
                  Edit Name
                </button>
              </ng-container>
              <ng-template #editNameTemplate>
                <input
                  type="text"
                  [(ngModel)]="editingName"
                  class="input text-3xl font-bold mb-2 transition-all"
                  (keyup.enter)="saveName()"
                />
                <div class="flex gap-2">
                  <button 
                    class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors hover:scale-105"
                    (click)="saveName()"
                  >
                    Save
                  </button>
                  <button 
                    class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors hover:scale-105"
                    (click)="cancelEditName()"
                  >
                    Cancel
                  </button>
                </div>
              </ng-template>
            </div>
            <p class="text-gray-600 dark:text-dark-muted">Created: {{animal.created_at | date:'medium'}}</p>
          </div>
          <div class="flex gap-4">
            <button 
              class="btn btn-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
              (click)="showAddDialog = true"
            >
              Add Weight Entry
            </button>
            <button 
              class="btn btn-danger transition-all duration-300 hover:scale-105 hover:shadow-lg"
              (click)="showDeleteConfirmation = true"
            >
              Delete Animal
            </button>
          </div>
        </div>

        <div class="mt-8 animate-slideIn" style="animation-delay: 100ms">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">Weight History</h2>
          <div class="h-[400px] bg-white dark:bg-dark-secondary p-4 rounded-lg transition-all hover:shadow-lg">
            <canvas *ngIf="animal.weightHistory.length > 0"
              baseChart
              [data]="weightChartData"
              [options]="weightChartOptions"
              [type]="'line'">
            </canvas>
            <p *ngIf="animal.weightHistory.length === 0" class="text-center text-gray-600 dark:text-dark-muted py-8">
              No weight entries yet. Add your first weight entry to start tracking!
            </p>
          </div>
        </div>

        <div class="mt-8 animate-slideIn" style="animation-delay: 200ms">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">Recent Entries</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="table-header px-6 py-3">Date</th>
                  <th class="table-header px-6 py-3">Weight (kg)</th>
                  <th class="table-header px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let entry of sortedWeightHistory; let i = index" 
                    class="table-row transition-colors hover:bg-gray-50 dark:hover:bg-dark-secondary animate-slideIn"
                    [style.animation-delay]="(300 + i * 50) + 'ms'">
                  <td class="table-cell px-6 py-4 whitespace-nowrap">
                    <ng-container *ngIf="editingEntry?.id !== entry.id; else editDate">
                      {{entry.date | date:'medium'}}
                    </ng-container>
                    <ng-template #editDate>
                      <input
                        type="datetime-local"
                        [ngModel]="editingEntry!.date"
                        (ngModelChange)="updateEditingDate($event)"
                        class="input transition-all"
                      />
                    </ng-template>
                  </td>
                  <td class="table-cell px-6 py-4 whitespace-nowrap">
                    <ng-container *ngIf="editingEntry?.id !== entry.id; else editWeight">
                      {{entry.weight}}
                    </ng-container>
                    <ng-template #editWeight>
                      <input
                        type="number"
                        step="0.1"
                        [ngModel]="editingEntry!.weight"
                        (ngModelChange)="updateEditingWeight($event)"
                        class="input transition-all"
                      />
                    </ng-template>
                  </td>
                  <td class="table-cell px-6 py-4 whitespace-nowrap text-right">
                    <ng-container *ngIf="editingEntry?.id !== entry.id; else editActions">
                      <button 
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3 transition-all hover:scale-105"
                        (click)="startEdit(entry)"
                      >
                        Edit
                      </button>
                      <button 
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-all hover:scale-105"
                        (click)="deleteWeight(entry.id)"
                      >
                        Delete
                      </button>
                    </ng-container>
                    <ng-template #editActions>
                      <button 
                        class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3 transition-all hover:scale-105"
                        (click)="saveEdit()"
                      >
                        Save
                      </button>
                      <button 
                        class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-all hover:scale-105"
                        (click)="cancelEdit()"
                      >
                        Cancel
                      </button>
                    </ng-template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <app-add-weight-dialog
        *ngIf="showAddDialog && animal"
        [animalId]="animal.id"
        (closeDialog)="showAddDialog = false"
        (weightAdded)="onWeightAdded($event)"
      />

      <app-delete-confirmation-dialog
        *ngIf="showDeleteConfirmation && animal"
        [message]="getDeleteConfirmationMessage()"
        (confirmed)="confirmDelete()"
        (cancelled)="showDeleteConfirmation = false"
      />
    </div>
  `,
  styles: []
})
export class AnimalDetailComponent implements OnInit, OnDestroy {
  animal: AnimalWithWeights | null = null;
  isLoading = true;
  error = '';
  showAddDialog = false;
  showDeleteConfirmation = false;
  editingEntry: EditingWeight | null = null;
  isEditingName = false;
  editingName = '';
  private destroy$ = new Subject<void>();

  weightChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Weight (kg)',
        fill: false,
        tension: 0.1,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)'
      }
    ]
  };

  weightChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return value + ' kg';
          },
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : undefined
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : undefined
        }
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : undefined
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : undefined
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  get sortedWeightHistory(): WeightEntry[] {
    return this.animal?.weightHistory.slice().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ) ?? [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Animal ID not found';
      this.isLoading = false;
      return;
    }

    this.loadAnimal(id);
    this.setupWebSocket(id);

    // Update chart options for dark mode
    this.weightChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value + ' kg';
            },
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : undefined
          },
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : undefined
          }
        },
        x: {
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : undefined
          },
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : undefined
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupWebSocket(animalId: string) {
    // Connect to WebSocket
    this.webSocketService.connect();

    // Listen for animal updates
    this.webSocketService.getAnimalUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedAnimal => {
        if (this.animal && updatedAnimal.id === this.animal.id) {
          this.animal = {
            ...this.animal,
            ...updatedAnimal,
            weightHistory: this.animal.weightHistory
          };
          if (this.isEditingName) {
            this.editingName = updatedAnimal.name;
          }
        }
      });

    // Listen for animal deletions
    this.webSocketService.getAnimalDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deletedId => {
        if (this.animal && deletedId === this.animal.id) {
          this.router.navigate(['/animals']);
        }
      });

    // Listen for weight updates
    this.webSocketService.getWeightUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(weightEntry => {
        if (this.animal && weightEntry.animal_id === this.animal.id) {
          const existingIndex = this.animal.weightHistory.findIndex(w => w.id === weightEntry.id);
          if (existingIndex !== -1) {
            this.animal.weightHistory[existingIndex] = weightEntry;
          } else {
            this.animal.weightHistory.push(weightEntry);
          }
          this.updateChartData();
          
          // If we're editing this entry, update the form
          if (this.editingEntry && this.editingEntry.id === weightEntry.id) {
            this.editingEntry = {
              id: weightEntry.id,
              weight: weightEntry.weight,
              date: new Date(weightEntry.date).toISOString().slice(0, 16)
            };
          }
        }
      });

    // Listen for weight deletions
    this.webSocketService.getWeightDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({id, animal_id}) => {
        if (this.animal && animal_id === this.animal.id) {
          this.animal.weightHistory = this.animal.weightHistory.filter(w => w.id !== id);
          this.updateChartData();
          
          // If we're editing this entry, cancel the edit
          if (this.editingEntry && this.editingEntry.id === id) {
            this.editingEntry = null;
          }
        }
      });
  }

  loadAnimal(id: string) {
    this.isLoading = true;
    this.error = '';

    // Load animal details
    this.apiService.getAnimal(id).subscribe({
      next: (animal) => {
        // Load weight history
        this.apiService.getAnimalWeights(id).subscribe({
          next: (weights) => {
            const sortedWeights = weights.sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            this.animal = {
              ...animal,
              weightHistory: sortedWeights,
              lastWeight: sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : undefined
            };

            // Update chart data
            this.updateChartData();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching weight history:', error);
            this.error = 'Failed to load weight history. Please try again.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error fetching animal:', error);
        this.error = 'Failed to load animal details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  updateChartData() {
    if (this.animal) {
      const sortedEntries = [...this.animal.weightHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      this.weightChartData.labels = sortedEntries.map(entry => 
        new Date(entry.date).toLocaleDateString()
      );
      this.weightChartData.datasets[0].data = sortedEntries.map(entry => entry.weight);

      // Force chart update
      this.weightChartData = { ...this.weightChartData };
    }
  }

  onWeightAdded(entry: WeightEntry) {
    // Remove manual addition since WebSocket will handle it
    this.showAddDialog = false;
  }

  startEdit(entry: WeightEntry) {
    this.editingEntry = {
      id: entry.id,
      weight: entry.weight,
      date: new Date(entry.date).toISOString().slice(0, 16)
    };
  }

  updateEditingWeight(weight: number) {
    if (this.editingEntry) {
      this.editingEntry.weight = weight;
    }
  }

  updateEditingDate(date: string) {
    if (this.editingEntry) {
      this.editingEntry.date = date;
    }
  }

  saveEdit() {
    if (!this.editingEntry || !this.animal) return;

    this.apiService.updateWeightEntry(
      this.editingEntry.id,
      this.editingEntry.weight,
      new Date(this.editingEntry.date)
    ).subscribe({
      next: (updatedEntry) => {
        const index = this.animal!.weightHistory.findIndex(w => w.id === updatedEntry.id);
        if (index !== -1) {
          this.animal!.weightHistory[index] = updatedEntry;
          this.updateChartData();
        }
        this.editingEntry = null;
      },
      error: (error) => {
        console.error('Error updating weight entry:', error);
        this.error = 'Failed to update weight entry. Please try again.';
      }
    });
  }

  cancelEdit() {
    this.editingEntry = null;
  }

  startEditName() {
    if (!this.animal) return;
    this.editingName = this.animal.name;
    this.isEditingName = true;
  }

  saveName() {
    if (!this.animal || !this.editingName.trim()) return;

    this.apiService.updateAnimal(this.animal.id, { name: this.editingName.trim() }).subscribe({
      next: (updatedAnimal) => {
        if (this.animal) {
          this.animal.name = updatedAnimal.name;
        }
        this.isEditingName = false;
      },
      error: (error) => {
        console.error('Error updating animal name:', error);
        this.error = 'Failed to update animal name. Please try again.';
      }
    });
  }

  cancelEditName() {
    this.isEditingName = false;
    this.editingName = '';
  }

  deleteWeight(weightId: string) {
    if (!this.animal) return;

    if (confirm('Are you sure you want to delete this weight entry?')) {
      this.apiService.deleteWeightEntry(weightId).subscribe({
        next: () => {
          if (this.animal) {
            this.animal.weightHistory = this.animal.weightHistory.filter(w => w.id !== weightId);
            if (this.animal.weightHistory.length > 0) {
              const latestWeight = this.sortedWeightHistory[0];
              this.animal.lastWeight = latestWeight.weight;
            } else {
              this.animal.lastWeight = undefined;
            }
            this.updateChartData();
          }
        },
        error: (error) => {
          console.error('Error deleting weight entry:', error);
          this.error = 'Failed to delete weight entry. Please try again.';
        }
      });
    }
  }

  getDeleteConfirmationMessage(): string {
    if (!this.animal) return '';
    
    return this.animal.weightHistory.length > 0
      ? `Are you sure you want to delete ${this.animal.name}? This will also delete all ${this.animal.weightHistory.length} weight entries.`
      : `Are you sure you want to delete ${this.animal.name}?`;
  }

  confirmDelete() {
    if (!this.animal) return;

    this.apiService.deleteAnimal(this.animal.id).subscribe({
      next: () => {
        this.router.navigate(['/animals']);
      },
      error: (error) => {
        console.error('Error deleting animal:', error);
        this.error = 'Failed to delete animal. Please try again.';
        this.showDeleteConfirmation = false;
      }
    });
  }
} 