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
        <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text opacity-0 animate-fade-slide-up">My Animals</h1>
        <button 
          class="btn btn-primary transition-transform transition-shadow duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
          (click)="showAddDialog = true"
        >
          Add Animal
        </button>
      </div>

      <div *ngIf="isLoading" class="text-center py-8 opacity-0 animate-fade-in">
        <p class="text-gray-600 dark:text-dark-muted">Loading animals...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6 opacity-0 animate-fade-slide-down">
        {{ error }}
      </div>

      <div *ngIf="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let animal of animals; let i = index" 
             class="group relative bg-white dark:bg-dark-secondary rounded-lg shadow-sm p-6 cursor-pointer opacity-0 animate-fade-slide-up"
             [style.animation-delay]="i * 100 + 'ms'"
             [routerLink]="['/animals', animal.id]">
          <div class="transform transition-all duration-500 ease-in-out group-hover:translate-y-[-4px]">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">{{animal.name}}</h2>
            <p class="text-gray-600 dark:text-dark-muted">Created: {{animal.created_at | date}}</p>
            <p *ngIf="animal.lastWeight" class="mt-4 text-sm text-gray-500 dark:text-dark-muted">
              Last recorded weight: {{animal.lastWeight}} kg
            </p>
          </div>
          <div class="absolute inset-0 rounded-lg transition-shadow duration-500 ease-in-out group-hover:shadow-xl"></div>
        </div>
      </div>

      <div *ngIf="!isLoading && !error && animals.length === 0" class="text-center py-8 opacity-0 animate-fade-in">
        <p class="text-gray-600 dark:text-dark-muted">No animals found. Add your first animal to get started!</p>
      </div>

      <app-add-animal-dialog
        *ngIf="showAddDialog"
        (closeDialog)="showAddDialog = false"
        (animalAdded)="onAnimalAdded($event)"
      />
    </div>
  `,
  styles: [`
    @keyframes fade-slide-up {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fade-slide-down {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    .animate-fade-slide-up {
      animation: fade-slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animate-fade-slide-down {
      animation: fade-slide-down 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animate-fade-in {
      animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `]
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
    // Remove manual addition since WebSocket will handle it
    this.showAddDialog = false;
  }
} 