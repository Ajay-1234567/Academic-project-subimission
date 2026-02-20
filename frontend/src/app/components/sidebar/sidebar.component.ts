import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar glass-panel">
      <div class="brand">
        <img src="logo_t.png" class="college-logo" alt="Logo">
        <span class="logo-text">EduPortal</span>
      </div>

      <nav class="menu">
        <div class="menu-label">MENU</div>
        
        <!-- Student Links -->
        <ng-container *ngIf="role === 'student'">
          <a routerLink="/student" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="menu-item">
            <i class="icon">🏠</i> Dashboard
          </a>

          <a routerLink="/student/notifications" routerLinkActive="active" class="menu-item">
            <i class="icon">🔔</i> Notifications
          </a>
        </ng-container>

        <!-- Faculty Links -->
        <ng-container *ngIf="role === 'faculty'">
          <a routerLink="/faculty" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="menu-item">
            <i class="icon">📊</i> Dashboard
          </a>
          <a routerLink="/faculty/students" routerLinkActive="active" class="menu-item">
            <i class="icon">🎓</i> My Students
          </a>
          <a routerLink="/faculty/announcements" routerLinkActive="active" class="menu-item">
            <i class="icon">📢</i> Announcements
          </a>
        </ng-container>

        <!-- Admin Links -->
        <ng-container *ngIf="role === 'admin'">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="menu-item">
            <i class="icon">🛡️</i> Dashboard
          </a>
          <a routerLink="/admin/students" routerLinkActive="active" class="menu-item">
            <i class="icon">🎓</i> Students
          </a>
          <a routerLink="/admin/faculty" routerLinkActive="active" class="menu-item">
            <i class="icon">👨‍🏫</i> Faculty
          </a>
        </ng-container>

        <div class="menu-label mt-4">ACCOUNT</div>
        <a routerLink="/profile" routerLinkActive="active" class="menu-item">
          <i class="icon">👤</i> Profile
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="menu-item">
          <i class="icon">⚙️</i> Settings
        </a>
        
        <button (click)="auth.logout()" class="menu-item logout-btn">
          <i class="icon">🚪</i> Logout
        </button>
      </nav>

      <div class="user-profile">
        <div class="avatar">{{ userInitial }}</div>
        <div class="info">
          <div class="name">{{ userName }}</div>
          <div class="email" title="{{ userEmail }}">{{ userEmail }}</div>
          <div class="role">{{ role | titlecase }}</div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      border-right: 1px solid var(--border);
      border-radius: 0;
      z-index: 100;
      background: #ffffff;
      box-shadow: 1px 0 15px rgba(0,0,0,0.05); /* Soft shadow */
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2.5rem; }
    .college-logo { width: 64px; height: 64px; object-fit: contain; flex-shrink: 0; }
    .logo-text { font-size: 1.2rem; font-weight: 800; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .menu { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .menu-label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; letter-spacing: 1px; font-weight: 600; }
    .mt-4 { margin-top: 1.5rem; }
    
    .menu-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      background: transparent;
      border: none;
      font-family: inherit;
      font-size: inherit;
      cursor: pointer;
      width: 100%;
      text-align: left;
    }
    .menu-item:hover { background: rgba(0,0,0,0.04); color: var(--text-primary); }
    .menu-item.active { background: rgba(79, 70, 229, 0.1); color: var(--primary); font-weight: 600; }
    .icon { font-style: normal; width: 20px; text-align: center; }

    .logout-btn { margin-top: auto; color: #ef4444; }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

    .user-profile {
      display: flex; align-items: center; gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .avatar { width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
    .info { display: flex; flex-direction: column; overflow: hidden; }
    .name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary); }
    .email { font-size: 0.75rem; color: #d97706; /* Amber-600 */ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
    .role { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-top: 2px; }
  `]
})
export class SidebarComponent {
  @Input() role: string = 'student';

  constructor(public auth: AuthService) { }

  get userName() { return this.auth.getUser()?.name || 'User'; }
  get userEmail() { return this.auth.getUser()?.email || ''; }
  get userInitial() { return this.userName.charAt(0); }
}
