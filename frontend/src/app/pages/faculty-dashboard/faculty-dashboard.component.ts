import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Data Science', 'Artificial Intelligence', 'Biotechnology', 'Other'
];

const SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  template: `
    <app-sidebar role="faculty"></app-sidebar>
    <div class="main-layout fade-in">
      <header class="page-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p>Manage projects and course subjects</p>
        </div>
        <div class="view-toggles">
          <button (click)="viewMode = 'projects'" [class.active]="viewMode === 'projects'">Projects</button>
          <button (click)="viewMode = 'subjects'" [class.active]="viewMode === 'subjects'">Subjects</button>
        </div>
      </header>

      <!-- PROJECTS VIEW -->
      <div *ngIf="viewMode === 'projects'">
        <!-- Stats Row -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-content">
               <span class="label">Total Projects</span>
               <span class="value">{{ submissions.length }}</span>
            </div>
            <div class="stat-icon">📂</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-content">
               <span class="label">Pending Review</span>
               <span class="value">{{ pendingCount }}</span>
            </div>
            <div class="stat-icon">⏳</div>
          </div>
          <div class="stat-card success">
            <div class="stat-content">
               <span class="label">Graded</span>
               <span class="value">{{ gradedCount }}</span>
            </div>
            <div class="stat-icon">✅</div>
          </div>
        </div>

        <!-- Filter Tabs + Search -->
        <div class="controls-row">
          <div class="tabs">
            <button [class.active]="filter === 'all'" (click)="setFilter('all')">All Projects</button>
            <button [class.active]="filter === 'pending'" (click)="setFilter('pending')">Pending</button>
            <button [class.active]="filter === 'graded'" (click)="setFilter('graded')">Graded</button>
          </div>
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search by title or student..." class="search-input">
          </div>
        </div>

        <div *ngIf="isLoading" class="loading-state">Loading submissions...</div>
        
        <div class="grid-submissions" *ngIf="!isLoading">
          <div *ngFor="let s of filteredSubmissions" class="project-card" [class.graded-border]="s.score">
            <div class="card-header">
              <div class="header-top">
                <span class="status-badge" [ngClass]="s.score ? 'graded' : 'pending'">
                  {{ s.score ? 'Graded' : 'Pending Review' }}
                </span>
                <span class="id-badge">#{{ s.id }}</span>
              </div>
              
              <h3><a [routerLink]="['/projects', s.id]" class="project-link">{{ s.title }}</a></h3>
              <div *ngIf="s.subject" class="subj-pill">{{ s.subject }}</div>
              
              <div class="student-meta">
                 <div class="avatar-sm">{{ s.studentName ? s.studentName.charAt(0).toUpperCase() : '?' }}</div>
                 <div class="meta-text">
                   <span class="name">{{ s.studentName || 'Unknown Student' }}</span>
                   <span class="email">{{ s.studentEmail }}</span>
                 </div>
              </div>
            </div>
            
            <div class="card-body">
              <p class="desc">{{ s.abstract | slice:0:120 }}{{ s.abstract.length > 120 ? '...' : '' }}</p>
            </div>
            
            <div class="card-footer">
              <div *ngIf="s.score" class="score-box">
                <span class="score-lbl">Score</span>
                <span class="score-val">{{ s.score }}<small>/100</small></span>
              </div>
              
              <div *ngIf="!s.score" class="action-box">
                <a [routerLink]="['/projects', s.id]" class="btn-grade">Grade Project</a>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="!isLoading && filteredSubmissions.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>No projects found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      </div>

      <!-- SUBJECTS VIEW -->
      <div *ngIf="viewMode === 'subjects'">
        <div class="form-card">
          <h3>Add New Subject</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Subject Name</label>
              <input [(ngModel)]="newSubject.name" class="glass-input" placeholder="e.g. Data Structures">
            </div>
            <div class="form-group">
              <label>Department</label>
              <select [(ngModel)]="newSubject.department" class="glass-input">
                <option value="">Select Dept</option>
                <option *ngFor="let d of departments" [value]="d">{{ d }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select [(ngModel)]="newSubject.semester" class="glass-input">
                <option value="">Select Semester</option>
                <option *ngFor="let s of semesters" [value]="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <button (click)="addSubject()" class="btn-primary" [disabled]="isAddingSubject">
            {{ isAddingSubject ? 'Adding...' : 'Add Subject' }}
          </button>
        </div>

        <h3>Managed Subjects</h3>
        <div class="subjects-list">
          <div *ngFor="let subj of subjects" class="subject-card">
             <div class="subj-info">
               <h4>{{ subj.name }}</h4>
               <span class="tags">
                 <span class="tag dept">{{ subj.department }}</span>
                 <span class="tag sem">{{ subj.semester }}</span>
               </span>
             </div>
             <button (click)="deleteSubject(subj.id)" class="btn-icon delete" title="Delete">🗑️</button>
          </div>
          <div *ngIf="subjects.length === 0" class="empty-state">
            <p>No subjects added yet.</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; background: #f8fafc; min-height: 100vh; }
    @media (max-width: 768px) { .main-layout { margin-left: 0; padding-top: 80px; } }

    /* Header */
    .page-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
    h1 { font-size: 2rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; letter-spacing: -0.5px; }
    .page-header p { color: #64748b; margin: 0; font-size: 1rem; }
    
    .view-toggles { display: flex; background: #e2e8f0; padding: 4px; border-radius: 10px; }
    .view-toggles button {
      padding: 0.5rem 1.5rem; border: none; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; border-radius: 8px;
    }
    .view-toggles button.active { background: white; color: var(--primary); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-card { 
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    
    .stat-content { display: flex; flex-direction: column; }
    .stat-card .label { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
    .stat-card .value { font-size: 2rem; font-weight: 700; color: #1e293b; line-height: 1; }
    
    .stat-card.warning .value { color: #d97706; }
    .stat-card.success .value { color: #059669; }
    
    .stat-icon { font-size: 2rem; opacity: 0.8; background: #f1f5f9; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }

    /* Tabs & Controls */
    .controls-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
    
    .tabs { display: flex; background: #e2e8f0; padding: 4px; border-radius: 10px; }
    .tabs button { 
      background: transparent; border: none; color: #64748b; 
      padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer; 
      font-weight: 500; font-size: 0.9rem; transition: all 0.2s;
    }
    .tabs button:hover { color: #1e293b; }
    .tabs button.active { background: white; color: var(--primary); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

    .search-wrapper { position: relative; max-width: 300px; flex: 1; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.9rem; }
    .search-input { 
      width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; 
      background: white; border: 1px solid #cbd5e1; border-radius: 8px; 
      color: #1e293b; font-size: 0.95rem; 
    }
    .search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

    /* Cards */
    .grid-submissions { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    
    .project-card { 
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 1.5rem; display: flex; flex-direction: column; height: 100%; 
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .project-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border-color: #cbd5e1; }
    .project-card.graded-border { border-top: 4px solid #059669; }
    
    .card-header { margin-bottom: 1rem; }
    .header-top { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
    
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 99px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.pending { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
    .status-badge.graded { background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; }
    
    .id-badge { color: #94a3b8; font-size: 0.85rem; font-family: monospace; }
    
    .project-link { font-size: 1.15rem; font-weight: 700; color: #1e293b; text-decoration: none; display: block; margin-bottom: 0.5rem; line-height: 1.4; }
    .project-link:hover { color: var(--primary); text-decoration: underline; }
    
    .subj-pill { display: inline-block; font-size: 0.8rem; background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 1rem; font-weight: 600; }

    .student-meta { display: flex; align-items: center; gap: 0.75rem; }
    .avatar-sm { width: 32px; height: 32px; background: #eff6ff; color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
    .meta-text { display: flex; flex-direction: column; line-height: 1.2; }
    .meta-text .name { font-size: 0.9rem; font-weight: 500; color: #334155; }
    .meta-text .email { font-size: 0.75rem; color: #64748b; }
    
    .card-body { flex: 1; margin-bottom: 1.5rem; }
    .desc { color: #475569; font-size: 0.9rem; line-height: 1.6; }
    
    .card-footer { border-top: 1px solid #f1f5f9; padding-top: 1rem; display: flex; justify-content: flex-end; }
    
    .score-box { display: flex; flex-direction: column; align-items: flex-end; }
    .score-lbl { font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .score-val { font-size: 1.5rem; font-weight: 700; color: #059669; line-height: 1; }
    .score-val small { font-size: 0.9rem; color: #64748b; font-weight: normal; }
    
    .btn-grade { 
      background: var(--primary); color: white; padding: 0.6rem 1.2rem; 
      border-radius: 6px; text-decoration: none; font-size: 0.9rem; font-weight: 500;
      transition: background 0.2s;
    }
    .btn-grade:hover { background: var(--primary-hover); }
    
    .empty-state { text-align: center; padding: 4rem; color: #64748b; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; }
    .empty-icon { font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.5; }
    .loading-state { text-align: center; padding: 3rem; color: #64748b; }

    /* Subject View Styles */
    .form-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #475569; font-weight: 600; font-size: 0.9rem; }
    .glass-input { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; }
    .btn-primary { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
    
    .subjects-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
    .subject-card { 
      background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.2rem; 
      display: flex; justify-content: space-between; align-items: flex-start;
      transition: all 0.2s;
    }
    .subject-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .subj-info h4 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #1e293b; }
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .tag { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; }
    .tag.dept { background: #f1f5f9; color: #475569; }
    .tag.sem { background: #fff7ed; color: #c2410c; }
    
    .btn-icon { background: transparent; border: none; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; font-size: 1.1rem; }
    .btn-icon:hover { opacity: 1; }
  `]
})
export class FacultyDashboardComponent implements OnInit {
  submissions: any[] = [];
  filteredSubmissions: any[] = [];
  subjects: any[] = [];

