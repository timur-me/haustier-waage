import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private readonly SALT_ROUNDS = 10;

  constructor() {}

  async hashPassword(
    password: string
  ): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
