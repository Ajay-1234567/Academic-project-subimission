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
        <p>{{ isEditMode ? 'Update your project details below' : 'Submit your academic project for evaluation' }}</p>
      </header>

      <div class="center-container">
        <div class="form-card">

          <!-- Project Type Selector -->
          <div class="type-selector" *ngIf="!isEditMode">
            <label class="type-label">Submission Type</label>
            <div class="type-tabs">
              <button [class.active]="projectType === 'solo'" (click)="projectType = 'solo'">
                👤 Solo Project
              </button>
              <button [class.active]="projectType === 'group'" (click)="loadGroupInfo(); projectType = 'group'"
                      [disabled]="!groupInfo">
                👥 Group Project
                <span class="no-group-hint" *ngIf="!groupInfo">— no group assigned</span>
              </button>
            </div>
          </div>

          <!-- Group Info Banner -->
          <div class="group-banner" *ngIf="projectType === 'group' && groupInfo">
            <div class="gb-header">
              <span class="gb-icon">👥</span>
              <div>
                <div class="gb-title">Group {{ groupInfo.groupNumber }} <span *ngIf="groupInfo.groupName">— {{ groupInfo.groupName }}</span></div>
                <div class="gb-sub">Your entire group will see this submission</div>
              </div>
            </div>
            <div class="gb-members">
              <span *ngFor="let m of groupInfo.members" class="gb-member">
                <span class="gb-avatar">{{ m.name.charAt(0) }}</span>
                {{ m.name }}
              </span>
            </div>
            <!-- Already submitted warning -->
            <div class="already-submitted-warn" *ngIf="groupInfo.projects && groupInfo.projects.length > 0">
              ⚠️ Your group has already submitted a project. Submitting again will create an additional submission.
            </div>
          </div>

          <form (ngSubmit)="submitProject()">

            <!-- Solo: Submitter name/roll -->
            <div class="form-group" *ngIf="projectType === 'solo'">
              <label>Your Name / Roll Number</label>
              <input [(ngModel)]="submitterName" name="submitterName" class="glass-input"
                     [placeholder]="currentUser?.name || 'Enter your name or roll number'">
              <small class="hint">Leave blank to use your registered name.</small>
            </div>

            <div class="form-group">
              <label>Project Title <span class="req">*</span></label>
              <input [(ngModel)]="project.title" name="title" class="glass-input"
                     placeholder="e.g. AI-Based Traffic Management" required>
            </div>

            <div class="form-group" *ngIf="project.subject">
              <label>Subject</label>
              <input [(ngModel)]="project.subject" name="subject" class="glass-input" readonly style="background: #f1f5f9;">
            </div>

            <div class="form-group">
              <label>Semester <span class="req">*</span></label>
              <select [(ngModel)]="project.semester" name="semester" class="glass-input" required>
                <option value="">Select Semester</option>
                <option *ngFor="let sem of semesters" [value]="sem">{{ sem }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Abstract / Description <span class="req">*</span></label>
              <textarea [(ngModel)]="project.abstract" name="abstract" class="glass-input"
                        rows="6" placeholder="Describe the project's objective, methodology, and expected outcome..." required></textarea>
            </div>

            <div class="form-group">
              <label>Repository URL (GitHub/GitLab) <span class="req">*</span></label>
              <input [(ngModel)]="project.repoUrl" name="repoUrl" type="url" class="glass-input"
                     placeholder="https://github.com/username/repo" required>
              <small class="hint">Must start with http:// or https://</small>
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
    .main-layout { margin-left: 250px; padding: 2rem; min-height: 100vh; background: var(--background); }
    @media (max-width: 1024px) { .main-layout { margin-left: 0; padding: 5rem 1.25rem 2rem; } }

    .header { margin: 0 auto 2rem; max-width: 800px; }
    h1 { font-size: 2rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; margin-bottom: 0.5rem; }
    p { color: #475569; font-size: 1rem; margin: 0; }

    .center-container { display: flex; justify-content: center; }
    .form-card { width: 100%; max-width: 800px; padding: 2.5rem; background: var(--surface); border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius: 16px; }

    /* Type Selector */
    .type-selector { margin-bottom: 2rem; }
    .type-label { display: block; margin-bottom: 0.75rem; color: #475569; font-weight: 600; font-size: 0.9rem; }
    .type-tabs { display: flex; gap: 1rem; }
    .type-tabs button {
      flex: 1; padding: 1rem; border: 2px solid var(--border); border-radius: 12px;
      background: var(--surface); color: var(--text-secondary); font-size: 0.95rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s; text-align: left;
    }
    .type-tabs button:hover:not(:disabled) { border-color: #a5b4fc; background: #f5f3ff; color: #4f46e5; }
    .type-tabs button.active { border-color: #6366f1; background: #f5f3ff; color: #4f46e5; font-weight: 700; }
    .type-tabs button:disabled { opacity: 0.5; cursor: not-allowed; }
    .no-group-hint { font-size: 0.78rem; color: var(--text-secondary); font-weight: 400; display: block; margin-top: 0.2rem; }

    /* Group Banner */
    .group-banner { background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #a7f3d0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
    .gb-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; }
    .gb-icon { font-size: 1.5rem; }
    .gb-title { font-weight: 700; color: #065f46; font-size: 1rem; }
    .gb-sub { font-size: 0.82rem; color: #059669; margin-top: 0.15rem; }
    .gb-members { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .gb-member { display: flex; align-items: center; gap: 0.4rem; background: var(--surface); border: 1px solid #d1fae5; border-radius: 99px; padding: 0.3rem 0.7rem; font-size: 0.82rem; color: #065f46; font-weight: 500; }
    .gb-avatar { width: 20px; height: 20px; border-radius: 50%; background: #6ee7b7; color: #065f46; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; }
    .already-submitted-warn { margin-top: 0.75rem; background: var(--surface)beb; border: 1px solid #fcd34d; border-radius: 8px; padding: 0.6rem 0.85rem; font-size: 0.82rem; color: #92400e; }

    .form-group { margin-bottom: 1.75rem; }
    label { display: block; margin-bottom: 0.6rem; color: #334155; font-weight: 600; font-size: 0.9rem; }
    .req { color: #ef4444; }
    .glass-input { width: 100%; padding: 0.85rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 1rem; transition: all 0.2s; box-sizing: border-box; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .glass-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .glass-input::placeholder { color: var(--text-secondary); }
    .hint { color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem; display: block; }

    .actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .btn-primary { padding: 0.85rem 2.5rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
    .btn-primary:hover { background: #4f46e5; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-outline { padding: 0.85rem 1.5rem; background: var(--surface); border: 1px solid var(--border); color: #475569; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-outline:hover { background: var(--background); color: var(--text-primary); border-color: var(--text-secondary); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }
  `]
})
export class SubmitProjectComponent implements OnInit {
  project = { title: '', abstract: '', repoUrl: '', semester: '', subject: '' };
  semesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
  isSubmitting = false;
  isEditMode = false;
  projectId: number | null = null;
  projectType: 'solo' | 'group' = 'solo';
  groupInfo: any = null;
  submitterName = '';

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  get currentUser() { return this.authService.currentUser(); }

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
    // Load group info on init
    this.loadGroupInfo();
  }

  loadGroupInfo() {
    const user = this.authService.currentUser();
    if (!user) return;
    this.apiService.getStudentGroup(user.id).subscribe({
      next: (data) => { this.groupInfo = data; },
      error: () => { this.groupInfo = null; }
    });
  }

  loadProject(id: number) {
    this.apiService.getProjectById(id).subscribe({
      next: (p: any) => {
        this.project = { title: p.title, abstract: p.abstract, repoUrl: p.repoUrl, semester: p.semester || '', subject: p.subject || '' };
        this.projectType = p.projectType || 'solo';
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

    if (!this.project.title || !this.project.abstract || !this.project.repoUrl || !this.project.semester) {
      alert('Please fill in all required fields.');
      return;
    }

    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    if (!urlRegex.test(this.project.repoUrl)) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    // Group check
    if (this.projectType === 'group' && !this.groupInfo) {
      alert('You are not assigned to any group. Please submit as a solo project or ask your faculty to assign you to a group.');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.projectId) {
      this.apiService.updateProject(this.projectId, this.project).subscribe({
        next: () => { this.isSubmitting = false; this.router.navigate(['/student']); },
        error: (err: any) => { alert('Update failed: ' + (err?.error?.message || 'Unknown error')); this.isSubmitting = false; }
      });
    } else {
      const submissionData: any = {
        ...this.project,
        studentId: user.id,
        projectType: this.projectType,
        submitterName: this.submitterName || user.name,
      };

      if (this.projectType === 'group' && this.groupInfo) {
        submissionData.groupId = this.groupInfo.id;
      }

      this.apiService.submitProject(submissionData).subscribe({
        next: () => { this.isSubmitting = false; this.router.navigate(['/student']); },
        error: (err: any) => { alert('Submission failed: ' + (err?.error?.message || 'Unknown error')); this.isSubmitting = false; }
      });
    }
  }
}
