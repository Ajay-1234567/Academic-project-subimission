import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
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
          <h2>Start your academic journey today.</h2>
          <p>Create a free account and get access to subject-based project submissions, faculty feedback, and real-time evaluations.</p>
          <div class="role-info">
            <div class="role-item student-c">
              <span class="ri">🎓</span>
              <div>
                <strong>Student</strong>
                <p>Submit & track projects</p>
              </div>
            </div>
            <div class="role-item faculty-c">
              <span class="ri">👨‍🏫</span>
              <div>
                <strong>Faculty</strong>
                <p>Grade & manage students</p>
              </div>
            </div>
            <div class="role-item admin-c">
              <span class="ri">🛡️</span>
              <div>
                <strong>Admin</strong>
                <p>Oversee entire institution</p>
              </div>
            </div>
          </div>
        </div>
        <div class="left-footer">Academic Project Submission Portal — © 2026</div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <div class="form-card fade-in">
          <div class="form-header">
            <h1>Create account</h1>
            <p>Join EduPortal to manage your academic submissions</p>
          </div>

          <!-- Role Tabs -->
          <div class="role-tabs">
            <button type="button" [class.active]="role === 'student'" (click)="role = 'student'">🎓 Student</button>
            <button type="button" [class.active]="role === 'faculty'" (click)="role = 'faculty'">👨‍🏫 Faculty</button>
            <button type="button" [class.active]="role === 'admin'" (click)="role = 'admin'">🛡️ Admin</button>
          </div>

          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="name" name="name" class="field" placeholder="e.g. G. Ajay Kumar" required>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" class="field" placeholder="you@university.edu" required>
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password" class="field" placeholder="Min. 6 characters" required minlength="6">
            </div>
            
            <!-- Student Specific Fields -->
            <div *ngIf="role === 'student'" class="fade-in">
              <div class="form-group">
                <label>Branch</label>
                <select [(ngModel)]="branch" name="branch" class="field" required>
                  <option value="">Select Branch</option>
                  <option *ngFor="let b of branchList" [value]="b.name">{{ b.name }}</option>
                </select>
              </div>
              <div class="form-group" *ngIf="showDomainDropdown()">
                <label>Domain / Specialization</label>
                <select [(ngModel)]="domain" name="domain" class="field">
                  <option value="">Select Domain (Optional)</option>
                  <option *ngFor="let d of getDomainsForBranch()" [value]="d">{{ d }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Academic Year</label>
                <select [(ngModel)]="academicYear" name="academicYear" class="field" required>
                  <option value="">Select Year</option>
                  <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                </select>
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-alert">
              <span>⚠️</span>
              <div>
                {{ errorMessage }}
                <a *ngIf="isAlreadyRegistered" routerLink="/login" class="login-redirect">Sign in instead →</a>
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading">Create {{ role | titlecase }} Account →</span>
              <span *ngIf="isLoading">Creating account...</span>
            </button>
          </form>

          <div class="form-footer">
            <span>Already have an account?</span>
            <a routerLink="/login">Sign in</a>
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
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%);
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
    .left-content h2 { font-size: 1.9rem; font-weight: 800; line-height: 1.3; margin-bottom: 1rem; }
    .left-content > p { color: rgba(255,255,255,0.7); font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem; }

    .role-info { display: flex; flex-direction: column; gap: 1rem; }
    .role-item { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.07); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .ri { font-size: 1.5rem; }
    .role-item strong { display: block; color: white; font-size: 0.95rem; font-weight: 700; margin-bottom: 0.2rem; }
    .role-item p { color: rgba(255,255,255,0.6); font-size: 0.82rem; margin: 0; }

    .student-c { border-left: 3px solid #818cf8 !important; }
    .faculty-c { border-left: 3px solid #34d399 !important; }
    .admin-c { border-left: 3px solid #fbbf24 !important; }

    .left-footer { font-size: 0.8rem; color: rgba(255,255,255,0.35); }

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
      display: flex; align-items: flex-start; gap: 0.5rem;
      background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px;
      padding: 0.75rem 1rem; color: #dc2626; font-size: 0.875rem;
      margin-bottom: 1.2rem;
    }
    .login-redirect { display: block; color: #6366f1; font-weight: 600; text-decoration: none; margin-top: 0.3rem; font-size: 0.9rem; }

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
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = 'student';

  // Student fields
  branch = '';
  domain = '';
  academicYear = '';
  branchList = [
    {
      name: 'Computer Science (CSE)',
      domains: [
        'Core', 'Cyber Security', 'Data Science', 'AI & ML', 'IoT',
        'Cloud Computing', 'Software Engineering', 'Block Chain Technology',
        'Networking', 'VLSI', 'CSW', 'ST'
      ]
    }
  ];
  years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  isLoading = false;
  errorMessage = '';
  isAlreadyRegistered = false;

  showDomainDropdown(): boolean {
    return this.branch === 'Computer Science (CSE)';
  }

  getDomainsForBranch(): string[] {
    const b = this.branchList.find(x => x.name === this.branch);
    return b ? b.domains : [];
  }

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.isAlreadyRegistered = false;

    const userData: any = {
      email: this.email,
      password: this.password,
      role: this.role,
      name: this.name,
      department: this.role === 'student' ? 'B.Tech' : null,
      branch: this.role === 'student' ? this.branch : null,
      domain: this.role === 'student' ? this.domain : null,
      academicYear: this.role === 'student' ? this.academicYear : null
    };

    this.apiService.register(userData).subscribe({
      next: (user) => {
        this.authService.login(user);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try a different email.';
        this.isAlreadyRegistered = (err.status === 400 && err.error?.message?.includes('already registered'));
        this.isLoading = false;
      }
    });
  }
}
