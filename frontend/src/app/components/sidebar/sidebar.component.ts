import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <button class="mobile-toggle" (click)="toggleMenu()">
      <span *ngIf="!isMobileMenuOpen">☰</span>
      <span *ngIf="isMobileMenuOpen">✕</span>
    </button>

    <aside class="sidebar glass-panel" [class.open]="isMobileMenuOpen">
      <div class="brand">
        <img src="logo_t.png" class="college-logo" alt="Logo">
        <span class="logo-text">EduPortal</span>
      </div>

      <nav class="menu" (click)="closeMenu()">
        <!-- Added click handler to auto-close menu on mobile when a link is clicked -->
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
          <a routerLink="/faculty/groups" routerLinkActive="active" class="menu-item">
            <i class="icon">👥</i> Groups
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
          <a routerLink="/admin/faculty-overview" routerLinkActive="active" class="menu-item">
            <i class="icon">📊</i> Faculty Overview
          </a>
          <a routerLink="/admin/sections" routerLinkActive="active" class="menu-item">
            <i class="icon">🏢</i> Sections
          </a>
          <a routerLink="/admin/projects" routerLinkActive="active" class="menu-item">
            <i class="icon">🌍</i> Projects
          </a>
        </ng-container>

        <div class="menu-label mt-4">ACCOUNT</div>
        <a routerLink="/profile" routerLinkActive="active" class="menu-item">
          <i class="icon">👤</i> Profile
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="menu-item">
          <i class="icon">⚙️</i> Settings
        </a>
        

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

    <!-- Overlay backrop immediately behind the sidebar to close it when clicking empty space -->
    <div *ngIf="isMobileMenuOpen" class="sidebar-overlay" (click)="closeMenu()"></div>
  `,
  styles: [`
    .mobile-toggle {
      display: none;
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 1000;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      width: 44px;
      height: 44px;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      align-items: center;
      justify-content: center;
    }

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
      z-index: 900;
      background: var(--surface);
      box-shadow: 1px 0 15px rgba(0,0,0,0.1); 
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2.5rem; }
    .college-logo { width: 64px; height: 64px; object-fit: contain; flex-shrink: 0; }
    .logo-text { font-size: 1.2rem; font-weight: 800; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .menu { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; overflow-x: hidden; padding-right: 5px; }
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
    .menu-item:hover { background: var(--border); color: var(--text-primary); }
    .menu-item.active { background: rgba(var(--primary-rgb, 79, 70, 229), 0.1); color: var(--primary); font-weight: 600; }
    .icon { font-style: normal; width: 20px; text-align: center; }

    .logout-btn { margin-top: auto; color: #ef4444; }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

    .user-profile {
      display: flex; align-items: center; gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .avatar { width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; flex-shrink: 0; }
    .info { display: flex; flex-direction: column; overflow: hidden; }
    .name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary); }
    .email { font-size: 0.75rem; color: #d97706; /* Amber-600 */ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
    .role { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-top: 2px; }

    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 850;
      backdrop-filter: blur(2px);
    }

    /* MOBILE RESPONSIVE STYLES */
    @media (max-width: 1024px) {
      .mobile-toggle {
        display: flex;
      }
      .sidebar {
        transform: translateX(-100%);
        width: 280px; /* slightly larger hit target for phones */
        box-shadow: 4px 0 24px rgba(0,0,0,0.15);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .sidebar-overlay {
        display: block;
      }
      .sidebar.open {
        transform: translateX(0);
        box-shadow: 10px 0 50px rgba(0,0,0,0.3);
      }
      .brand { margin-top: 3rem; } /* Gives room for X button on mobile */
    }
  `]
})
export class SidebarComponent {
  @Input() role: string = 'student';
  isMobileMenuOpen = false;

  constructor(public auth: AuthService) { }

  get userName() { return this.auth.getUser()?.name || 'User'; }
  get userEmail() { return this.auth.getUser()?.email || ''; }
  get userInitial() { return this.userName.charAt(0); }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMenu() {
    this.isMobileMenuOpen = false;
  }
}
