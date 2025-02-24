import { MediaResponse } from './media.model';
import { WeightEntry } from './weight.model';

export interface Animal {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  birth_date?: string;
  species?: string;
  breed?: string;
  profile_picture?: MediaResponse;
  created_at: string;
  updated_at: string;
}

export interface AnimalWithWeights extends Animal {
  weights: WeightEntry[];
  weightHistory: WeightEntry[];
  lastWeight: number | null;
}

export interface AnimalCreate {
  name: string;
  description?: string;
  birth_date?: string;
  species?: string;
  breed?: string;
  profile_picture_id?: string | null;
}

export interface AnimalUpdate {
  name?: string;
  description?: string;
  birth_date?: string;
  species?: string;
  breed?: string;
  profile_picture_id?: string | null;
}
