import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <app-sidebar [role]="user?.role || 'student'"></app-sidebar>
    <div class="main-layout fade-in">

      <!-- Page Header -->
      <header class="page-header">
        <div class="header-icon">⚙️</div>
        <div>
          <h1 style="color: #ff4d4d; text-shadow: 0 0 10px rgba(255, 77, 77, 0.5);">Settings (v-ULTRA)</h1>
          <p>Manage your account preferences and application settings</p>
        </div>
        <div class="role-badge" [class]="user?.role">{{ user?.role | titlecase }}</div>
      </header>

      <!-- Success / Error Toast -->
      <div class="toast success" *ngIf="successMsg" (click)="successMsg=''">
        <span>✅</span> {{ successMsg }}
      </div>
      <div class="toast error" *ngIf="errorMsg" (click)="errorMsg=''">
        <span>❌</span> {{ errorMsg }}
      </div>

      <div class="settings-grid">

        <!-- LEFT COLUMN -->
        <div class="settings-col">

          <!-- Account Security -->
          <section class="settings-card">
            <div class="card-heading">
              <span class="card-icon">🔐</span>
              <div>
                <h2>Account Security</h2>
                <p>Update your password</p>
              </div>
            </div>

            <div class="form-group">
              <label>Current Password</label>
              <div class="input-wrap">
                <input [type]="showOld ? 'text' : 'password'" [(ngModel)]="oldPassword" placeholder="Enter current password" class="field" />
                <button class="eye-btn" (click)="showOld=!showOld">{{ showOld ? '🙈' : '👁️' }}</button>
              </div>
            </div>
            <div class="form-group">
              <label>New Password</label>
              <div class="input-wrap">
                <input [type]="showNew ? 'text' : 'password'" [(ngModel)]="newPassword" placeholder="At least 6 characters" class="field" />
                <button class="eye-btn" (click)="showNew=!showNew">{{ showNew ? '🙈' : '👁️' }}</button>
              </div>
              <div class="strength-bar" *ngIf="newPassword.length > 0">
                <div class="bar" [style.width]="strengthPct + '%'" [class]="strengthClass"></div>
              </div>
              <span class="strength-label" *ngIf="newPassword.length > 0" [class]="strengthClass">{{ strengthLabel }}</span>
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <div class="input-wrap">
                <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="confirmPassword" placeholder="Repeat new password" class="field" [class.mismatch]="confirmPassword && newPassword !== confirmPassword" />
                <button class="eye-btn" (click)="showConfirm=!showConfirm">{{ showConfirm ? '🙈' : '👁️' }}</button>
              </div>
              <span class="hint error-hint" *ngIf="confirmPassword && newPassword !== confirmPassword">Passwords do not match</span>
            </div>

            <button class="btn-primary" (click)="changePassword()" [disabled]="isSavingPw">
              <span *ngIf="!isSavingPw">🔒 Update Password</span>
              <span *ngIf="isSavingPw" class="spinner"></span>
            </button>
          </section>

          <!-- Appearance -->
          <section class="settings-card">
            <div class="card-heading">
              <span class="card-icon">🎨</span>
              <div>
                <h2>Appearance</h2>
                <p>Customize the look and feel</p>
              </div>
            </div>

            <div class="toggle-row">
              <div class="toggle-info">
                <div class="toggle-label">Dark Mode</div>
                <div class="toggle-desc">Switch to dark theme across the app</div>
              </div>
              <button class="toggle-switch" [class.on]="prefs.darkMode" (click)="toggle('darkMode')">
                <span class="knob"></span>
              </button>
            </div>

            <div class="form-group mt-4">
              <label>Accent Color</label>
              <div class="color-grid">
                <button *ngFor="let c of accentColors" class="color-dot" [style.background]="c.value"
                  [class.selected]="prefs.accent === c.value" (click)="setAccent(c.value)" [title]="c.name">
                  <span *ngIf="prefs.accent === c.value">✓</span>
                </button>
              </div>
            </div>
          </section>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="settings-col">



          <!-- Notifications -->
          <section class="settings-card">
            <div class="card-heading">
              <span class="card-icon">🔔</span>
              <div>
                <h2>Notifications</h2>
                <p>Control what alerts you receive</p>
              </div>
            </div>

            <div class="toggle-row">
              <div class="toggle-info">
                <div class="toggle-label">Email Alerts</div>
                <div class="toggle-desc">Receive critical notifications via email</div>
              </div>
              <button class="toggle-switch" [class.on]="notifPrefs.email" (click)="toggleNotif('email')">
                <span class="knob"></span>
              </button>
            </div>
          </section>

          <!-- Logout Card -->
          <section class="settings-card logout-card">
            <div class="card-heading">
              <span class="card-icon logout-icon">🚪</span>
              <div>
                <h2>Account Session</h2>
                <p>End your current session</p>
              </div>
            </div>
            <div class="logout-content">
              <p class="logout-text">You are currently logged in as <b>{{ user?.name }}</b>.</p>
              <button class="btn-logout" (click)="logout()">
                <span>🚪</span> Sign Out from Portal
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .main-layout { margin-left: 250px; padding: 2rem; min-height: 100vh; background: var(--background); }
    @media (max-width: 1024px) { .main-layout { margin-left: 0; padding: 5rem 1.25rem 2rem; } }

    /* Header */
    .page-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .header-icon { font-size: 2.5rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 16px; flex-shrink: 0; }
    .page-header h1 { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
    .page-header p { color: var(--text-secondary); margin: 0; font-size: 0.95rem; }
    .role-badge { margin-left: auto; padding: 0.4rem 1rem; border-radius: 99px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .role-badge.student { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
    .role-badge.faculty { background: rgba(22, 163, 74, 0.1); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.2); }
    .role-badge.admin   { background: rgba(217, 119, 6, 0.1); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.2); }

    /* Toast */
    .toast { position: fixed; top: 1.5rem; right: 1.5rem; padding: 0.9rem 1.5rem; border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; z-index: 9999; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
    .toast.success { background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; }
    .toast.error   { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* Grid */
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .settings-col { display: flex; flex-direction: column; gap: 1.5rem; }
    @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }

    /* Card */
    .settings-card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .card-heading { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.75rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
    .card-icon { font-size: 1.5rem; background: var(--background); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; flex-shrink: 0; border: 1px solid var(--border); }
    .card-heading h2 { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.2rem; }
    .card-heading p  { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }

    /* Logout Card Styling */
    .logout-card { border-top: 3px solid #ef4444; }
    .logout-icon { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }
    .logout-content { display: flex; flex-direction: column; gap: 1rem; }
    .logout-text { font-size: 0.9rem; color: var(--text-secondary); }
    .btn-logout { 
      background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; 
      padding: 0.75rem; border-radius: 10px; font-weight: 700; 
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: all 0.2s; font-size: 0.9rem; cursor: pointer;
    }
    .btn-logout:hover { background: #ef4444; color: white; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }

    /* Form */
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
    .input-wrap { position: relative; }
    .field { width: 100%; padding: 0.7rem 2.8rem 0.7rem 0.9rem; border: 1px solid var(--border); border-radius: 10px; font-size: 0.95rem; color: var(--text-primary); background: var(--background); transition: all 0.2s; box-sizing: border-box; font-family: inherit; }
    .field:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); background: var(--surface); }
    .eye-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; font-size: 1rem; color: var(--text-secondary); }
    .mt-4 { margin-top: 1.25rem; }

    /* Password Strength */
    .strength-bar { height: 4px; background: var(--border); border-radius: 99px; margin-top: 0.5rem; overflow: hidden; }
    .bar { height: 100%; border-radius: 99px; transition: width 0.4s, background 0.4s; }
    .bar.weak   { background: #ef4444; }
    .bar.fair   { background: #f59e0b; }
    .bar.strong { background: #22c55e; }
    .strength-label { font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem; display: block; }
    .strength-label.weak   { color: #ef4444; }
    .strength-label.fair   { color: #f59e0b; }
    .strength-label.strong { color: #22c55e; }
    .error-hint { color: #ef4444; font-size: 0.78rem; display: block; margin-top: 0.3rem; }

    /* Toggle switch */
    .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid var(--border); }
    .toggle-row:last-of-type { border-bottom: none; }
    .toggle-info { flex: 1; padding-right: 1.5rem; }
    .toggle-label { font-size: 0.92rem; font-weight: 600; color: var(--text-primary); }
    .toggle-desc  { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.1rem; }

    .toggle-switch { width: 48px; height: 26px; background: var(--border); border-radius: 99px; border: none; cursor: pointer; position: relative; transition: background 0.3s; flex-shrink: 0; padding: 0; }
    .toggle-switch.on { background: var(--primary); }
    .toggle-switch .knob { position: absolute; width: 20px; height: 20px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: transform 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
    .toggle-switch.on .knob { transform: translateX(22px); }

    /* Accent Colors */
    .color-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem; }
    .color-dot { width: 32px; height: 32px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: white; font-weight: bold; transition: transform 0.2s; }
    .color-dot:hover { transform: scale(1.15); }
    .color-dot.selected { border-color: var(--text-primary); transform: scale(1.1); box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--primary); }

    /* Buttons */
    .btn-primary { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 0.5rem; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px var(--primary-glow); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  user: any = null;

  // Password form
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOld = false;
  showNew = false;
  showConfirm = false;
  isSavingPw = false;

  successMsg = '';
  errorMsg = '';

  // Accent colors
  accentColors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Slate', value: '#475569' },
  ];

  // Preferences
  prefs = {
    darkMode: false,
    accent: '#6366f1'
  };

  notifPrefs = {
    email: true
  };

  ngOnInit() {
    this.user = this.authService.getUser();
    this.loadPrefs();
  }

  // ─── Password Strength ───────────────────────────────────────────────────────
  get strengthPct(): number {
    const pw = this.newPassword;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return (score / 5) * 100;
  }
  get strengthClass(): string {
    const p = this.strengthPct;
    if (p <= 40) return 'weak';
    if (p <= 70) return 'fair';
    return 'strong';
  }
  get strengthLabel(): string {
    const c = this.strengthClass;
    return c === 'weak' ? 'Weak' : c === 'fair' ? 'Fair' : 'Strong';
  }

  // ─── Password Change ─────────────────────────────────────────────────────────
  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.showError('Please fill all password fields.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.showError('New passwords do not match.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.showError('Password must be at least 6 characters.');
      return;
    }
    this.isSavingPw = true;
    this.apiService.updateProfile(this.user.id, { 
      password: this.newPassword,
      oldPassword: this.oldPassword 
    }).subscribe({
      next: () => {
        this.isSavingPw = false;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showSuccess('Password updated successfully!');
      },
      error: (err) => {
        this.isSavingPw = false;
        console.error('Password Update Error:', err);
        
        let msg = 'Failed to update password. Please try again.';
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else {
            msg = err.error.message || err.error.error || err.error.details || msg;
          }
        } else if (err.message) {
          msg = err.message;
        }
        
        const statusCode = err.status || 'unknown';
        this.showError(`[V-ULTRA] Error ${statusCode}: ${msg}`);
      }
    });
  }

  // ─── Toggles ─────────────────────────────────────────────────────────────────
  toggle(key: keyof typeof this.prefs) {
    (this.prefs as any)[key] = !(this.prefs as any)[key];
    if (key === 'darkMode') this.applyTheme();
    this.savePrefs();
  }

  toggleNotif(key: keyof typeof this.notifPrefs) {
    (this.notifPrefs as any)[key] = !(this.notifPrefs as any)[key];
    this.saveNotifPrefs();
  }

  setAccent(color: string) {
    this.prefs.accent = color;
    this.applyTheme();
    this.savePrefs();
  }

  // ─── Save Preferences ────────────────────────────────────────────────────────
  savePrefs() {
    localStorage.setItem('appPrefs', JSON.stringify(this.prefs));
    this.applyTheme();
  }

  saveNotifPrefs() {
    localStorage.setItem('notifPrefs', JSON.stringify(this.notifPrefs));
    if (this.user?.id) {
      this.apiService.updateEmailPreference(this.user.id, this.notifPrefs.email).subscribe();
    }
  }

  // ─── Apply Theme ─────────────────────────────────────────────────────────────
  applyTheme() {
    if (this.prefs.darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    
    const hex = this.prefs.accent || '#6366f1';
    document.documentElement.style.setProperty('--primary', hex);
    
    const rb = parseInt(hex.slice(1, 3), 16);
    const gb = parseInt(hex.slice(3, 5), 16);
    const bb = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${rb}, ${gb}, ${bb}`);
    document.documentElement.style.setProperty('--primary-glow', `rgba(${rb}, ${gb}, ${bb}, 0.1)`);
  }

  // ─── Load Preferences ────────────────────────────────────────────────────────
  loadPrefs() {
    const stored = localStorage.getItem('appPrefs');
    if (stored) Object.assign(this.prefs, JSON.parse(stored));

    const notif = localStorage.getItem('notifPrefs');
    if (notif) Object.assign(this.notifPrefs, JSON.parse(notif));

    this.applyTheme();
  }

  logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    this.authService.logout();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  showSuccess(msg: string) {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => this.successMsg = '', 3500);
  }

  showError(msg: string) {
    this.errorMsg = msg;
    this.successMsg = '';
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
