import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../services/api.service';
import { AnimalWithWeights } from '../../models/animal.model';
import { WeightEntry } from '../../models/weight.model';
import { AddWeightDialogComponent } from '../add-weight-dialog/add-weight-dialog.component';
import { FormsModule } from '@angular/forms';

interface EditingWeight {
  id: string;
  weight: number;
  date: string;
}

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NgChartsModule, AddWeightDialogComponent, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-6">
        <a routerLink="/animals" class="text-blue-600 hover:text-blue-800">← Back to Animals</a>
      </div>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-600">Loading animal data...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <div *ngIf="!isLoading && !error && animal" class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{animal.name}}</h1>
            <p class="text-gray-600">Created: {{animal.created_at | date:'medium'}}</p>
          </div>
          <button 
            class="btn btn-primary"
            (click)="showAddDialog = true"
          >
            Add Weight Entry
          </button>
        </div>

        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Weight History</h2>
          <div class="h-[400px]">
            <canvas *ngIf="animal.weightHistory.length > 0"
              baseChart
              [data]="weightChartData"
              [options]="weightChartOptions"
              [type]="'line'">
            </canvas>
            <p *ngIf="animal.weightHistory.length === 0" class="text-center text-gray-600 py-8">
              No weight entries yet. Add your first weight entry to start tracking!
            </p>
          </div>
        </div>

        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Entries</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                  <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let entry of sortedWeightHistory">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <ng-container *ngIf="editingEntry?.id !== entry.id; else editDate">
                      {{entry.date | date:'medium'}}
                    </ng-container>
                    <ng-template #editDate>
                      <input
                        type="datetime-local"
                        [ngModel]="editingEntry!.date"
                        (ngModelChange)="updateEditingDate($event)"
                        class="input"
                      />
                    </ng-template>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <ng-container *ngIf="editingEntry?.id !== entry.id; else editWeight">
                      {{entry.weight}}
                    </ng-container>
                    <ng-template #editWeight>
                      <input
                        type="number"
                        step="0.1"
                        [ngModel]="editingEntry!.weight"
                        (ngModelChange)="updateEditingWeight($event)"
                        class="input"
                      />
                    </ng-template>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <ng-container *ngIf="editingEntry?.id !== entry.id; else editActions">
                      <button 
                        class="text-blue-600 hover:text-blue-800 mr-3"
                        (click)="startEdit(entry)"
                      >
                        Edit
                      </button>
                      <button 
                        class="text-red-600 hover:text-red-800"
                        (click)="deleteWeight(entry.id)"
                      >
                        Delete
                      </button>
                    </ng-container>
                    <ng-template #editActions>
                      <button 
                        class="text-green-600 hover:text-green-800 mr-3"
                        (click)="saveEdit()"
                      >
                        Save
                      </button>
                      <button 
                        class="text-gray-600 hover:text-gray-800"
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
    </div>
  `,
  styles: []
})
export class AnimalDetailComponent implements OnInit {
  animal: AnimalWithWeights | null = null;
  isLoading = true;
  error = '';
  showAddDialog = false;
  editingEntry: EditingWeight | null = null;

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
          }
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
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Animal ID not found';
      this.isLoading = false;
      return;
    }

    this.loadAnimal(id);
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
    if (this.animal) {
      this.animal.weightHistory.push(entry);
      this.animal.lastWeight = entry.weight;
      this.updateChartData();
    }
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
} 