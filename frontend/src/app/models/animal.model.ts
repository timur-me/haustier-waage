export interface Animal {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AnimalWithWeights extends Animal {
  weightHistory: WeightEntry[];
  lastWeight?: number;
}

export interface AnimalCreate {
  name: string;
}

import { WeightEntry } from './weight.model'; 