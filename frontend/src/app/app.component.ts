import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-dark-primary dark:text-dark-text transition-colors">
      <header class="bg-white dark:bg-dark-secondary shadow transition-colors">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-xl font-bold">Pet Weight Monitor</h1>
          <app-theme-toggle />
        </div>
      </header>
      <main class="container mx-auto px-4 py-8">
        <router-outlet />
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Initialize theme
    this.themeService.darkMode$.pipe(take(1)).subscribe(isDark => {
      this.themeService.setDarkMode(isDark);
    });
  }
}
