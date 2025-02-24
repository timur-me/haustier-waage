import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { Animal, AnimalWithWeights } from '../../models/animal.model';
import { WeightEntry } from '../../models/weight.model';
import { AddAnimalDialogComponent } from '../add-animal-dialog/add-animal-dialog.component';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, RouterLink, AddAnimalDialogComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-dark-text">
          My Pets
        </h1>
        <button (click)="showAddDialog = true" class="btn btn-primary">
          Add Pet
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Error State -->
      <div
        *ngIf="error"
        class="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded relative mb-6"
      >
        {{ error }}
      </div>

      <!-- Animals Grid -->
      <div
        *ngIf="!isLoading && !error"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          *ngFor="let animal of animals; let i = index"
          class="card p-6 animate-card-appear"
          [style.animation-delay]="i * 100 + 'ms'"
        >
          <div
            class="flex items-center space-x-4 group transition-all duration-300 ease-in-out"
          >
            <!-- Profile Picture -->
            <a
              [routerLink]="['/animals', animal.id]"
              class="block w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-dark-secondary transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            >
              <img
                *ngIf="animal.profile_picture"
                [src]="apiService.getMediaUrl(animal.profile_picture.filename)"
                [alt]="animal.name"
                class="w-full h-full object-cover"
                (error)="handleImageError($event)"
              />
              <div
                *ngIf="!animal.profile_picture"
                class="w-full h-full flex items-center justify-center text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </a>

            <!-- Animal Info -->
            <div class="flex-1">
              <a
                [routerLink]="['/animals', animal.id]"
                class="block group-hover:text-blue-600 dark:group-hover:text-blue-400"
              >
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-1 transition-colors duration-300 cursor-pointer"
                >
                  {{ animal.name }}
                </h2>
              </a>
              <p class="text-sm text-gray-600 dark:text-dark-muted">
                {{ animal.species || 'No species' }}
                {{ animal.breed ? '• ' + animal.breed : '' }}
              </p>
              <p class="text-sm text-gray-500 dark:text-dark-muted mt-1">
                Last weight:
                {{
                  animal.lastWeight
                    ? animal.lastWeight + ' kg'
                    : 'No weight recorded'
                }}
              </p>
            </div>

            <!-- View Details Button -->
            <a
              [routerLink]="['/animals', animal.id]"
              class="btn bg-gray-100 hover:bg-gray-200 dark:bg-dark-secondary dark:hover:bg-dark-primary text-gray-700 dark:text-dark-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm"
            >
              View Details
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!isLoading && !error && animals.length === 0"
        class="text-center py-12 animate-fadeIn"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
          No pets yet
        </h3>
        <p class="text-gray-500 dark:text-dark-muted mb-6">
          Add your first pet to start tracking their weight
        </p>
        <button (click)="showAddDialog = true" class="btn btn-primary">
          Add Your First Pet
        </button>
      </div>

      <!-- Add Animal Dialog -->
      <app-add-animal-dialog
        *ngIf="showAddDialog"
        (closeDialog)="showAddDialog = false"
        (animalAdded)="onAnimalAdded($event)"
      />
    </div>
  `,
  styles: [
    `
      @keyframes cardAppear {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        60% {
          transform: translateY(-3px) scale(1.01);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .animate-card-appear {
        animation: cardAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        will-change: transform, opacity;
      }
    `,
  ],
})
export class AnimalsComponent implements OnInit, OnDestroy {
  animals: AnimalWithWeights[] = [];
  isLoading = true;
  error = '';
  showAddDialog = false;
  private destroy$ = new Subject<void>();

  constructor(
    public apiService: ApiService,
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
    this.webSocketService.connect();

    // Handle animal updates
    this.webSocketService
      .getAnimalUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedAnimal) => {
        const index = this.animals.findIndex((a) => a.id === updatedAnimal.id);
        if (index !== -1) {
          // Preserve existing properties and update with new data
          this.animals[index] = {
            ...this.animals[index],
            ...updatedAnimal,
            // Preserve properties that might not be in the update
            profile_picture:
              updatedAnimal.profile_picture ||
              this.animals[index].profile_picture,
            description:
              updatedAnimal.description || this.animals[index].description,
            birth_date:
              updatedAnimal.birth_date || this.animals[index].birth_date,
            species: updatedAnimal.species || this.animals[index].species,
            breed: updatedAnimal.breed || this.animals[index].breed,
            // Ensure weight-related properties are preserved
            weights: this.animals[index].weights,
            weightHistory: this.animals[index].weightHistory,
            lastWeight: this.animals[index].lastWeight,
          };

          // Create a new array reference to trigger change detection
          this.animals = [...this.animals];
        }
      });

    // Handle animal deletions
    this.webSocketService
      .getAnimalDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((animalId) => {
        this.animals = this.animals.filter((a) => a.id !== animalId);
      });

    // Handle weight updates
    this.webSocketService
      .getWeightUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe((weight) => {
        const animal = this.animals.find((a) => a.id === weight.animal_id);
        if (animal) {
          const weightIndex = animal.weights.findIndex(
            (w) => w.id === weight.id
          );
          if (weightIndex !== -1) {
            // Update existing weight
            animal.weights[weightIndex] = weight;
          } else {
            // Check if this weight was already added in the last second (to prevent duplicates)
            const recentlyAdded = animal.weights.some(
              (w) =>
                Math.abs(
                  new Date(w.date).getTime() - new Date(weight.date).getTime()
                ) < 1000 && w.weight === weight.weight
            );
            if (!recentlyAdded) {
              animal.weights.push(weight);
            }
          }
          this.updateAnimalWeightHistory(animal);
          // Create a new array reference to trigger change detection
          this.animals = [...this.animals];
        }
      });

    // Handle weight deletions
    this.webSocketService
      .getWeightDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id, animal_id }) => {
        const animal = this.animals.find((a) => a.id === animal_id);
        if (animal) {
          animal.weights = animal.weights.filter((w) => w.id !== id);
          this.updateAnimalWeightHistory(animal);
          // Create a new array reference to trigger change detection
          this.animals = [...this.animals];
        }
      });
  }

  loadAnimals() {
    this.isLoading = true;
    this.error = '';

    this.apiService.getAnimals().subscribe({
      next: (animals) => {
        this.animals = animals.map((animal) => ({
          ...animal,
          weights: [],
          weightHistory: [],
          lastWeight: null,
        }));

        // Load weights for each animal
        this.animals.forEach((animal) => {
          this.apiService.getWeights(animal.id).subscribe({
            next: (weights) => {
              animal.weights = weights;
              this.updateAnimalWeightHistory(animal);
            },
            error: (error) => {
              console.error(
                `Error loading weights for animal ${animal.id}:`,
                error
              );
            },
          });
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading animals:', error);
        this.error = 'Failed to load animals. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private updateAnimalWeightHistory(animal: AnimalWithWeights) {
    if (animal.weights.length > 0) {
      // Sort weights by date (newest first)
      animal.weightHistory = [...animal.weights].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      // Get the latest weight from the first entry
      const latestWeight = animal.weightHistory[0];
      animal.lastWeight = latestWeight ? latestWeight.weight : null;
    } else {
      animal.weightHistory = [];
      animal.lastWeight = null;
    }
  }

  onAnimalAdded(animal: Animal) {
    this.animals.unshift({
      ...animal,
      weights: [],
      weightHistory: [],
      lastWeight: null,
    });
    this.showAddDialog = false;
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/placeholder-pet.svg';
    img.classList.add('opacity-50');
  }
}
