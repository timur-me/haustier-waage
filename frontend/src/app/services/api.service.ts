import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Animal, AnimalCreate, AnimalUpdate } from '../models/animal.model';
import { WeightEntry, WeightUpdate } from '../models/weight.model';
import { MediaResponse } from '../models/media.model';
import { User, UserProfileUpdate, PasswordUpdate } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Helper method to get media URL
  getMediaUrl(filename: string): string {
    return `${this.baseUrl}/api/media/${filename}`;
  }

  // Auth
  login(
    username: string
  ): Observable<{ access_token: string; token_type: string }> {
    return this.http.post<{ access_token: string; token_type: string }>(
      `${this.baseUrl}/auth/login`,
      { username }
    );
  }

  // User endpoints
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/api/users/me`);
  }

  updateProfile(update: UserProfileUpdate): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/api/users/me`, update);
  }

  updatePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<void> {
    const update: PasswordUpdate = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    return this.http.post<void>(`${this.baseUrl}/api/users/password`, update);
  }

  // Media endpoints
  uploadMedia(formData: FormData): Observable<MediaResponse> {
    return this.http.post<MediaResponse>(`${this.baseUrl}/api/media`, formData);
  }

  // Animal endpoints
  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.baseUrl}/api/animals`);
  }

  getAnimal(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.baseUrl}/api/animals/${id}`);
  }

  createAnimal(animal: AnimalCreate): Observable<Animal> {
    return this.http.post<Animal>(`${this.baseUrl}/api/animals`, animal);
  }

  updateAnimal(id: string, update: AnimalUpdate): Observable<Animal> {
    return this.http.patch<Animal>(`${this.baseUrl}/api/animals/${id}`, update);
  }

  deleteAnimal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/animals/${id}`);
  }

  // Weight endpoints
  getWeights(animalId: string): Observable<WeightEntry[]> {
    return this.http.get<WeightEntry[]>(
      `${this.baseUrl}/api/weights/animal/${animalId}`
    );
  }

  addWeightEntry(
    animalId: string,
    weight: number,
    date: Date
  ): Observable<WeightEntry> {
    return this.http.post<WeightEntry>(`${this.baseUrl}/api/weights`, {
      animal_id: animalId,
      weight: weight.toString(),
      date: date.toISOString(),
    });
  }

  updateWeight(id: string, update: WeightUpdate): Observable<WeightEntry> {
    return this.http.put<WeightEntry>(`${this.baseUrl}/api/weights/${id}`, {
      weight: update.weight.toString(),
      date: update.date.toISOString(),
    });
  }

  deleteWeight(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/weights/${id}`);
  }
}
