import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ThemeToggleComponent, CommonModule],
  template: `
    <div
      class="min-h-screen bg-gray-100 dark:bg-dark-primary dark:text-dark-text transition-colors"
    >
      <header
        class="bg-white dark:bg-dark-secondary shadow transition-colors"
        *ngIf="authService.isAuthenticated$ | async"
      >
        <div
          class="container mx-auto px-4 py-4 flex justify-between items-center"
        >
          <h1 class="text-xl font-bold">Pet Weight Monitor</h1>
          <div class="flex items-center space-x-4">
            <a
              routerLink="/profile"
              class="text-gray-600 hover:text-gray-800 dark:text-dark-muted dark:hover:text-dark-text transition-colors"
            >
              Profile
            </a>
            <app-theme-toggle />
            <button
              (click)="logout()"
              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main class="container mx-auto px-4 py-8">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Initialize theme
    this.themeService.darkMode$.pipe(take(1)).subscribe((isDark) => {
      this.themeService.setDarkMode(isDark);
    });
  }

  logout() {
    this.authService.logout();
  }
}
