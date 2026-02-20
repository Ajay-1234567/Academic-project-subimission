import { Component, inject } from '@angular/core';
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
            <button type="button" [class.active]="role === 'student'" (click)="role = 'student'">🎓 Student</button>
            <button type="button" [class.active]="role === 'faculty'" (click)="role = 'faculty'">👨‍🏫 Faculty</button>
            <button type="button" [class.active]="role === 'admin'" (click)="role = 'admin'">🛡️ Admin</button>
          </div>

          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" class="field" placeholder="you@university.edu" required>
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password" class="field" placeholder="••••••••" required>
            </div>

            <div *ngIf="errorMessage" class="error-alert">
              <span>⚠️</span> {{ errorMessage }}
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading">Sign In as {{ role | titlecase }} →</span>
              <span *ngIf="isLoading" class="loading-dots">Signing in...</span>
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
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }

    .auth-page {
      display: flex; min-height: 100vh;
    }

    /* LEFT PANEL */
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
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 380px; height: 380px;
      object-fit: contain;
      opacity: 0.08;
      pointer-events: none;
      z-index: 0;
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

    /* RIGHT PANEL */
    .right-panel {
      flex: 1;
      background: #f8fafc;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
    }
    .form-card {
      width: 100%; max-width: 420px;
      background: white; border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .form-header { margin-bottom: 1.8rem; }
    .form-header h1 { font-size: 1.7rem; font-weight: 800; color: #0f172a; margin-bottom: 0.4rem; }
    .form-header p { color: #64748b; font-size: 0.9rem; }

    /* Role Tabs */
    .role-tabs {
      display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px;
      margin-bottom: 1.8rem; border: 1px solid #e2e8f0;
    }
    .role-tabs button {
      flex: 1; background: transparent; border: none; padding: 0.55rem 0.5rem;
      border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.82rem;
      color: #64748b; transition: all 0.2s;
    }
    .role-tabs button.active {
      background: white; color: #6366f1; font-weight: 700;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Form */
    .form-group { margin-bottom: 1.2rem; }
    label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.45rem; }
    .field {
      width: 100%; padding: 0.75rem 1rem;
      border: 1.5px solid #d1d5db; border-radius: 10px;
      font-size: 0.95rem; color: #1e293b; background: white;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    .field::placeholder { color: #94a3b8; }

    .error-alert {
      display: flex; align-items: center; gap: 0.5rem;
      background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px;
      padding: 0.75rem 1rem; color: #dc2626; font-size: 0.875rem;
      margin-bottom: 1.2rem;
    }

    .btn-submit {
      width: 100%; padding: 0.85rem;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: white; border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.35); }
    .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

    .form-footer {
      display: flex; justify-content: center; align-items: center; gap: 0.5rem;
      margin-top: 1.5rem; font-size: 0.875rem; color: #64748b;
    }
    .form-footer a { color: #6366f1; font-weight: 600; text-decoration: none; }
    .form-footer a:hover { text-decoration: underline; }
    .back-home { color: #94a3b8 !important; font-weight: 500 !important; font-size: 0.85rem; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.4s ease; }

    @media (max-width: 768px) {
      .left-panel { display: none; }
      .right-panel { padding: 1.5rem; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  role = 'student';
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        if (user.role !== this.role) {
          this.errorMessage = `Please login with a ${this.role} account.`;
          this.isLoading = false;
          return;
        }
        this.authService.login(user);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
