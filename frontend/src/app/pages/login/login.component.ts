import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">

      <!-- Left Panel -->
      <div class="left-panel">
        <!-- Watermark Logo -->
        <img src="logo_t.png" class="watermark-logo" alt="">

        <a routerLink="/" class="brand">
          <img src="logo_t.png" class="brand-logo" alt="College Logo">
          <span class="brand-name">EduPortal</span>
        </a>
        <div class="left-content">
          <h2>Your academic journey,<br>all in one place.</h2>
          <p>Submit projects, get graded, track your progress and collaborate with faculty — seamlessly.</p>
          <div class="feature-list">
            <div class="feat-item"><span class="feat-icon">✅</span> Submit projects by subject &amp; semester</div>
            <div class="feat-item"><span class="feat-icon">✅</span> Get real-time scores &amp; feedback</div>
            <div class="feat-item"><span class="feat-icon">✅</span> See announcements &amp; deadlines</div>
            <div class="feat-item"><span class="feat-icon">✅</span> Multi-faculty assignment support</div>
          </div>
        </div>
        <div class="left-footer">Trusted by leading engineering colleges</div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <div class="form-card fade-in">
          <div class="form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <!-- Role Tabs -->
          <div class="role-tabs">
            <button type="button" [class.active]="role === 'student'" (click)="setRole('student')">
              <span class="tab-icon">🎓</span><span class="tab-label">Student</span>
            </button>
            <button type="button" [class.active]="role === 'faculty'" (click)="setRole('faculty')">
              <span class="tab-icon">👨‍🏫</span><span class="tab-label">Faculty</span>
            </button>
            <button type="button" [class.active]="role === 'admin'" (click)="setRole('admin')">
              <span class="tab-icon">🛡️</span><span class="tab-label">Admin</span>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                id="email"
                class="field"
                placeholder="group@university.edu"
                inputmode="email"
                autocomplete="email"
                autocorrect="off"
                autocapitalize="none"
                required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <div class="pw-wrap">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  id="password"
                  class="field"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required>
                <button type="button" class="pw-toggle" (click)="showPassword=!showPassword" tabindex="-1">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-alert">
              <span>⚠️</span> {{ errorMessage }}
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading">Sign In as {{ role | titlecase }} →</span>
              <span *ngIf="isLoading" class="loading-dots">Signing in<span class="dot-anim">...</span></span>
            </button>
          </form>

          <div class="form-footer">
            <span>Don't have an account?</span>
            <a routerLink="/register">Create account</a>
          </div>
          <div class="form-footer" style="margin-top: 0.5rem;">
            <a routerLink="/" class="back-home">← Back to Home</a>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }

    /* ── Page Shell ─────────────────────────────────────────── */
    .auth-page {
      display: flex;
      min-height: 100vh;
      min-height: -webkit-fill-available; /* iOS Safari full height */
    }

    /* ── LEFT PANEL (desktop only) ───────────────────────────── */
    .left-panel {
      flex: 0 0 45%;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%);
      padding: 2.5rem;
      display: flex; flex-direction: column;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .watermark-logo {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 380px; height: 380px; object-fit: contain;
      opacity: 0.08; pointer-events: none; z-index: 0;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; margin-bottom: auto; position: relative; z-index: 1; }
    .brand-logo { width: 70px; height: 70px; object-fit: contain; }
    .brand-name { font-size: 1.3rem; font-weight: 800; color: white; }
    .left-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0; position: relative; z-index: 1; }
    .left-content h2 { font-size: 2rem; font-weight: 800; line-height: 1.3; margin-bottom: 1rem; }
    .left-content p { color: rgba(255,255,255,0.8); font-size: 1rem; line-height: 1.7; margin-bottom: 2rem; }
    .feature-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .feat-item { display: flex; align-items: center; gap: 0.7rem; font-size: 0.95rem; color: rgba(255,255,255,0.9); }
    .feat-icon { font-size: 1rem; }
    .left-footer { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

    /* ── RIGHT PANEL ─────────────────────────────────────────── */
    .right-panel {
      flex: 1;
      background: var(--background);
      /* On mobile, don't use flex-center — allow natural scroll instead */
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      overflow-y: auto;
    }
    .form-card {
      width: 100%; max-width: 420px;
      background: var(--surface); border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      border: 1px solid var(--border);
    }
    .form-header { margin-bottom: 1.5rem; }
    .form-header h1 { font-size: 1.7rem; font-weight: 800; color: #0f172a; margin-bottom: 0.4rem; }
    .form-header p { color: var(--text-secondary); font-size: 0.9rem; }

    /* ── Role Tabs ───────────────────────────────────────────── */
    .role-tabs {
      display: flex; background: #ede9fe; padding: 5px; border-radius: 14px;
      margin-bottom: 1.5rem; border: 2px solid #c4b5fd; gap: 4px;
    }
    .role-tabs button {
      flex: 1; background: transparent; border: none;
      padding: 0.65rem 0.3rem;
      border-radius: 10px; cursor: pointer; font-weight: 600;
      color: #7c3aed; transition: all 0.2s;
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      touch-action: manipulation; /* prevent iOS double-tap delay */
      -webkit-tap-highlight-color: transparent;
      min-height: 56px; /* large enough touch target */
    }
    .role-tabs button .tab-icon { font-size: 1.3rem; line-height: 1; }
    .role-tabs button .tab-label { font-size: 0.73rem; font-weight: 700; letter-spacing: 0.3px; }
    .role-tabs button.active {
      background: var(--surface); color: #4f46e5;
      box-shadow: 0 2px 8px rgba(99,102,241,0.25);
    }
    .role-tabs button:not(.active):hover { background: rgba(255,255,255,0.5); }

    /* ── Form Fields ─────────────────────────────────────────── */
    .form-group { margin-bottom: 1.1rem; }
    label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }

    .pw-wrap { position: relative; }
    .pw-toggle {
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: transparent; border: none; cursor: pointer;
      font-size: 1.1rem; padding: 0.25rem;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    .field {
      width: 100%; padding: 0.8rem 1rem;
      border: 1.5px solid #d1d5db; border-radius: 10px;
      font-size: 1rem; /* 1rem prevents iOS auto-zoom on focus! */
      color: var(--text-primary); background: var(--surface);
      transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-appearance: none; /* removes iOS inner shadow */
    }
    .field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    .field::placeholder { color: var(--text-secondary); }
    /* Extra padding-right for password field so text doesn't overlap toggle */
    .pw-wrap .field { padding-right: 2.8rem; }

    /* ── Error Alert ─────────────────────────────────────────── */
    .error-alert {
      display: flex; align-items: flex-start; gap: 0.5rem;
      background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px;
      padding: 0.75rem 1rem; color: #dc2626; font-size: 0.875rem;
      margin-bottom: 1rem; line-height: 1.5;
    }

    /* ── Submit Button ───────────────────────────────────────── */
    .btn-submit {
      width: 100%; padding: 0.9rem;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: white; border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; margin-top: 0.25rem;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.35); }
    .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

    /* ── Footer Links ─────────────────────────────────────────── */
    .form-footer {
      display: flex; justify-content: center; align-items: center; gap: 0.5rem;
      margin-top: 1.25rem; font-size: 0.875rem; color: var(--text-secondary);
    }
    .form-footer a { color: #6366f1; font-weight: 600; text-decoration: none; }
    .form-footer a:hover { text-decoration: underline; }
    .back-home { color: var(--text-secondary) !important; font-weight: 500 !important; font-size: 0.85rem; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.4s ease; }

    /* ── MOBILE ──────────────────────────────────────────────── */
    @media (max-width: 768px) {
      .auth-page {
        /* Stack vertically and allow scrolling — critical fix */
        flex-direction: column;
        min-height: 100dvh; /* dynamic vh — respects browser chrome */
      }

      .left-panel { display: none; }

      .right-panel {
        /* Fill the whole screen and scroll freely */
        flex: 1;
        align-items: flex-start; /* don't center vertically — allow scroll */
        padding: 1.5rem 1rem;
        padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); /* notch phones */
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      .form-card {
        padding: 1.75rem 1.25rem;
        border-radius: 16px;
        margin: auto; /* centre within scrollable panel */
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      }

      .form-header { margin-bottom: 1.25rem; }
      .form-header h1 { font-size: 1.45rem; }

      /* Bigger touch area on role tabs */
      .role-tabs { gap: 6px; padding: 6px; }
      .role-tabs button { min-height: 60px; }
      .role-tabs button .tab-icon { font-size: 1.5rem; }
      .role-tabs button .tab-label { font-size: 0.8rem; }

      .form-footer { flex-direction: column; gap: 0.6rem; text-align: center; }
    }

    @media (max-width: 360px) {
      .right-panel { padding: 1rem 0.75rem; }
      .form-card { padding: 1.5rem 1rem; }
      .role-tabs button .tab-label { font-size: 0.72rem; }
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  role = 'student';
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  ngOnInit() {
    setTimeout(() => {
      this.email = '';
      this.password = '';
    }, 150);
  }

  setRole(newRole: string) {
    this.role = newRole;
    this.email = '';
    this.password = '';
    this.errorMessage = '';
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        // Automatically login the user with their ACTUAL role from database
        this.authService.login(user);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 0) {
           this.errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
        } else if (err.status === 401) {
           this.errorMessage = 'Invalid email or password. Please try again.';
        } else {
           const body = err.error;
           const rawErr = (typeof body === 'string') ? body : (body?.message || body?.error || JSON.stringify(body));
           this.errorMessage = String(rawErr || 'An unexpected error occurred during login.');
        }
        this.isLoading = false;
      }
    });
  }
}
