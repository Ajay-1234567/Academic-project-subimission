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
        <!-- Back link adapts per role -->
        <a [routerLink]="backLink" class="back-link">← Back</a>

        <header class="header">
          <div class="header-left">
            <h1>{{ project.title }}</h1>
            <div class="header-meta">
              <span class="status-badge" [class.graded]="project.score">{{ project.status }}</span>
              <span class="type-badge" *ngIf="project.projectType">{{ project.projectType === 'group' ? '👥 Group' : '👤 Solo' }}</span>
              <span class="sem-badge" *ngIf="project.semester">{{ project.semester }}</span>
              <span class="subj-badge" *ngIf="project.subject">{{ project.subject }}</span>
            </div>
          </div>
          <!-- Admin/Faculty controls -->
          <!-- Faculty only: Update Grade button -->
          <div class="header-actions" *ngIf="userRole === 'faculty'">
            <button (click)="isEditingGrade = !isEditingGrade" class="btn-edit-grade"
                    *ngIf="project.score && !isEditingGrade">
              ✏️ Update Grade
            </button>
            <button (click)="isEditingGrade = false" class="btn-cancel"
                    *ngIf="isEditingGrade">
              ✕ Cancel
            </button>
          </div>
          <!-- Admin: read-only badge -->
          <div class="admin-view-badge" *ngIf="userRole === 'admin'">
            <span>👁️ View Only</span>
          </div>
        </header>

        <div class="glass-panel p-6">
          <!-- Project Details -->
          <div class="meta-info">
            <div class="meta-item">
              <span class="meta-label">Student</span>
              <span class="meta-val">{{ project.studentName || 'Unknown' }}</span>
              <span class="email-badge" *ngIf="project.studentEmail">{{ project.studentEmail }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Roll Number</span>
              <span class="meta-val">{{ project.studentRollNumber || '—' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Submitted</span>
              <span class="meta-val">{{ project.submittedAt | date:'medium' }}</span>
            </div>
            <div class="meta-item" *ngIf="project.repoUrl">
              <span class="meta-label">Repository</span>
              <a [href]="project.repoUrl" target="_blank" class="repo-link">🔗 Open Repository ↗</a>
            </div>
          </div>

          <!-- Group Members (if applicable) -->
          <div class="group-members-section" *ngIf="project.groupId && project.groupMembers?.length > 0">
            <h3 class="section-label">Team Members (Group {{ project.groupNumber }})</h3>
            <div class="members-grid">
              <div *ngFor="let m of project.groupMembers" class="member-item-pill"
                   [class.submitter-pill]="m.id === project.studentId">
                <span class="m-avatar">{{ m.name.charAt(0).toUpperCase() }}</span>
                <span class="m-name">{{ m.name }} <small *ngIf="m.id === project.studentId">(Submitter)</small></span>
                <span class="m-roll" *ngIf="m.rollNumber">{{ m.rollNumber }}</span>
              </div>
            </div>
          </div>

          <!-- Abstract -->
          <div class="abstract-section">
            <h3>Project Abstract</h3>
            <p>{{ project.abstract }}</p>
          </div>

          <!-- Current Grade Display -->
          <div class="grade-section" *ngIf="project.score !== null && project.score !== undefined && !isEditingGrade">
            <h3 class="section-label">Evaluation Result</h3>
            <div class="grade-card">
              <div class="score-circle" [class.high]="project.score >= 75" [class.mid]="project.score >= 50 && project.score < 75" [class.low]="project.score < 50">
                <span class="score-num">{{ project.score }}</span>
                <span class="score-total">/100</span>
              </div>
              <div class="feedback-box">
                <h4>Faculty Feedback</h4>
                <blockquote>"{{ project.evaluations?.[0]?.comments || 'No comments provided.' }}"</blockquote>
                <small *ngIf="project.evaluations?.[0]?.facultyName">
                  — Evaluated by <strong>{{ project.evaluations[0].facultyName }}</strong>
                </small>
              </div>
            </div>
          </div>

          <!-- GRADING FORM — Faculty only (not admin) -->
          <div class="grade-form-section" *ngIf="userRole === 'faculty' && (!project.score || isEditingGrade)">
            <h3 class="section-label">
              {{ project.score ? '✏️ Update Evaluation' : '📋 Grade this Project' }}
            </h3>

            <!-- Show existing grade as reference when updating -->
            <div class="current-grade-ref" *ngIf="project.score && isEditingGrade">
              <span class="ref-label">Current Grade:</span>
              <span class="ref-score">{{ project.score }}/100</span>
              <span class="ref-feedback" *ngIf="project.evaluations?.[0]?.comments">
                "{{ project.evaluations[0].comments }}"
              </span>
            </div>

            <div class="form-row">
              <div class="form-group score-group">
                <label>Score (0–100) <span class="req">*</span></label>
                <div class="score-input-wrap">
                  <input type="number" [(ngModel)]="tempScore" class="glass-input score-input"
                         min="0" max="100" placeholder="{{ project.score || '0' }}">
                  <span class="score-suffix">/100</span>
                </div>
                <!-- Score visual indicator -->
                <div class="score-bar-preview" *ngIf="tempScore !== null && tempScore >= 0">
                  <div class="score-fill-preview"
                       [style.width]="(tempScore > 100 ? 100 : tempScore) + '%'"
                       [class.high]="tempScore >= 75"
                       [class.mid]="tempScore >= 50 && tempScore < 75"
                       [class.low]="tempScore < 50"></div>
                </div>
                <div class="score-grade-label" *ngIf="tempScore !== null">
                  {{ getGradeLabel(tempScore) }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Feedback / Comments <span class="optional">(optional)</span></label>
              <textarea [(ngModel)]="tempFeedback" class="glass-input" rows="5"
                        placeholder="Describe the project quality, what was done well, areas for improvement..."></textarea>
            </div>

            <div class="form-actions">
              <div class="grader-info">
                <span class="grader-label">Grading as:</span>
                <span class="grader-name">{{ currentUserName }}</span>
                <span class="role-chip">{{ userRole | titlecase }}</span>
              </div>
              <button (click)="submitGrade()" class="btn-primary" [disabled]="isSubmitting || tempScore === null || tempScore < 0 || tempScore > 100">
                {{ isSubmitting ? 'Saving...' : (project.score ? 'Update Grade' : 'Submit Grade') }}
              </button>
            </div>
          </div>

          <!-- View-only message for students -->
          <div class="student-info-box" *ngIf="userRole === 'student' && !project.score">
            <span>⏳ Your project is awaiting evaluation by your faculty.</span>
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

    .main-layout { margin-left: 250px; padding: 2.5rem; min-height: 100vh; background: #f8fafc; }
    @media (max-width: 768px) { .main-layout { margin-left: 0; padding: 1.5rem; } }

    .back-link { display: inline-flex; align-items: center; gap: 0.4rem; margin-bottom: 1.5rem; color: #64748b; text-decoration: none; font-size: 0.9rem; font-weight: 500; padding: 0.4rem 0.8rem; border-radius: 6px; background: white; border: 1px solid #e2e8f0; transition: all 0.2s; }
    .back-link:hover { background: #f1f5f9; color: #1e293b; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-left { flex: 1; }
    h1 { font-size: 1.9rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem; line-height: 1.3; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .status-badge { padding: 0.3rem 0.75rem; border-radius: 99px; background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; font-size: 0.8rem; font-weight: 600; }
    .status-badge.graded { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
    .type-badge { background: #ede9fe; color: #7c3aed; border: 1px solid #c4b5fd; font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 99px; }
    .sem-badge { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; font-size: 0.78rem; font-weight: 500; padding: 0.3rem 0.75rem; border-radius: 99px; }
    .subj-badge { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 99px; }

    .header-actions { display: flex; gap: 0.75rem; align-items: flex-start; flex-shrink: 0; }
    .btn-edit-grade { background: #6366f1; color: white; border: none; padding: 0.65rem 1.4rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-edit-grade:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-cancel { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.65rem 1.2rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-cancel:hover { background: #f1f5f9; }

    /* Card */
    .glass-panel { background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .p-6 { padding: 2rem; }

    /* Meta Info */
    .meta-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; padding-bottom: 1.75rem; border-bottom: 1px solid #f1f5f9; margin-bottom: 1.75rem; }
    .meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .meta-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #94a3b8; }
    .meta-val { color: #1e293b; font-weight: 600; font-size: 0.95rem; }
    .email-badge { font-size: 0.75rem; background: #f1f5f9; color: #64748b; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: 0.5rem; font-family: monospace; }
    .repo-link { color: #6366f1; text-decoration: none; font-size: 0.9rem; font-weight: 500; }
    .repo-link:hover { text-decoration: underline; }

    .chip-av { width: 20px; height: 20px; border-radius: 50%; background: #c4b5fd; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; }

    /* Abstract */
    .abstract-section { margin-bottom: 2rem; }
    .abstract-section h3 { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 700; color: #1e293b; }
    .abstract-section p { line-height: 1.8; color: #475569; font-size: 0.95rem; }

    .section-label { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; }

    /* Grade Display */
    .grade-section { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; }
    .grade-card { display: flex; align-items: center; gap: 2rem; background: linear-gradient(135deg, #ecfdf5, #f0fdf4); padding: 1.75rem; border-radius: 14px; border: 1px solid #a7f3d0; flex-wrap: wrap; }
    .score-circle { width: 90px; height: 90px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .score-circle.high { background: linear-gradient(135deg, #059669, #10b981); color: white; }
    .score-circle.mid { background: linear-gradient(135deg, #d97706, #f59e0b); color: white; }
    .score-circle.low { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; }
    .score-num { font-size: 1.9rem; line-height: 1; }
    .score-total { font-size: 0.75rem; opacity: 0.8; }
    .feedback-box h4 { font-size: 0.85rem; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
    blockquote { font-style: italic; color: #475569; margin: 0 0 0.5rem; line-height: 1.6; font-size: 0.95rem; }
    .feedback-box small { color: #94a3b8; }

    /* GRADING FORM */
    .grade-form-section { margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e2e8f0; }
    .current-grade-ref { display: flex; align-items: center; gap: 0.75rem; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .ref-label { font-size: 0.8rem; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .ref-score { font-size: 1.2rem; font-weight: 800; color: #d97706; }
    .ref-feedback { font-size: 0.85rem; color: #92400e; font-style: italic; }
    .form-row { margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.65rem; color: #334155; font-weight: 600; font-size: 0.9rem; }
    .req { color: #ef4444; }
    .optional { color: #94a3b8; font-weight: 400; font-size: 0.82rem; }
    .glass-input { width: 100%; padding: 0.85rem 1rem; background: white; border: 1.5px solid #cbd5e1; border-radius: 8px; color: #1e293b; font-size: 1rem; box-sizing: border-box; transition: all 0.2s; }
    .glass-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .glass-input::placeholder { color: #94a3b8; }

    .score-group { max-width: 280px; }
    .score-input-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .score-input { flex: 1; font-weight: 700; font-size: 1.3rem; text-align: center; }
    .score-suffix { font-size: 1rem; color: #94a3b8; font-weight: 600; white-space: nowrap; }
    .score-bar-preview { height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-top: 0.75rem; }
    .score-fill-preview { height: 100%; border-radius: 99px; transition: width 0.3s ease, background 0.3s ease; }
    .score-fill-preview.high { background: linear-gradient(90deg, #10b981, #059669); }
    .score-fill-preview.mid { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .score-fill-preview.low { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .score-grade-label { font-size: 0.82rem; font-weight: 700; margin-top: 0.4rem; }

    .form-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 1rem; }
    .grader-info { display: flex; align-items: center; gap: 0.5rem; }
    .grader-label { font-size: 0.8rem; color: #94a3b8; }
    .grader-name { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
    .role-chip { background: #ede9fe; color: #7c3aed; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .btn-primary { padding: 0.85rem 2rem; background: #6366f1; color: white; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .student-info-box { margin-top: 2rem; padding: 1rem 1.5rem; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; color: #92400e; font-size: 0.9rem; }
    .loading, .error-state { text-align: center; padding: 4rem; color: #64748b; }
    .error-state h2 { color: #1e293b; margin-bottom: 1rem; }
    .error-state a { color: #6366f1; font-weight: 600; text-decoration: none; }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }
    .admin-view-badge span { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.82rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem; }
  `]
})
export class ProjectDetailsComponent implements OnInit {
  project: any = null;
  isLoading = true;
  userRole = 'student';
  isEditingGrade = false;

  // Grading form
  tempScore: number | null = null;
  tempFeedback: string = '';
  isSubmitting = false;

  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get canGrade(): boolean {
    return this.userRole === 'faculty'; // Admin is read-only
  }

  get currentUserName(): string {
    return this.authService.currentUser()?.name || this.userRole;
  }

  get backLink(): string {
    if (this.userRole === 'admin') return '/admin/faculty-overview';
    if (this.userRole === 'faculty') return '/faculty';
    return '/student';
  }

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
        // Pre-fill grade form with existing values when editing
        if (data.score) {
          this.tempScore = data.score;
          this.tempFeedback = data.evaluations?.[0]?.comments || '';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load project', err);
        this.isLoading = false;
      }
    });
  }

  getGradeLabel(score: number): string {
    if (score > 100) return '⚠️ Max is 100';
    if (score < 0) return '⚠️ Min is 0';
    if (score >= 90) return '🏆 Outstanding (A+)';
    if (score >= 75) return '⭐ Excellent (A)';
    if (score >= 60) return '✅ Good (B)';
    if (score >= 50) return '📘 Average (C)';
    if (score >= 35) return '⚠️ Below Average (D)';
    return '❌ Fail (F)';
  }

  submitGrade() {
    if (this.tempScore === null || this.tempScore < 0 || this.tempScore > 100) return;

    this.isSubmitting = true;
    const currentUser = this.authService.currentUser();

    const evaluationData = {
      projectId: this.project.id,
      score: this.tempScore,
      comments: this.tempFeedback,
      facultyId: currentUser?.id
    };

    this.apiService.submitEvaluation(evaluationData).subscribe({
      next: () => {
        this.project = {
          ...this.project,
          score: this.tempScore,
          status: 'Graded',
          evaluations: [{
            comments: this.tempFeedback,
            facultyName: currentUser?.name
          }]
        };
        this.isEditingGrade = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Failed to submit evaluation', err);
        alert('Error submitting evaluation. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}
