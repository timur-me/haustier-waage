import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Animal, AnimalCreate } from '../models/animal.model';
import { WeightEntry } from '../models/weight.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Auth
  login(username: string): Observable<{ access_token: string; token_type: string }> {
    return this.http.post<{ access_token: string; token_type: string }>(
      `${this.baseUrl}/auth/login`,
      { username }
    );
  }

  // Animals
  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.baseUrl}/animals`);
  }

  getAnimal(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.baseUrl}/animals/${id}`);
  }

  createAnimal(animal: AnimalCreate): Observable<Animal> {
    return this.http.post<Animal>(`${this.baseUrl}/animals`, animal);
  }

  updateAnimal(id: string, animal: AnimalCreate): Observable<Animal> {
    return this.http.put<Animal>(`${this.baseUrl}/animals/${id}`, animal);
  }

  deleteAnimal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/animals/${id}`);
  }

  // Weight Entries
  getAnimalWeights(animalId: string): Observable<WeightEntry[]> {
    return this.http.get<WeightEntry[]>(`${this.baseUrl}/weights/animal/${animalId}`);
  }

  addWeightEntry(animalId: string, weight: number, date: Date): Observable<WeightEntry> {
    return this.http.post<WeightEntry>(`${this.baseUrl}/weights`, {
      animal_id: animalId,
      weight,
      date: date.toISOString()
    });
  }

  updateWeightEntry(id: string, weight: number, date: Date): Observable<WeightEntry> {
    return this.http.put<WeightEntry>(`${this.baseUrl}/weights/${id}`, { 
      weight,
      date: date.toISOString()
    });
  }

  deleteWeightEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/weights/${id}`);
  }
} 