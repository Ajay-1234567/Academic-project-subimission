import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  template: `
    <app-sidebar role="student"></app-sidebar>
    <div class="main-layout fade-in">
      <header class="header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Manage your project submissions</p>
          <div class="faculty-pill" *ngIf="assignedFaculties.length > 0">
            <span class="label">Assigned Faculty:</span>
            <div class="faculty-list">
              <div class="fac-item" *ngFor="let f of assignedFaculties">
                <span class="fac-name">{{ f.name }}</span>
                <span class="fac-subj" *ngIf="f.subject">({{ f.subject }})</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Notification Bell -->
        <a routerLink="/student/notifications" class="notif-bell" *ngIf="activeAnnouncements.length > 0">
          <span class="bell-icon">🔔</span>
          <span class="bell-badge">{{ activeAnnouncements.length }}</span>
        </a>
      </header>

      <!-- Group Info Banner -->
      <div class="group-info-banner" *ngIf="groupInfo">
        <div class="gib-header">
          <div class="gib-icon">👥</div>
          <div class="gib-title">
            <strong>Group {{ groupInfo.groupNumber }}<span *ngIf="groupInfo.groupName"> — {{ groupInfo.groupName }}</span></strong>
            <span class="gib-sub">You are part of this group. Group project submissions are shared with all members.</span>
          </div>
        </div>
        <div class="gib-members">
          <span *ngFor="let m of groupInfo.members" class="gib-member"
                [class.gib-me]="m.id === currentUser?.id">
            <span class="gib-avatar">{{ m.name.charAt(0) }}</span>
            {{ m.name }}{{ m.id === currentUser?.id ? ' (You)' : '' }}
          </span>
        </div>
        <div class="gib-projects" *ngIf="groupInfo.projects && groupInfo.projects.length > 0">
          <div class="gib-proj-label">📋 Group Project Submissions</div>
          <div *ngFor="let p of groupInfo.projects" class="gib-project-row">
            <a [routerLink]="['/projects', p.id]" class="gib-project-link">{{ p.submitterStudentName || 'Group' }} — {{ p.title }}</a>
            <span class="gib-proj-badge" [class.graded]="p.score">{{ p.score ? '✅ Graded: ' + p.score + '/100' : '⏳ Pending' }}</span>
          </div>
        </div>
        <div class="gib-no-proj" *ngIf="!groupInfo.projects || groupInfo.projects.length === 0">
          No group project submitted yet. <a routerLink="/student/submit" class="gib-submit-link">Submit now →</a>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
             <span class="label">Total Projects</span>
             <span class="value">{{ totalSubmissions }}</span>
             <span class="sub-text">Submitted so far</span>
          </div>
          <div class="stat-icon">📂</div>
        </div>
        <div class="stat-card score">
          <div class="stat-content">
             <span class="label">Average Score</span>
             <span class="value">{{ averageScore }}<small style="font-size: 1rem; color: var(--text-secondary);">/100</small></span>
             <span class="sub-text">Based on {{ gradedCount }} graded project(s)</span>
          </div>
          <div class="stat-icon">📊</div>
        </div>
      </div>

      <!-- Announcement Banner -->
      <div class="announce-banner" *ngIf="shouldShowAnnouncements && activeAnnouncements.length > 0 && !bannerDismissed">
        <div class="banner-content">
          <span class="banner-icon">📢</span>
          <div class="banner-text">
            <strong>{{ activeAnnouncements[0].title }}</strong>
            <span *ngIf="activeAnnouncements[0].deadline">
              — Deadline: <b>{{ activeAnnouncements[0].deadline | date:'mediumDate' }} at {{ activeAnnouncements[0].deadline | date:'shortTime' }}</b>
            </span>
          </div>
          <div class="banner-actions">
            <a routerLink="/student/notifications" class="banner-link">View All</a>
            <button (click)="bannerDismissed = true" class="banner-close">✕</button>
          </div>
        </div>
      </div>

      <!-- Semester & Subjects Section -->
      <div class="subjects-section">
        <div class="section-header">
           <h3>Available Subjects</h3>
            <div class="controls">
              <select [(ngModel)]="selectedSemester" (change)="loadSubjects()" class="glass-input small">
                <option value="">Select Semester</option>
                <option *ngFor="let s of semesters" [value]="s">{{ s }}</option>
              </select>
            </div>
         </div>

         <!-- Subjects Grid -->
         <div class="subjects-grid" *ngIf="selectedSemester && availableSubjects.length > 0">
            <div *ngFor="let subj of availableSubjects" class="subject-card" (click)="openSubject(subj)">
               <div class="subj-icon">📚</div>
               <h4>{{ subj.name }}</h4>
               <p class="subj-meta">{{ subj.department }} • {{ subj.semester }}</p>
               <div class="subj-faculty">by {{ getFacultyName(subj.facultyId) }}</div>
               
               <!-- Check if submitted -->
               <div class="subj-status" *ngIf="isSubmitted(subj.name)">
                 ✅ Submitted
               </div>
            </div>
         </div>

         <div *ngIf="selectedSemester && availableSubjects.length === 0" class="empty-subjects">
            <p>No subjects found for {{ selectedSemester }} in your curriculum.</p>
         </div>

         <div *ngIf="!selectedSemester" class="empty-subjects">
            <p>Please select a semester to see the relevant subjects.</p>
         </div>
      </div>

      <!-- Submission List -->
      <div class="submission-section mt-5">
        <div class="section-header">
          <h3>My Submissions</h3>
          <div class="search-box">
             <input [(ngModel)]="searchTerm" placeholder="Search projects..." class="glass-input small">
          </div>
        </div>
        
        <div *ngIf="isLoading" class="loading-state">Loading...</div>
        
        <div class="submissions-grid" *ngIf="!isLoading">
          <div *ngFor="let p of filteredSubmissions" class="project-card">
            <div class="card-header">
              <h4>
                <a [routerLink]="['/projects', p.id]" class="project-link">{{ p.title }}</a>
                <span *ngIf="p.semester" class="sem-badge">{{ p.semester }}</span>
              </h4>
              <span class="status-badge" [ngClass]="p.status === 'Graded' ? 'graded' : 'pending'">
                {{ p.status || 'Pending' }}
              </span>
            </div>
            
            <div *ngIf="p.subject" class="subject-tag">{{ p.subject }}</div>
            <p class="desc">{{ p.abstract | slice:0:150 }}...</p>
            
            <div class="card-footer">
                <div *ngIf="p.score" class="grade-box">
                  <span class="lbl">Grade:</span> 
                  <strong>{{ p.score }}</strong>/100
                </div>
                
                <div *ngIf="!p.score" class="crud-actions">
                  <button (click)="editProject(p.id)" class="btn-icon edit" title="Edit Project">✏️</button>
                  <button (click)="deleteProject(p.id)" class="btn-icon delete" title="Delete Project">🗑️</button>
                </div>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading && filteredSubmissions.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <p>No projects submitted yet.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; background: var(--background); min-height: 100vh; }
    @media (max-width: 1024px) { .main-layout { margin-left: 0; padding: 5rem 1rem 2rem; } }

    .header {
      margin-bottom: 1.75rem;
      display: flex; justify-content: space-between; align-items: flex-start;
      padding-bottom: 1.25rem; border-bottom: 1px solid var(--border);
      flex-wrap: wrap; gap: 0.75rem;
    }
    h1 { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; letter-spacing: -0.5px; }
    p { color: var(--text-secondary); margin: 0; font-size: 1rem; }
    .mt-5 { margin-top: 3rem; }
    
    .faculty-pill {
      display: inline-flex; align-items: flex-start; gap: 0.75rem;
      background: var(--surface); border: 1px solid var(--border);
      padding: 0.6rem 1.25rem; border-radius: 12px; margin-top: 0.8rem;
    }
    .faculty-pill .label { color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
    .faculty-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .fac-item { display: flex; align-items: center; gap: 0.4rem; }
    .fac-name { color: var(--primary); font-weight: 700; font-size: 0.92rem; }
    .fac-subj { color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; font-style: italic; }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-card { 
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    
    .stat-content { display: flex; flex-direction: column; }
    .stat-card .label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
    .stat-card .value { font-size: 2rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .stat-card.score .value { color: #059669; }
    .stat-card .sub-text { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem; }
    .stat-icon { font-size: 2rem; opacity: 0.8; background: #f1f5f9; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }

    /* Subjects Grid */
    .subjects-section { margin-bottom: 2rem; }
    .subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    
    .subject-card { 
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;
      cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
      display: flex; flex-direction: column; align-items: flex-start;
    }
    .subject-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: var(--primary); }
    
    .subj-icon { font-size: 2rem; margin-bottom: 0.5rem; background: #eff6ff; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
    .subject-card h4 { margin: 0.5rem 0 0.2rem; font-size: 1.1rem; color: var(--text-primary); font-weight: 600; }
    .subj-meta { color: var(--text-secondary); font-size: 0.85rem; margin: 0; }
    .subj-faculty { color: var(--primary); font-size: 0.75rem; font-weight: 600; font-style: italic; margin-top: 0.5rem; }
    
    .subj-status { 
      position: absolute; top: 0.5rem; right: 0.5rem; 
      font-size: 0.75rem; background: #ecfdf5; color: #059669; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; 
    }
    
    .empty-subjects { background: var(--surface); padding: 3rem; text-align: center; border-radius: 12px; border: 1px dashed var(--border); color: var(--text-secondary); margin-top: 1rem; }

    /* Submission List */
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .section-header h3 { font-size: 1.2rem; color: var(--text-primary); margin: 0; font-weight: 600; }
    
    .submissions-grid { display: grid; gap: 1rem; }
    
    .project-card { 
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      padding: 1.5rem; transition: transform 0.2s; 
      display: flex; flex-direction: column;
    }
    .project-card:hover { transform: translateY(-3px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border-color: var(--border); }
    
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .card-header h4 { margin: 0; font-size: 1.1rem; }
    
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 99px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.pending { background: var(--surface)beb; color: #d97706; border: 1px solid #fcd34d; }
    .status-badge.graded { background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; }
    
    .desc { color: var(--text-secondary); margin: 0.5rem 0 1rem; font-size: 0.95rem; line-height: 1.5; }
    .subject-tag { display: inline-block; font-size: 0.8rem; background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; font-weight: 600; }
    
    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f1f5f9; margin-top: auto; }
    
    .grade-box { color: #059669; font-size: 1.1rem; }
    .grade-box .lbl { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-right: 0.3rem; }
    
    .project-link { color: var(--text-primary); text-decoration: none; transition: color 0.2s; font-weight: 600; }
    .project-link:hover { color: var(--primary); text-decoration: underline; }
    
    .empty-state { text-align: center; padding: 4rem; color: var(--text-secondary); background: var(--surface); border-radius: 12px; border: 1px dashed var(--border); }
    .empty-icon { font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.5; }
    .btn-primary { display: inline-block; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border-radius: 8px; text-decoration: none; margin-top: 1rem; font-weight: 500; }
    .loading-state { text-align: center; padding: 2rem; color: var(--text-secondary); }

    .glass-input.small { padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); }
    .glass-input:focus { outline: none; border-color: var(--primary); }
    
    .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; opacity: 0.6; }
    .btn-icon:hover { transform: scale(1.2); opacity: 1; }
    .btn-icon.delete:hover { filter: drop-shadow(0 0 5px red); }

    .notif-bell { position: relative; text-decoration: none; font-size: 1.5rem;
                  padding: 0.6rem; border-radius: 50%; background: var(--surface);
                  border: 1px solid var(--border); transition: all 0.2s; height: 44px; width: 44px;
                  display: flex; align-items: center; justify-content: center; }
    .notif-bell:hover { background: #f1f5f9; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .bell-badge { position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 0.65rem; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

    .announce-banner { background: var(--surface)7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 2rem; }
    .banner-content { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .banner-icon { font-size: 1.4rem; flex-shrink: 0; }
    .banner-text { flex: 1; color: var(--text-primary); font-size: 0.95rem; }
    .banner-actions { display: flex; align-items: center; gap: 0.75rem; }
    .banner-link { color: #ea580c; font-weight: 600; text-decoration: none; font-size: 0.9rem; white-space: nowrap; }
    .banner-close { background: transparent; border: none; color: #9a3412; cursor: pointer; font-size: 1rem; }
    
    .sem-badge { font-size: 0.75rem; background: #f1f5f9; color: #475569; padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.5rem; border: 1px solid var(--border); }

    /* Group Info Banner */
    .group-info-banner { background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #6ee7b7; border-radius: 14px; padding: 1.5rem; margin-bottom: 2rem; }
    .gib-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; }
    .gib-icon { font-size: 1.75rem; }
    .gib-title strong { display: block; font-size: 1rem; font-weight: 700; color: #065f46; }
    .gib-sub { font-size: 0.82rem; color: #059669; margin-top: 0.2rem; display: block; }
    .gib-members { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .gib-member { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--surface); border: 1px solid #a7f3d0; border-radius: 99px; padding: 0.3rem 0.75rem; font-size: 0.82rem; color: #065f46; font-weight: 500; }
    .gib-member.gib-me { background: #d1fae5; border-color: #6ee7b7; font-weight: 700; }
    .gib-avatar { width: 20px; height: 20px; border-radius: 50%; background: #6ee7b7; color: #065f46; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; }
    .gib-proj-label { font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.5rem; }
    .gib-project-row { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border-radius: 8px; padding: 0.6rem 0.75rem; margin-bottom: 0.4rem; }
    .gib-project-link { font-size: 0.88rem; color: #059669; font-weight: 500; text-decoration: none; }
    .gib-project-link:hover { text-decoration: underline; }
    .gib-proj-badge { font-size: 0.78rem; color: var(--text-secondary); }
    .gib-proj-badge.graded { color: #059669; font-weight: 600; }
    .gib-no-proj { font-size: 0.88rem; color: var(--text-secondary); font-style: italic; }
    .gib-submit-link { color: #6366f1; font-weight: 600; text-decoration: none; }
    .gib-submit-link:hover { text-decoration: underline; }

    /* ── MOBILE ────────────────────────────────────────────── */
    @media (max-width: 1024px) {
      h1 { font-size: 1.5rem; }
      p { font-size: 0.9rem; }

      /* Faculty pill: wrap on small screens */
      .faculty-pill { flex-wrap: wrap; padding: 0.5rem 1rem; margin-top: 0.5rem; }

      /* Notification bell: smaller */
      .notif-bell { width: 38px; height: 38px; font-size: 1.2rem; }

      /* Stats: 2 columns */
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
      .stat-card { padding: 1rem; }
      .stat-card .value { font-size: 1.6rem; }
      .stat-icon { width: 38px; height: 38px; font-size: 1.3rem; }

      /* Subjects: 2 cols, then 1 on tiny screens */
      .subjects-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
      .subject-card { padding: 1rem; }

      /* Section header: stack on mobile */
      .section-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; margin-bottom: 1rem; }
      .search-box input { width: 100%; }

      /* Controls */
      .controls { width: 100%; }
      .controls select { width: 100%; }

      /* Group info banner: tighter */
      .group-info-banner { padding: 1rem; }
      .gib-members { gap: 0.35rem; }
    }
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 0.5rem; }
      .subjects-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  submissions: any[] = [];
  announcements: any[] = [];
  allSubjects: any[] = [];
  availableSubjects: any[] = [];
  groupInfo: any = null;

  searchTerm = '';
  isLoading = false;
  bannerDismissed = false;

  assignedFaculties: any[] = [];

  // Stats
  totalSubmissions = 0;
  averageScore = 0;
  gradedCount = 0;

  selectedSemester = '';
  semesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
  studentDept = '';
  studentBranch = '';
  studentDomain = '';
  assignedFacultyId: number | null = null;

  get currentUser() { return this.authService.currentUser(); }

  get shouldShowAnnouncements(): boolean {
    const stored = localStorage.getItem('notifPrefs');
    if (!stored) return true;
    return JSON.parse(stored).announcements !== false;
  }

  get activeAnnouncements() {
    return this.announcements.filter(a => {
      if (!a.deadline) return true;
      return new Date(a.deadline) > new Date();
    });
  }

  get filteredSubmissions() {
    let filtered = this.submissions;
    if (this.selectedSemester) filtered = filtered.filter(p => p.semester === this.selectedSemester);
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
    }
    return filtered;
  }

  get FacultyName() { return (id: number) => this.assignedFaculties.find(f => f.id === id)?.name || 'Faculty'; }
  getFacultyName(id: number) { return this.assignedFaculties.find(f => f.id === id)?.name || 'Faculty'; }

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      // 1. Maintain persistence selection
      const savedSem = localStorage.getItem('lastSelectedSemester');
      if (savedSem) {
        this.selectedSemester = savedSem;
      }

      this.apiService.getUserById(user.id).subscribe(u => {
        this.studentDept = u.department;
        this.studentBranch = u.branch;
        this.studentDomain = u.domain;
        this.assignedFaculties = u.assignedFaculties || [];
        this.assignedFacultyId = u.assignedFacultyId;

        // Refresh subjects now that we have faculty info
        this.loadSubjects();
      });
    }

    this.loadProjects();
    this.loadAnnouncements();
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

  loadSubjects() {
    if (this.selectedSemester) {
      localStorage.setItem('lastSelectedSemester', this.selectedSemester);
    }

    if (!this.studentDept) return;

    if (this.assignedFaculties.length > 0) {
      // Fetch subjects for each assigned faculty — NO semester or department filter
      // This allows subjects from other depts to show up if they are mapped to this student
      const requests = this.assignedFaculties.map(f =>
        this.apiService.getSubjects(undefined, undefined, f.id)
      );

      forkJoin(requests).subscribe({
        next: (results: any[]) => {
          let merged = results.flat();
          // Filter by sf.subject string OR branch/domain match
          merged = merged.filter(s => {
            const facMapping = this.assignedFaculties.find(f => f.id === s.facultyId);
            const rawMapping = facMapping?.subject || '';
            const mappedSubjs = rawMapping.split(',').map((x: string) => x.trim().toLowerCase());

            const isExplicitlyMapped = mappedSubjs.includes(s.name.trim().toLowerCase());
            const isDomainMatch = s.branch === this.studentBranch && (s.domain === this.studentDomain || !s.domain);

            return isExplicitlyMapped || isDomainMatch;
          });

          this.allSubjects = [...new Map(merged.map((item: any) => [item['id'], item])).values()];
          this.applyLocalFilter();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.allSubjects = [];
      this.availableSubjects = [];
    }
  }

  applyLocalFilter() {
    // 1. Filter by selected semester (if any)
    let filtered = this.allSubjects;
    if (this.selectedSemester) {
      filtered = filtered.filter(s => s.semester === this.selectedSemester);
    }
    // 2. Hide already submitted subjects
    this.availableSubjects = filtered.filter(s => !this.isSubmitted(s.name));
  }

  loadAnnouncements() {
    this.apiService.getAnnouncements().subscribe({
      next: (data) => { this.announcements = data; },
      error: () => { }
    });
  }

  loadProjects() {
    const user = this.authService.currentUser();
    if (user) {
      this.isLoading = true;
      this.apiService.getProjects(user.role, user.id).subscribe({
        next: (data) => {
          this.submissions = data;
          this.calculateStats();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load projects', err);
          this.isLoading = false;
        }
      });
    }
  }

  calculateStats() {
    this.totalSubmissions = this.submissions.length;
    const gradedProjects = this.submissions.filter(p => p.score != null);
    this.gradedCount = gradedProjects.length;

    if (this.gradedCount > 0) {
      const sum = gradedProjects.reduce((acc, p) => acc + (Number(p.score) || 0), 0);
      this.averageScore = Math.round((sum / this.gradedCount) * 10) / 10;
    } else {
      this.averageScore = 0;
    }
  }

  openSubject(subj: any) {
    if (this.isSubmitted(subj.name)) {
      const p = this.submissions.find(s => s.subject === subj.name && s.semester === this.selectedSemester);
      if (p) {
        this.router.navigate(['/projects', p.id]);
        return;
      }
    }
    this.router.navigate(['/student/submit'], {
      queryParams: { subject: subj.name, semester: subj.semester }
    });
  }

  isSubmitted(subjectName: string): boolean {
    return this.submissions.some(p => p.subject === subjectName && p.semester === this.selectedSemester);
  }

  editProject(id: number) {
    this.router.navigate(['/student/submit'], { queryParams: { edit: id } });
  }

  deleteProject(id: number) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    this.apiService.deleteProject(id).subscribe({
      next: () => {
        this.submissions = this.submissions.filter(p => p.id !== id);
      },
      error: (err) => {
        console.error('Failed to delete', err);
        alert('Cannot delete project (it might be graded already).');
      }
    });
  }
}