  viewMode: 'projects' | 'subjects' = 'projects';
  filter: 'all' | 'pending' | 'graded' = 'all';
  searchTerm = '';
  isLoading = false;

  // Subject Form
  newSubject = { name: '', department: '', semester: '' };
  departments = DEPARTMENTS;
  semesters = SEMESTERS;
  isAddingSubject = false;

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  get pendingCount() { return this.submissions.filter(s => !s.score).length; }
  get gradedCount() { return this.submissions.filter(s => s.score).length; }
  get facultyId() { return this.authService.currentUser()?.id; }

  ngOnInit() {
    this.loadSubmissions();
    this.loadSubjects();
  }

  loadSubmissions() {
    this.isLoading = true;
    const user = this.authService.currentUser();
    if (user) {
      this.apiService.getProjects(user.role, user.id).subscribe({
        next: (data) => {
          this.submissions = data;
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load submissions', err);
          this.isLoading = false;
        }
      });
    }
  }

  loadSubjects() {
    // Load subjects created by this faculty
    if (this.facultyId) {
      this.apiService.getSubjects(undefined, undefined, this.facultyId).subscribe({
        next: (data) => { this.subjects = data; },
        error: (err) => console.error(err)
      });
    }
  }

  addSubject() {
    if (!this.newSubject.name || !this.newSubject.semester) {
      alert('Name and Semester are required.');
      return;
    }
    this.isAddingSubject = true;
    const data = { ...this.newSubject, facultyId: this.facultyId };
    this.apiService.createSubject(data).subscribe({
      next: (sub) => {
        this.subjects.push(sub);
        this.newSubject = { name: '', department: '', semester: '' };
        this.isAddingSubject = false;
      },
      error: (err) => {
        alert('Failed to add subject');
        this.isAddingSubject = false;
      }
    });
  }

  deleteSubject(id: number) {
    if (!confirm('Delete this subject?')) return;
    this.apiService.deleteSubject(id).subscribe({
      next: () => {
        this.subjects = this.subjects.filter(s => s.id !== id);
      },
      error: () => alert('Failed to delete')
    });
  }

  setFilter(filter: 'all' | 'pending' | 'graded') {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter() {
    let base = this.submissions;
    if (this.filter === 'pending') base = base.filter(s => !s.score);
    else if (this.filter === 'graded') base = base.filter(s => s.score);

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      base = base.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        (s.studentName || '').toLowerCase().includes(q) ||
        (s.studentEmail || '').toLowerCase().includes(q)
      );
    }
    this.filteredSubmissions = base;
  }
}
