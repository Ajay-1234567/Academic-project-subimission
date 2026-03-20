import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <!-- Top Navbar only for guest users (NOT logged in) and NOT on login page -->
    <!-- Ideally, Landing Page handles its own nav. So we just need RouterOutlet really. -->
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-content { min-height: 100vh; }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService, public router: Router) { }
}
