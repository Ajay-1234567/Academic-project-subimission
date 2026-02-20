import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <app-sidebar [role]="user?.role || 'student'"></app-sidebar>
    <div class="main-layout fade-in">
      <h2>Settings</h2>
      
      <div class="glass-panel section">
        <h3>Appearance</h3>
        <div class="setting-row">
          <div>
            <div class="label">Dark Mode</div>
            <div class="desc">Use dark theme for the application</div>
          </div>
          <div class="toggle checked"></div>
        </div>
        <div class="setting-row">
          <div>
            <div class="label">Reduced Motion</div>
            <div class="desc">Minimize animations</div>
          </div>
          <div class="toggle"></div>
        </div>
      </div>

      <div class="glass-panel section mt-4">
        <h3>Notifications</h3>
        <div class="setting-row">
          <div>
            <div class="label">Email Alerts</div>
            <div class="desc">Get notified on grade updates</div>
          </div>
          <div class="toggle checked"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; max-width: 800px; }
    .section { padding: 1.5rem; }
    h3 { margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .label { font-weight: 500; }
    .desc { font-size: 0.85rem; color: var(--text-secondary); }
    
    .toggle {
      width: 48px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 99px; position: relative; cursor: pointer;
    }
    .toggle::after {
      content: ''; position: absolute; left: 2px; top: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: all 0.3s;
    }
    .toggle.checked { background: var(--primary); }
    .toggle.checked::after { transform: translateX(24px); }
  `]
})
export class SettingsComponent {
  user: any;
  constructor(private auth: AuthService) {
    this.user = auth.getUser();
  }
}
