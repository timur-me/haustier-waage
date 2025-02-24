import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(this.isDarkMode());
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    // Watch for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
          this.setDarkMode(e.matches);
        }
      });
  }

  private isDarkMode(): boolean {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  setDarkMode(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    this.darkMode.next(isDark);
  }

  toggleTheme() {
    this.setDarkMode(!this.darkMode.value);
  }
}
