import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100">
      <main class="container mx-auto px-4 py-8">
        <router-outlet />
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Pet Weight Monitor';
}
