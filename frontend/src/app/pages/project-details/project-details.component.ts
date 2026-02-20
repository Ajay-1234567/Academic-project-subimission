import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  template: `
    <app-sidebar [role]="userRole"></app-sidebar>
    <div class="main-layout fade-in">
      <div *ngIf="isLoading" class="loading">Loading project details...</div>
      
      <div *ngIf="!isLoading && project" class="content">
        <a [routerLink]="userRole === 'faculty' ? '/faculty' : '/student'" class="back-link">← Back to Dashboard</a>
        
        <header class="header">
          <h1>{{ project.title }}</h1>
          <span class="status-badge" [class.graded]="project.score">{{ project.status }}</span>
        </header>

        <div class="glass-panel p-6">
          <div class="meta-info">
            <p><strong>Student:</strong> 
              {{ project.studentName || 'Unknown' }} 
              <span class="email-badge" *ngIf="project.studentEmail">[{{ project.studentEmail }}]</span>
            </p>
            <p><strong>Submitted:</strong> {{ project.submittedAt | date:'medium' }}</p>
            <p *ngIf="project.repoUrl">
              <strong>Repository:</strong> 
              <a [href]="project.repoUrl" target="_blank">{{ project.repoUrl }}</a>
            </p>
          </div>

          <div class="abstract-section">
            <h3>Abstract</h3>
            <p>{{ project.abstract }}</p>
          </div>

          <!-- Grade Display -->
          <div class="grade-section" *ngIf="project.score !== null">
            <h3>Evaluation Result</h3>
            <div class="grade-card">
              <div class="score-circle">{{ project.score }}</div>
              <div class="feedback">
                <h4>Faculty Feedback</h4>
                <p>"{{ project.evaluations?.[0]?.comments || 'No comments provided.' }}"</p>
                <small *ngIf="project.evaluations?.[0]?.facultyName">
                  - Evaluated by {{ project.evaluations[0].facultyName }}
                </small>
              </div>
            </div>
          </div>

          <!-- Grading Form for Faculty -->
          <div *ngIf="!project.score && userRole === 'faculty'" class="grade-form-section">
            <h3>Grade this Project</h3>
            <div class="form-group">
                <label>Score (0-100)</label>
                <input type="number" [(ngModel)]="tempScore" class="glass-input" min="0" max="100">
            </div>
            <div class="form-group">
                <label>Feedback</label>
                <textarea [(ngModel)]="tempFeedback" class="glass-input" rows="4" placeholder="Enter detailed feedback..."></textarea>
            </div>
            <button (click)="submitGrade()" class="btn-primary" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Submitting...' : 'Submit Evaluation' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !project" class="error-state">
        <h2>Project not found</h2>
        <a routerLink="/">Go Home</a>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; }
    @media (max-width: 768px) { .main-layout { margin-left: 0; padding-top: 80px; } }

    .header { margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; }
    h1 { font-size: 2.5rem; background: linear-gradient(to right, #6EE7B7, #3B82F6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
    
    .back-link { display: inline-block; margin-bottom: 1rem; color: var(--text-secondary); text-decoration: none; }
    .back-link:hover { color: var(--primary); }

    .p-6 { padding: 2rem; }
    .meta-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
    .meta-info p { color: var(--text-secondary); }
    .meta-info strong { color: var(--text-primary); }
    .meta-info a { color: var(--primary); }
    .email-badge { color: #fbbf24; font-family: monospace; font-size: 0.85rem; margin-left: 0.5rem; }

    .abstract-section h3 { margin-bottom: 1rem; color: var(--text-primary); }
    .abstract-section p { line-height: 1.6; color: var(--text-secondary); }

    .grade-section { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border); }
    .grade-card { display: flex; align-items: center; gap: 2rem; background: rgba(16, 185, 129, 0.1); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2); }
    
    .score-circle { width: 80px; height: 80px; border-radius: 50%; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
    
    .feedback h4 { margin: 0 0 0.5rem 0; color: #10B981; }
    .feedback p { font-style: italic; margin-bottom: 0.5rem; }
    .feedback small { color: var(--text-secondary); }

    .status-badge { padding: 0.5rem 1rem; border-radius: 99px; background: rgba(255,255,255,0.1); font-size: 0.9rem; }
    .status-badge.graded { background: rgba(16, 185, 129, 0.2); color: #10B981; }

    .grade-form-section { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border); }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); }
    .glass-input { width: 100%; padding: 0.8rem 1rem; background: #ffffff; border: 2px solid #cbd5e1; border-radius: 8px; color: #1e293b; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s; }
    .glass-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .glass-input::placeholder { color: #94a3b8; }
    
    .btn-primary { display: inline-block; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover { box-shadow: 0 0 15px rgba(99, 102, 241, 0.3); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .loading, .error-state { text-align: center; padding: 4rem; color: var(--text-secondary); }

    /* Hide spin buttons */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `]
})
export class ProjectDetailsComponent implements OnInit {
  project: any = null;
  isLoading = true;
  userRole = 'student';

  // Grading form
  tempScore: number | null = null;
  tempFeedback: string = '';
  isSubmitting = false;

  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.userRole = this.authService.currentUser()?.role || 'student';

    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(parseInt(projectId));
    }
  }

  loadProject(id: number) {
    this.apiService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load project', err);
        this.isLoading = false;
      }
    });
  }

  submitGrade() {
    if (this.tempScore === null) return;

    this.isSubmitting = true;
    const currentUser = this.authService.currentUser();

    const evaluationData = {
      projectId: this.project.id,
      score: this.tempScore,
      comments: this.tempFeedback,
      facultyId: currentUser?.id
    };

    this.apiService.submitEvaluation(evaluationData).subscribe({
      next: (updatedProject) => {
        this.project = {
          ...this.project,
          score: this.tempScore,
          status: 'Graded',
          evaluations: [{
            comments: this.tempFeedback,
            facultyName: currentUser?.name
          }]
        };
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Failed to submit evaluation', err);
        alert('Error submitting evaluation');
        this.isSubmitting = false;
      }
    });
  }
}
