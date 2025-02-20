import { MediaResponse } from './media.model';

export interface User {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture: MediaResponse | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_id?: string | null;
}

export interface PasswordUpdate {
  current_password: string;
  new_password: string;
}
