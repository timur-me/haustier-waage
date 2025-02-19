import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { Animal, AnimalWithWeights } from '../../models/animal.model';
import { AddAnimalDialogComponent } from '../add-animal-dialog/add-animal-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, RouterLink, AddAnimalDialogComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">My Animals</h1>
        <button 
          class="btn btn-primary"
          (click)="showAddDialog = true"
        >
          Add Animal
        </button>
      </div>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-600">Loading animals...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <div *ngIf="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let animal of animals" 
             class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
             [routerLink]="['/animals', animal.id]">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">{{animal.name}}</h2>
          <p class="text-gray-600">Created: {{animal.created_at | date}}</p>
          <p *ngIf="animal.lastWeight" class="mt-4 text-sm text-gray-500">
            Last recorded weight: {{animal.lastWeight}} kg
          </p>
        </div>
      </div>

      <div *ngIf="!isLoading && !error && animals.length === 0" class="text-center py-8">
        <p class="text-gray-600">No animals found. Add your first animal to get started!</p>
      </div>

      <app-add-animal-dialog
        *ngIf="showAddDialog"
        (closeDialog)="showAddDialog = false"
        (animalAdded)="onAnimalAdded($event)"
      />
    </div>
  `,
  styles: []
})
export class AnimalsComponent implements OnInit, OnDestroy {
  animals: AnimalWithWeights[] = [];
  isLoading = true;
  error = '';
  showAddDialog = false;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.loadAnimals();
    this.setupWebSocket();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupWebSocket() {
    // Connect to WebSocket
    this.webSocketService.connect();

    // Listen for animal updates
    this.webSocketService.getAnimalUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedAnimal => {
        const index = this.animals.findIndex(a => a.id === updatedAnimal.id);
        if (index !== -1) {
          // Update existing animal
          this.animals[index] = {
            ...this.animals[index],
            ...updatedAnimal
          };
        } else {
          // Add new animal
          this.animals.unshift({
            ...updatedAnimal,
            weightHistory: [],
            lastWeight: undefined
          });
        }
      });

    // Listen for animal deletions
    this.webSocketService.getAnimalDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deletedId => {
        this.animals = this.animals.filter(a => a.id !== deletedId);
      });

    // Listen for weight updates
    this.webSocketService.getWeightUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(weightEntry => {
        const animal = this.animals.find(a => a.id === weightEntry.animal_id);
        if (animal) {
          const existingIndex = animal.weightHistory.findIndex(w => w.id === weightEntry.id);
          if (existingIndex !== -1) {
            animal.weightHistory[existingIndex] = weightEntry;
          } else {
            animal.weightHistory.push(weightEntry);
          }
          animal.weightHistory.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          animal.lastWeight = animal.weightHistory[animal.weightHistory.length - 1].weight;
        }
      });

    // Listen for weight deletions
    this.webSocketService.getWeightDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({id, animal_id}) => {
        const animal = this.animals.find(a => a.id === animal_id);
        if (animal) {
          animal.weightHistory = animal.weightHistory.filter(w => w.id !== id);
          animal.lastWeight = animal.weightHistory.length > 0 
            ? animal.weightHistory[animal.weightHistory.length - 1].weight 
            : undefined;
        }
      });
  }

  loadAnimals() {
    this.isLoading = true;
    this.error = '';

    this.apiService.getAnimals().subscribe({
      next: (animals) => {
        this.animals = animals.map(animal => ({
          ...animal,
          weightHistory: [],
          lastWeight: undefined
        }));
        // For each animal, get its latest weight
        this.animals.forEach(animal => {
          this.apiService.getAnimalWeights(animal.id).subscribe({
            next: (weights) => {
              if (weights.length > 0) {
                animal.weightHistory = weights.sort((a, b) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                animal.lastWeight = weights[weights.length - 1].weight;
              }
            },
            error: (error) => {
              console.error(`Error fetching weights for animal ${animal.id}:`, error);
            }
          });
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching animals:', error);
        this.error = 'Failed to load animals. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onAnimalAdded(animal: Animal) {
    this.animals.unshift({
      ...animal,
      weightHistory: [],
      lastWeight: undefined
    });
    this.showAddDialog = false;
  }
} 