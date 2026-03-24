import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  constructor(public authService: AuthService, public router: Router) { }

  ngOnInit() {
    this.applyGlobalTheme();
  }

  private applyGlobalTheme() {
    const prefs = localStorage.getItem('appPrefs');
    if (prefs) {
      const { darkMode, accent } = JSON.parse(prefs);
      if (darkMode) document.documentElement.classList.add('dark-theme');
      if (accent) document.documentElement.style.setProperty('--primary', accent);
    }
  }
}
