import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-admin-projects',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
    template: `
    <app-sidebar role="admin"></app-sidebar>
    <div class="main-layout fade-in">
      <header class="page-header">
        <div>
          <h1>Real-World Projects</h1>
          <p>Assign problem statements to faculties for student projects</p>
        </div>
        <a routerLink="/admin" class="back-btn">← Back to Dashboard</a>
      </header>

      <div class="split-layout">
        <!-- Add New Statement -->
        <div class="card form-card">
          <h3>Create New Project Statement</h3>
          <div class="form-group">
            <label>Project Title</label>
            <input [(ngModel)]="newStatement.title" placeholder="e.g. AI-driven Traffic Management System" class="glass-input">
          </div>
          <div class="form-group">
            <label>Description (Problem Statement / Requirements)</label>
            <textarea [(ngModel)]="newStatement.description" placeholder="Detail the real-world problem and expected outcome..." class="glass-textarea" rows="4"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Branch</label>
              <select [(ngModel)]="newStatement.branch" class="glass-input">
                <option value="">Select Branch</option>
                <option value="Computer Science (CSE)">CSE</option>
                <option value="Electronics (ECE)">ECE</option>
                <option value="Mechanical (ME)">ME</option>
                <option value="Civil (CE)">CE</option>
              </select>
            </div>
            <div class="form-group">
              <label>Domain</label>
              <input [(ngModel)]="newStatement.domain" placeholder="e.g. AI/ML, IOT" class="glass-input">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Difficulty</label>
              <select [(ngModel)]="newStatement.difficulty" class="glass-input">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate" selected>Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div class="form-group">
              <label>Assign to Faculty (Optional)</label>
              <select [(ngModel)]="newStatement.assignedToFacultyId" class="glass-input">
                <option [ngValue]="null">General Pool (All Faculty)</option>
                <option *ngFor="let f of facultyList" [value]="f.id">{{ f.name }}</option>
              </select>
            </div>
          </div>
          <button (click)="submitStatement()" class="btn-primary" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create & Assign' }}
          </button>
        </div>

        <!-- Statements List -->
        <div class="list-section">
          <h3>Current Project Statements</h3>
          <div *ngIf="isLoading" class="loading">Loading statements...</div>
          <div class="statements-grid">
            <div *ngFor="let s of statements" class="statement-card">
              <div class="sc-header">
                <span class="diff-chip" [attr.data-diff]="s.difficulty">{{ s.difficulty }}</span>
                <button (click)="deleteStatement(s.id)" class="del-btn">🗑️</button>
              </div>
              <h4>{{ s.title }}</h4>
              <p>{{ s.description | slice:0:150 }}{{ s.description.length > 150 ? '...' : '' }}</p>
              <div class="sc-footer">
                <div class="sc-meta">
                  <span>📍 {{ s.branch }}</span>
                  <span>📂 {{ s.domain }}</span>
                </div>
                <div class="sc-assignee">
                  Assignee: <strong>{{ s.assignedFacultyName || 'General Pool' }}</strong>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="!isLoading && statements.length === 0" class="empty-state">
            <p>No project statements created yet.</p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .main-layout { margin-left: 250px; padding: 2.5rem; background: #f8fafc; min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    h1 { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0; }
    p { color: #64748b; margin: 0.2rem 0 0; }
    .back-btn { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 1rem; color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 600; }

    .split-layout { display: grid; grid-template-columns: 380px 1fr; gap: 2rem; }
    @media (max-width: 1100px) { .split-layout { grid-template-columns: 1fr; } }

    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .form-card h3 { margin: 0 0 1.5rem; font-size: 1.1rem; color: #1e293b; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #475569; }
    .glass-input, .glass-textarea { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; }
    .glass-textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .btn-primary { 
      width: 100%; background: #4f46e5; color: white; border: none; padding: 0.75rem; 
      border-radius: 6px; font-weight: 700; cursor: pointer; transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .list-section h3 { margin: 0 0 1.5rem; font-size: 1.1rem; color: #1e293b; }
    .statements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .statement-card { 
      background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; 
      display: flex; flex-direction: column; transition: transform 0.2s;
    }
    .statement-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    .sc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .diff-chip { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px; text-transform: uppercase; }
    .diff-chip[data-diff="Beginner"] { background: #ecfdf5; color: #059669; }
    .diff-chip[data-diff="Intermediate"] { background: #eff6ff; color: #1d4ed8; }
    .diff-chip[data-diff="Advanced"] { background: #fef2f2; color: #dc2626; }
    .del-btn { background: transparent; border: none; cursor: pointer; opacity: 0.3; transition: opacity 0.2s; font-size: 1.1rem; }
    .del-btn:hover { opacity: 1; color: #dc2626; }
    .statement-card h4 { margin: 0 0 0.75rem; font-size: 1.05rem; font-weight: 700; color: #1e293b; line-height: 1.3; }
    .statement-card p { font-size: 0.88rem; color: #475569; line-height: 1.5; flex: 1; margin-bottom: 1.25rem; }
    .sc-footer { border-top: 1px solid #f1f5f9; padding-top: 1rem; }
    .sc-meta { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; }
    .sc-meta span { font-size: 0.75rem; color: #64748b; font-weight: 500; }
    .sc-assignee { font-size: 0.78rem; color: #94a3b8; }
    .sc-assignee strong { color: #6366f1; }

    .loading, .empty-state { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }
  `]
})
export class AdminProjectsComponent implements OnInit {
    statements: any[] = [];
    facultyList: any[] = [];
    isLoading = false;
    isSubmitting = false;

    newStatement: any = {
        title: '',
        description: '',
        branch: '',
        domain: '',
        difficulty: 'Intermediate',
        assignedToFacultyId: null
    };

    private apiService = inject(ApiService);
    private authService = inject(AuthService);

    ngOnInit() {
        this.loadStatements();
        this.loadFaculty();
    }

    loadStatements() {
        this.isLoading = true;
        this.apiService.getProblemStatements().subscribe({
            next: (data) => { this.statements = data; this.isLoading = false; },
            error: () => this.isLoading = false
        });
    }

    loadFaculty() {
        this.apiService.getUsers('faculty').subscribe({
            next: (data) => this.facultyList = data,
            error: () => { }
        });
    }

    submitStatement() {
        if (!this.newStatement.title || !this.newStatement.description) {
            alert('Title and Description are required.');
            return;
        }
        this.isSubmitting = true;
        const admin = this.authService.currentUser();
        const payload = { ...this.newStatement, createdBy: admin?.id };

        this.apiService.createProblemStatement(payload).subscribe({
            next: () => {
                this.loadStatements();
                this.resetForm();
                this.isSubmitting = false;
            },
            error: () => {
                alert('Failed to create project statement.');
                this.isSubmitting = false;
            }
        });
    }

    deleteStatement(id: number) {
        if (!confirm('Delete this project statement?')) return;
        this.apiService.deleteProblemStatement(id).subscribe({
            next: () => this.loadStatements(),
            error: () => alert('Failed to delete.')
        });
    }

    resetForm() {
        this.newStatement = {
            title: '',
            description: '',
            branch: '',
            domain: '',
            difficulty: 'Intermediate',
            assignedToFacultyId: null
        };
    }
}
