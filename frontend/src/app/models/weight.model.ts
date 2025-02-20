export interface WeightEntry {
  id: string;
  animal_id: string;
  weight: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface WeightUpdate {
  weight: number;
  date: Date;
}
