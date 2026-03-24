import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ActivatedRoute } from '@angular/router';

const BRANCH_DATA = [
  {
    name: 'Computer Science (CSE)',
    domains: [
      'Core', 'Cyber Security', 'Data Science', 'AI & ML', 'IoT',
      'Cloud Computing', 'Software Engineering', 'Block Chain Technology',
      'Networking', 'VLSI', 'CSW', 'ST'
    ]
  }
];

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <app-sidebar role="admin"></app-sidebar>
    <div class="main-layout fade-in">
      <header class="header">
        <h1>Manage {{ role | titlecase }}s</h1>
        <p class="subtitle">Add {{ role }}s with their email — they will login with that email</p>
      </header>

      <!-- Success Credential Box -->
      <div class="success-box" *ngIf="successInfo">
        <div class="success-header">&#10004; {{ role | titlecase }} added successfully!</div>
        <div class="cred-row"><span class="cred-label">Name:</span><span class="cred-value">{{ successInfo.name }}</span></div>
        <div class="cred-row"><span class="cred-label">Login Email:</span><span class="cred-value highlight">{{ successInfo.email }}</span></div>
        <div class="cred-row"><span class="cred-label">Password:</span><span class="cred-value highlight">{{ successInfo.password }}</span></div>
        <div class="cred-row"><span class="cred-label">Role:</span><span class="cred-value">{{ role | titlecase }}</span></div>
        <p class="cred-note">Share these credentials with the {{ role }}. They need to login at <strong>/login</strong></p>
        <button class="btn-dismiss" (click)="successInfo = null">X Dismiss</button>
      </div>

      <div class="content-grid">
        <!-- Add User Form -->
        <div class="glass-panel p-6 form-card">
          <h3>{{ isEditing ? 'Edit' : 'Add New' }} {{ role | titlecase }}</h3>
          <form (ngSubmit)="addUser()">
            <div class="form-group">
              <label>Full Name</label>
              <input [(ngModel)]="newUser.name" name="name" class="glass-input" placeholder="e.g. John Doe" required>
            </div>
            <div class="form-group">
              <label>Email Address <span class="hint">(used for login)</span></label>
              <input [(ngModel)]="newUser.email" name="email" type="email" class="glass-input" placeholder="user&#64;university.edu" required>
            </div>
            <div class="form-group">
              <label>{{ isEditing ? 'New Password' : 'Password' }} <span class="hint">{{ isEditing ? '(leave blank to keep current)' : '(initial login password)' }}</span></label>
              <input [(ngModel)]="newUser.password" name="password" type="text" class="glass-input" [placeholder]="isEditing ? 'Enter new password if changing' : 'Set initial password'" [required]="!isEditing">
            </div>
            <div class="form-group" *ngIf="role === 'student'">
              <label>Branch</label>
              <select [(ngModel)]="newUser.branch" name="branch" class="glass-input">
                <option value="">Select Branch</option>
                <option *ngFor="let b of branchList" [value]="b.name">{{ b.name }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="role === 'student' && showDomainSelector()">
              <label>Domain / Specialization</label>
              <select [(ngModel)]="newUser.domain" name="domain" class="glass-input">
                <option value="">Select Domain</option>
                <option *ngFor="let d of getDomainsForBranch()" [value]="d">{{ d }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="role === 'student'">
              <label>Section</label>
              <input [(ngModel)]="newUser.section" name="section" class="glass-input" placeholder="e.g. Section A">
            </div>
            <button type="submit" class="btn-primary w-full mt-4" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Processing...' : (isEditing ? 'Update ' : 'Add ') + (role | titlecase) }}
            </button>
            <button *ngIf="isEditing" type="button" class="btn-secondary w-full mt-2" (click)="cancelEdit()">Cancel Edit</button>
            <p *ngIf="errorMessage" class="error-msg mt-2">{{ errorMessage }}</p>
          </form>
        </div>

        <!-- User List -->
        <div class="glass-panel p-6 list-card">
          <h3>{{ role | titlecase }} List ({{ users.length }})</h3>
          <div *ngIf="isLoading" class="loading">Loading...</div>

          <div class="table-container" *ngIf="!isLoading">
            <table class="w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Login Email</th>
                  <th *ngIf="role === 'student'">Branch / Section</th>
                  <th *ngIf="role === 'student'">Assigned Faculty</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>
                    <div class="user-name-cell">
                      <div class="avatar-sm">{{ user.name?.charAt(0)?.toUpperCase() }}</div>
                      {{ user.name }}
                    </div>
                  </td>
                  <td class="email-cell">{{ user.email || user.username }}</td>
                  <td *ngIf="role === 'student'">
                    <div class="branch-section-box">
                      <span class="badge b-blue" *ngIf="user.branch">{{ user.branch }}</span>
                      <span class="badge b-purple" *ngIf="user.section">{{ user.section }}</span>
                      <span class="badge b-cyan" *ngIf="user.domain">{{ user.domain }}</span>
                    </div>
                  </td>
                  <td *ngIf="role === 'student'">
                    <div class="assigned-faculty">
                      <span class="faculty-tag" *ngIf="user.addedByFaculty">{{ user.addedByFaculty }}</span>
                      <span class="no-faculty" *ngIf="!user.addedByFaculty">Not Assigned</span>
                    </div>
                  </td>
                  <td class="password-cell">{{ user.password }}</td>

                  <td>
                    <div class="action-buttons">
                      <button class="btn-icon btn-edit" (click)="editUser(user)" title="Edit">✏️</button>
                      <button class="btn-icon btn-delete" (click)="deleteUser(user.id)" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="users.length === 0">
                  <td colspan="4" class="text-center">No {{ role }}s found. Add one using the form.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; }
    @media (max-width: 1024px) { .main-layout { margin-left: 0; padding: 5rem 1.25rem 2rem; } }

    .header { margin-bottom: 2rem; }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(to right, #ec4899, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }

    /* Success Box */
    .success-box {
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      position: relative;
    }
    .success-header { font-size: 1.1rem; font-weight: 700; color: #059669; margin-bottom: 1rem; }
    .cred-row { display: flex; gap: 0.8rem; padding: 0.35rem 0; }
    .cred-label { color: var(--text-secondary); min-width: 110px; font-size: 0.9rem; }
    .cred-value { color: var(--text-primary); font-weight: 500; font-size: 0.9rem; }
    .cred-value.highlight { color: #d97706; font-family: monospace; font-size: 0.95rem; }
    .cred-note {
      color: var(--text-secondary); font-size: 0.82rem;
      margin-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.8rem;
    }
    .cred-note strong { color: #818cf8; }
    .btn-dismiss {
      position: absolute; top: 1rem; right: 1rem;
      background: transparent; border: none; color: var(--text-secondary);
      cursor: pointer; font-size: 0.9rem;
    }
    .btn-dismiss:hover { color: #ef4444; }

    .content-grid { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 900px) { .content-grid { display: flex; flex-direction: column; } }
    
    /* Ensure inputs never overflow their container */
    .form-card input, .form-card select { min-width: 0; box-sizing: border-box; }

    .p-6 { padding: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; }
    .hint { color: rgba(255,255,255,0.3); font-size: 0.8rem; }
    .w-full { width: 100%; }
    .mt-4 { margin-top: 1rem; }
    .mt-2 { margin-top: 0.5rem; }

    .table-container { overflow-x: auto; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; min-width: 650px; }
    th {
      text-align: left; padding: 0.85rem 1rem; color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
      font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;
      white-space: nowrap;
    }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }

    .user-name-cell { display: flex; align-items: center; gap: 0.7rem; white-space: nowrap; min-width: 130px; }
    .avatar-sm {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #818cf8, #ec4899);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; color: white; flex-shrink: 0;
    }
    .email-cell { color: #d97706; font-family: monospace; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 15vw; }
    .password-cell { font-family: monospace; color: var(--text-secondary); font-size: 0.82rem; white-space: nowrap; }
    
    /* Sticky Actions ONLY on Desktop to prevent overlapping names on mobile */
    @media (min-width: 1025px) {
      th:last-child, td:last-child { 
        position: sticky; right: 0; background: var(--surface); z-index: 5; 
        box-shadow: -4px 0 8px rgba(0,0,0,0.05); 
      }
    }
    .action-buttons { display: flex; gap: 0.5rem; padding-left: 0.5rem; }
    .btn-icon {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      width: 32px; height: 32px; border-radius: 6px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; font-size: 1rem;
    }
    .btn-icon:hover { transform: scale(1.1); }
    .btn-edit { color: #fcd34d; }
    .btn-edit:hover { background: rgba(253, 224, 71, 0.1); border-color: rgba(253, 224, 71, 0.3); }
    .btn-delete { color: #f87171; }
    .btn-delete:hover { background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.3); }

    .btn-secondary {
      background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
      cursor: pointer; padding: 0.75rem; border-radius: 8px; transition: all 0.2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.05); color: white; }
    .btn-sm { font-size: 0.8rem; }

    .error-msg { color: #ef4444; font-size: 0.9rem; }
    .text-center { text-align: center; color: var(--text-secondary); padding: 2rem; }
    .loading { text-align: center; padding: 2rem; color: var(--text-secondary); }

    .branch-section-box { display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; max-width: 180px; }
    .badge { font-size: 0.65rem; padding: 1px 5px; border-radius: 4px; font-weight: 600; text-transform: uppercase; white-space: nowrap; }
    .b-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
    .b-purple { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); }
    .b-cyan { background: rgba(6, 182, 212, 0.1); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.2); }
    
    .assigned-faculty { display: flex; flex-wrap: wrap; gap: 4px; }
    .faculty-tag { background: #f0f9ff; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid #bae6fd; }
    .no-faculty { color: var(--text-secondary); font-style: italic; font-size: 0.8rem; }
  `]

})
export class UserManagementComponent implements OnInit {
  role: string = 'student';
  users: any[] = [];
  branchList = BRANCH_DATA;
  newUser = { name: '', email: '', password: '', branch: '', section: '', domain: '' };
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successInfo: { name: string; email: string; password: string } | null = null;
  isEditing = false;
  editingUserId: number | null = null;

  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.role = data['role'] || 'student';
      this.loadUsers();
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.apiService.getUsers(this.role).subscribe({
      next: (data) => { this.users = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  addUser() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successInfo = null;

    if (this.isEditing && this.editingUserId) {
      // Update User
      this.apiService.updateProfile(this.editingUserId, this.newUser).subscribe({
        next: (updatedUser) => {
          // Update in local list
          const index = this.users.findIndex(u => u.id === this.editingUserId);
          if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser };
            // Ensure email is preserved if backend didn't return it (it returns id, username, name, role)
            // But we display email. 
            // Wait, updateProfile backend only updates name/password.
          }
          this.cancelEdit();
          this.isSubmitting = false;
        },
        error: (err) => {
          this.isSubmitting = false;
          if (err.status === 0) {
            this.errorMessage = 'Cannot connect to server. Ensure backend is running.';
          } else {
            const body = err.error;
            const rawErr = (typeof body === 'string') ? body : (body?.message || body?.error || JSON.stringify(body));
            this.errorMessage = (typeof rawErr === 'string') ? rawErr : JSON.stringify(rawErr);
          }
        }
      });
      return;
    }

    // Create User logic
    const savedPassword = this.newUser.password;
    const savedEmail = this.newUser.email;
    const savedName = this.newUser.name;

    const userData = { ...this.newUser, role: this.role };

    this.apiService.register(userData).subscribe({
      next: (user) => {
        this.users.unshift(user);
        this.successInfo = { name: savedName, email: savedEmail, password: savedPassword };
        this.newUser = { name: '', email: '', password: '', branch: '', section: '', domain: '' };
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Ensure backend is running.';
        } else {
          const body = err.error;
          const rawErr = (typeof body === 'string') ? body : (body?.message || body?.error || JSON.stringify(body));
          this.errorMessage = (typeof rawErr === 'string') ? rawErr : JSON.stringify(rawErr);
        }
      }
    });
  }

  editUser(user: any) {
    this.isEditing = true;
    this.editingUserId = user.id;
    // Populate form (password empty by default unless user wants to change it)
    this.newUser = {
      name: user.name,
      email: user.email || user.username || '',
      password: '',
      branch: user.branch || '',
      section: user.section || '',
      domain: user.domain || ''
    };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingUserId = null;
    this.newUser = { name: '', email: '', password: '', branch: '', section: '', domain: '' };
    this.errorMessage = '';
  }

  deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.apiService.deleteUser(id).subscribe({
      next: () => { this.users = this.users.filter(u => u.id !== id); },
      error: (err) => { 
        const body = err.error;
        const rawErr = (typeof body === 'string') ? body : (body?.message || body?.error || 'Failed to delete user');
        this.errorMessage = String(rawErr);
      }
    });
  }

  showDomainSelector(): boolean {
    return this.newUser.branch === 'Computer Science (CSE)';
  }

  getDomainsForBranch(): string[] {
    const b = this.branchList.find((x: any) => x.name === this.newUser.branch);
    return b ? b.domains : [];
  }
}
