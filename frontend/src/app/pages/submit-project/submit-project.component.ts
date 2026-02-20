import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-submit-project',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <app-sidebar role="student"></app-sidebar>
    <div class="main-layout fade-in">
      <header class="header">
        <h1>{{ isEditMode ? 'Edit Project' : 'Submit New Project' }}</h1>
        <p>{{ isEditMode ? 'Update your project details below' : 'Upload your academic project details for evaluation' }}</p>
      </header>

      <div class="center-container">
        <div class="glass-panel form-card">
          <form (ngSubmit)="submitProject()">
            <div class="form-group">
              <label>Project Title</label>
              <input [(ngModel)]="project.title" name="title" class="glass-input"
                     placeholder="e.g. AI-Based Traffic Management" required>
            </div>

            <div class="form-group" *ngIf="project.subject">
              <label>Subject</label>
              <input [(ngModel)]="project.subject" name="subject" class="glass-input" readonly style="background: #f1f5f9;">
            </div>

            <div class="form-group">
              <label>Semester</label>
              <select [(ngModel)]="project.semester" name="semester" class="glass-input" required>
                <option value="">Select Semester</option>
                <option *ngFor="let sem of semesters" [value]="sem">{{ sem }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Abstract / Description</label>
              <textarea [(ngModel)]="project.abstract" name="abstract" class="glass-input"
                        rows="6" placeholder="Describe the project's objective, methodology, and expected outcome..." required></textarea>
            </div>

            <div class="form-group">
              <label>Repository URL (GitHub/GitLab)</label>
              <input [(ngModel)]="project.repoUrl" name="repoUrl" type="url" class="glass-input"
                     placeholder="https://github.com/username/repo" required pattern="https?://.+" title="Must start with http:// or https://">
              <small class="hint">Must be a valid URL starting with http:// or https://</small>
            </div>

            <div class="actions">
              <button type="button" *ngIf="isEditMode" (click)="cancel()" class="btn-outline">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Project' : 'Submit Project') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; min-height: 100vh; background: #f8fafc; }
    @media (max-width: 768px) { .main-layout { margin-left: 0; padding-top: 80px; } }

    .header { margin-bottom: 2rem; text-align: left; max-width: 800px; margin: 0 auto 2rem; }
    h1 { font-size: 2rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; margin-bottom: 0.5rem; }
    p { color: var(--text-secondary); font-size: 1rem; }

    .center-container { display: flex; justify-content: center; }
    
    .form-card { 
      width: 100%; max-width: 800px; padding: 3rem; 
      background: white; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
    }

    .form-group { margin-bottom: 2rem; }
    label { display: block; margin-bottom: 0.6rem; color: #334155; font-weight: 600; font-size: 0.9rem; }
    
    .glass-input { 
      width: 100%; padding: 0.85rem 1rem; 
      background: #fff;
      border: 1px solid #cbd5e1; 
      border-radius: 8px;
      color: #1e293b; font-size: 1rem; 
      transition: all 0.2s; box-sizing: border-box; 
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .glass-input:focus { 
      outline: none; 
      border-color: var(--primary); 
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); 
    }
    .glass-input::placeholder { color: #94a3b8; }

    .actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; }
    
    .btn-primary { 
      padding: 0.75rem 2rem; 
      background: var(--primary);
      color: white; border: none; border-radius: 8px; font-weight: 500;
      cursor: pointer; transition: all 0.2s; 
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .btn-primary:hover { background: var(--primary-hover); }
    
    .btn-outline { 
      padding: 0.75rem 1.5rem; 
      background: white; 
      border: 1px solid #cbd5e1;
      color: #475569; border-radius: 8px; cursor: pointer; font-weight: 500;
    }
    .btn-outline:hover { background: #f8fafc; color: #1e293b; border-color: #94a3b8; }
    
    .hint { color: #64748b; font-size: 0.85rem; margin-top: 0.5rem; display: block; }
  `]
})
export class SubmitProjectComponent implements OnInit {
  project = { title: '', abstract: '', repoUrl: '', semester: '', subject: '' };
  semesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
  isSubmitting = false;
  isEditMode = false;
  projectId: number | null = null;

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;
        this.projectId = +params['edit'];
        this.loadProject(this.projectId);
      }
      if (params['subject']) this.project.subject = params['subject'];
      if (params['semester']) this.project.semester = params['semester'];
    });
  }

  loadProject(id: number) {
    this.apiService.getProjectById(id).subscribe({
      next: (p: any) => {
        this.project = { title: p.title, abstract: p.abstract, repoUrl: p.repoUrl, semester: p.semester || '', subject: p.subject || '' };
      },
      error: () => this.router.navigate(['/student'])
    });
  }

  cancel() {
    this.router.navigate(['/student']);
  }

  submitProject() {
    const user = this.authService.currentUser();
    if (!user) return;

    // Validate URL
    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    if (!urlRegex.test(this.project.repoUrl)) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.projectId) {
      this.apiService.updateProject(this.projectId, this.project).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/student']);
        },
        error: (err: any) => {
          alert('Update failed: ' + (err?.error?.message || 'Unknown error'));
          this.isSubmitting = false;
        }
      });
    } else {
      const submissionData = { ...this.project, studentId: user.id };
      this.apiService.submitProject(submissionData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/student']);
        },
        error: (err: any) => {
          alert('Submission failed: ' + (err?.error?.message || 'Unknown error'));
          this.isSubmitting = false;
        }
      });
    }
  }
}
