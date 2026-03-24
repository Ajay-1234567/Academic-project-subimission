import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <app-sidebar [role]="user?.role || 'student'"></app-sidebar>
    <div class="main-layout fade-in">
      <h2>My Profile</h2>
      <div class="glass-panel profile-card">
        <div class="header-bg"></div>
        <div class="avatar-lg">{{ user?.name?.charAt(0)?.toUpperCase() }}</div>
        
        <div class="info-grid" *ngIf="!isEditing">
          <div class="field">
            <label>Full Name</label>
            <div class="value">{{ user?.name || 'Unknown' }}</div>
          </div>
          <div class="field">
            <label>Role</label>
            <div class="value badge">{{ user?.role | titlecase }}</div>
          </div>
          <div class="field">
            <label>Email / Login</label>
            <div class="value">{{ user?.email }}</div>
          </div>
          <div class="field" *ngIf="user?.department">
             <label>Department</label>
             <div class="value">{{ user?.department }}</div>
          </div>

        </div>

        <div class="edit-form" *ngIf="isEditing">
            <div class="form-group">
                <label>Full Name</label>
                <input [(ngModel)]="editData.name" class="glass-input">
            </div>
            <div class="form-group">
                <label>New Password (optional)</label>
                <input [(ngModel)]="editData.password" type="password" class="glass-input" placeholder="Leave blank to keep current">
            </div>
        </div>
        
        <div class="actions">
          <button *ngIf="!isEditing" (click)="startEdit()" class="btn-primary">Edit Profile</button>
          <button *ngIf="isEditing" (click)="saveProfile()" class="btn-primary">Save Changes</button>
          <button *ngIf="isEditing" (click)="cancelEdit()" class="btn-outline">Cancel</button>    
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; max-width: 1000px; }
    h2 { margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .profile-card { overflow: visible; position: relative; padding-bottom: 2rem; }
    .header-bg { height: 120px; background: linear-gradient(to right, var(--primary), var(--secondary)); opacity: 0.8; border-radius: 16px 16px 0 0; }
    .avatar-lg {
      width: 100px; height: 100px;
      background: #1e293b;
      border: 4px solid white;
      border-radius: 50%;
      position: absolute;
      top: 60px; left: 2rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem; font-weight: bold; color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .info-grid, .edit-form {
      margin-top: 70px; padding: 0 2rem;
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;
    }
    .field label { display: block; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem; }
    .value { font-size: 1.1rem; font-weight: 500; word-break: break-word; }
    .badge {
      display: inline-block; padding: 0.3rem 1rem;
      background: rgba(99,102,241,0.15); color: #4f46e5;
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 99px; font-size: 0.9rem; font-weight: 700;
    }

    .actions { padding: 2rem 2rem 0; display: flex; gap: 1rem; flex-wrap: wrap; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-primary); padding: 10px 20px; border-radius: 6px; cursor: pointer; }
    .btn-outline:hover { background: rgba(255,255,255,0.05); }

    .glass-input { width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; color: var(--text-primary, #1e293b); font-size: 1rem; }
    .glass-input::placeholder { color: rgba(0,0,0,0.35); }
    .glass-input:focus { outline: none; border-color: var(--primary, #6366f1); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .btn-primary { padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; }

    @media (max-width: 1024px) {
      .main-layout { margin-left: 0 !important; padding: 5rem 1rem 2rem !important; max-width: 100% !important; }
    }

    @media (max-width: 768px) {
      h2 { font-size: 1.3rem; }
      .info-grid, .edit-form {
        grid-template-columns: 1fr !important;  /* Stack to single column */
        margin-top: 60px;
        padding: 0 1.25rem;
        gap: 1rem;
      }
      .actions {
        padding: 1.5rem 1.25rem 0;
        flex-direction: column;
      }
      .actions button { width: 100%; }
      .value { font-size: 1rem; }
      .badge { display: inline-flex; white-space: nowrap; } /* Never clips */
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: any;
  facultyName = '';
  isEditing = false;
  editData = { name: '', password: '' };

  private apiService = inject(ApiService);
  private authService = inject(AuthService); // Renamed for consistency

  constructor() {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.refreshProfile();
  }

  refreshProfile() {
    if (!this.user?.id) return;

    // Fetch fresh profile data
    this.apiService.getUserById(this.user.id).subscribe({
      next: (data) => {
        this.user = data;
        this.authService.updateUser(data); // Sync local storage

        // Faculty name fetching removed as per request
      },
      error: () => { }
    });
  }

  startEdit() {
    this.editData = { name: this.user.name, password: '' };
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfile() {
    if (!this.editData.name) return;

    this.apiService.updateProfile(this.user.id, this.editData).subscribe({
      next: (updatedUser) => {
        // updatedUser might strictly be the result of UPDATE, which depends on backend.
        // Backend returns: SELECT id, username, name, role FROM users ...
        // We should merge it or refresh.
        this.refreshProfile();
        this.isEditing = false;
        alert('Profile updated successfully');
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        alert('Failed to update profile');
      }
    });
  }
}
