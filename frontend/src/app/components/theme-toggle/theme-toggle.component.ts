import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <button
      (click)="themeService.toggleTheme()"
      class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-secondary transition-colors"
      [attr.aria-label]="
        (themeService.darkMode$ | async)
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      "
    >
      <!-- Sun icon -->
      <svg
        *ngIf="!(themeService.darkMode$ | async)"
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="{2}"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <!-- Moon icon -->
      <svg
        *ngIf="themeService.darkMode$ | async"
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="{2}"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  `,
  styles: [],
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}
}
