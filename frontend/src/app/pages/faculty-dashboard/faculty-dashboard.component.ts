import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

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

const SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  template: `
    <app-sidebar role="faculty"></app-sidebar>
    <div class="main-layout fade-in">

      <!-- Unified sticky header: title + tab nav in one block -->
      <div class="dash-header">
        <div class="dash-title">
          <h1>Faculty Dashboard</h1>
          <p>Welcome, {{ facultyName }}</p>
        </div>
        <nav class="view-toggles">
          <button (click)="setView('projects')" [class.active]="viewMode === 'projects'">
            <span class="vt-icon">📂</span><span class="vt-label">Projects</span>
          </button>
          <button (click)="setView('students')" [class.active]="viewMode === 'students'">
            <span class="vt-icon">👥</span><span class="vt-label">My Students</span>
          </button>
          <button (click)="setView('subjects')" [class.active]="viewMode === 'subjects'">
            <span class="vt-icon">📚</span><span class="vt-label">Subjects</span>
          </button>
          <button (click)="setView('real-world')" [class.active]="viewMode === 'real-world'">
            <span class="vt-icon">🌍</span><span class="vt-label">Real World</span>
          </button>
        </nav>
      </div>

      <!-- PROJECTS VIEW -->
      <div *ngIf="viewMode === 'projects'">
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
              <div class="action-box">
                <a [routerLink]="['/projects', s.id]" class="btn-grade">
                  {{ s.score ? '✏️ Update Grade' : '📋 Grade Project' }}
                </a>
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

      <!-- STUDENTS VIEW -->
      <div *ngIf="viewMode === 'students'">
        <div class="section-header-row">
          <div class="student-stats-row">
            <div class="mini-stat total">
              <span class="ms-num">{{ students.length }}</span>
              <span class="ms-lbl">Total Students</span>
            </div>
            <div class="mini-stat submitted">
              <span class="ms-num">{{ submittedStudents }}</span>
              <span class="ms-lbl">Submitted</span>
            </div>
            <div class="mini-stat not-submitted">
              <span class="ms-num">{{ notSubmittedStudents }}</span>
              <span class="ms-lbl">Not Submitted</span>
            </div>
          </div>
          <div class="stu-filter-row">
            <select [(ngModel)]="studentBranchFilter" class="branch-select">
              <option value="all">All Branches</option>
              <option *ngFor="let b of branchList" [value]="b.name">{{ b.name }}</option>
            </select>
            <div class="stu-filter-tabs">
              <button [class.active]="studentFilter === 'all'" (click)="studentFilter = 'all'">All</button>
              <button [class.active]="studentFilter === 'submitted'" (click)="studentFilter = 'submitted'">Submitted ✅</button>
              <button [class.active]="studentFilter === 'pending'" (click)="studentFilter = 'pending'">Not Submitted ⏳</button>
            </div>
          </div>
        </div>

        <div *ngIf="isLoadingStudents" class="loading-state">Loading students...</div>

        <div *ngIf="!isLoadingStudents && filteredStudentList.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No students found</h3>
          <p>Students assigned to you will appear here. Go to <strong>My Students</strong> to add them.</p>
        </div>

        <div class="students-table-wrap" *ngIf="!isLoadingStudents && filteredStudentList.length > 0">
          <table class="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No.</th>
                <th>Department</th>
                <th>Subjects</th>
                <th>Group</th>
                <th>Submissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let s of filteredStudentList">
                <tr [class.not-submitted-row]="!s.hasSubmitted"
                    [class.expanded-row]="expandedStudentId === s.id"
                    (click)="toggleStudentExpand(s)">
                  <td>
                    <div class="student-cell">
                      <div class="avatar-sm">{{ s.name.charAt(0).toUpperCase() }}</div>
                      <div>
                        <div class="student-name">{{ s.name }}</div>
                        <div class="student-email">{{ s.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="roll-badge">{{ s.rollNumber || '—' }}</span></td>
                  <td>{{ s.branch || s.department || '—' }}</td>
                  <td>
                    <span class="subj-tag" *ngIf="s.subject">{{ s.subject }}</span>
                    <span *ngIf="!s.subject" class="no-data">—</span>
                  </td>
                  <td>
                    <span class="group-badge" *ngIf="s.groups && s.groups.length > 0">
                      Group {{ s.groups[0].groupNumber }}
                    </span>
                    <span *ngIf="!s.groups || s.groups.length === 0" class="no-data">No Group</span>
                  </td>
                  <td class="text-center">{{ s.totalSubmissions }}</td>
                  <td>
                    <span class="status-pill submitted" *ngIf="s.hasSubmitted">✅ Submitted</span>
                    <span class="status-pill not-sub" *ngIf="!s.hasSubmitted">⏳ Pending</span>
                  </td>
                </tr>
                <!-- Student Projects Expansion -->
                <tr *ngIf="expandedStudentId === s.id" class="projects-detail-row">
                  <td colspan="7">
                    <div class="projects-panel" (click)="$event.stopPropagation()">
                      <h4>Projects by {{ s.name }}</h4>
                      <div *ngIf="loadingStudentProjects" class="p-loading">Loading projects...</div>
                      <div *ngIf="!loadingStudentProjects && studentProjects.length === 0" class="p-empty">
                        No projects found for this student.
                      </div>
                      <div class="p-grid" *ngIf="!loadingStudentProjects && studentProjects.length > 0">
                        <div *ngFor="let p of studentProjects" class="p-mini-card">
                          <div class="p-title">{{ p.title }}</div>
                          <div class="p-meta">
                            <span class="p-subj">{{ p.subject }}</span>
                            <span class="p-score" *ngIf="p.score">Score: {{ p.score }}/100</span>
                            <span class="p-status" *ngIf="!p.score">Pending</span>
                          </div>
                          <a [routerLink]="['/projects', p.id]" class="p-link">View Full</a>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>

          </table>
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
              <select [(ngModel)]="newSubject.department" class="glass-input" disabled>
                <option value="B.Tech">B.Tech</option>
              </select>
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select [(ngModel)]="newSubject.semester" class="glass-input">
                <option value="">Select Semester</option>
                <option *ngFor="let s of semesters" [value]="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Branch</label>
              <select [(ngModel)]="newSubject.branch" class="glass-input">
                <option value="">Select Branch</option>
                <option *ngFor="let b of branchList" [value]="b.name">{{ b.name }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="showDomainSelector()">
              <label>Domain / Specialization</label>
              <select [(ngModel)]="newSubject.domain" class="glass-input">
                <option value="">Select Domain</option>
                <option *ngFor="let d of getDomainsForBranch()" [value]="d">{{ d }}</option>
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
                <div class="tags">
                  <span class="tag dept">B.Tech</span>
                  <span class="tag sem">{{ formatSemester(subj.semester) }}</span>
                  <span class="tag branch" *ngIf="subj.branch">{{ subj.branch }}</span>
                  <span class="tag domain" *ngIf="subj.domain">{{ subj.domain }}</span>
                </div>
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
    /* ── Base layout ──────────────────────────────────────────── */
    .main-layout {
      margin-left: 250px;
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* ── Unified Dash Header ───────────────────────────────────── */
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .dash-title h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0 0 0.2rem; letter-spacing: -0.5px; }
    .dash-title p { color: #64748b; margin: 0; font-size: 0.9rem; }

    /* ── View Toggle Bar ───────────────────────────────────────── */
    .view-toggles {
      display: flex;
      background: #ede9fe;
      padding: 4px;
      border-radius: 12px;
      gap: 2px;
      border: 1.5px solid #c4b5fd;
    }
    .view-toggles button {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem; border: none; background: transparent;
      color: #7c3aed; font-weight: 600; cursor: pointer; border-radius: 9px;
      transition: all 0.2s; font-size: 0.85rem; white-space: nowrap;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .view-toggles .vt-icon { font-size: 1rem; }
    .view-toggles .vt-label { font-size: 0.85rem; }
    .view-toggles button.active {
      background: white; color: #4f46e5;
      box-shadow: 0 2px 8px rgba(99,102,241,0.18);
    }

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
    .tabs button.active { background: white; color: #4f46e5; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .search-wrapper { position: relative; max-width: 300px; flex: 1; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.9rem; }
    .search-input { 
      width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; 
      background: white; border: 1px solid #cbd5e1; border-radius: 8px; 
      color: #1e293b; font-size: 0.95rem; 
    }
    .search-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

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
    .project-link:hover { color: #4f46e5; text-decoration: underline; }
    .subj-pill { display: inline-block; font-size: 0.8rem; background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 1rem; font-weight: 600; }
    .student-meta { display: flex; align-items: center; gap: 0.75rem; }
    .avatar-sm { width: 32px; height: 32px; background: #eff6ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
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
    .btn-grade { background: #4f46e5; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: background 0.2s; }
    .btn-grade:hover { background: #4338ca; }

    /* Empty & loading states */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border: 1px dashed #cbd5e1;
      border-radius: 16px;
      color: #64748b;
    }
    .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; display: block; line-height: 1; }
    .empty-state h3 { margin: 0 0 0.5rem; font-size: 1.15rem; color: #334155; font-weight: 600; }
    .empty-state p { margin: 0; font-size: 0.9rem; color: #94a3b8; }
    .loading-state { text-align: center; padding: 3rem; color: #64748b; font-size: 0.95rem; }

    /* Students View */
    .section-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
    .student-stats-row { display: flex; gap: 1rem; }
    .mini-stat { text-align: center; padding: 0.75rem 1.5rem; border-radius: 10px; background: white; border: 1px solid #e2e8f0; min-width: 100px; }
    .mini-stat.total { border-top: 3px solid #6366f1; }
    .mini-stat.submitted { border-top: 3px solid #10b981; }
    .mini-stat.not-submitted { border-top: 3px solid #f59e0b; }
    .ms-num { display: block; font-size: 1.8rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .ms-lbl { font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }

    .stu-filter-tabs { display: flex; background: #e2e8f0; padding: 4px; border-radius: 10px; }
    .stu-filter-tabs button { background: transparent; border: none; color: #64748b; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85rem; transition: all 0.2s; }
    .stu-filter-tabs button.active { background: white; color: #4f46e5; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

    .students-table-wrap { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .students-table { width: 100%; border-collapse: collapse; }
    .students-table th { 
      background: #f8fafc; padding: 0.85rem 1rem; text-align: left; 
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
      color: #64748b; border-bottom: 2px solid #e2e8f0;
    }
    .students-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.9rem; color: #334155; }
    .students-table tr:last-child td { border-bottom: none; }
    .students-table tr:hover td { background: #fafafa; }
    .not-submitted-row td { background: #fffdf0; }
    .not-submitted-row:hover td { background: #fef9e7; }

    .student-cell { display: flex; align-items: center; gap: 0.75rem; }
    .student-name { font-weight: 600; color: #1e293b; }
    .student-email { font-size: 0.78rem; color: #64748b; }
    .roll-badge { background: #f1f5f9; color: #475569; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.82rem; }
    .subj-tag { background: rgba(16,185,129,0.15); color: #059669; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.82rem; font-weight: 500; }
    .group-badge { background: #ede9fe; color: #7c3aed; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.82rem; font-weight: 600; }
    .no-data { color: #94a3b8; font-style: italic; }
    .text-center { text-align: center; }

    .status-pill { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.3rem 0.75rem; border-radius: 99px; font-size: 0.78rem; font-weight: 600; }
    .status-pill.submitted { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .status-pill.not-sub { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }

    /* Student Projects Panel */
    .projects-detail-row td { padding: 0 !important; background: #f8fafc; }
    .projects-panel { padding: 1.5rem; border-left: 4px solid #4f46e5; margin: 10px 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .projects-panel h4 { margin: 0 0 1rem; font-size: 1rem; color: #1e293b; }
    .p-loading, .p-empty { color: #64748b; font-style: italic; font-size: 0.9rem; }
    .p-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .p-mini-card { border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 6px; position: relative; }
    .p-title { font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; color: #1e293b; }
    .p-meta { display: flex; flex-direction: column; gap: 2px; }
    .p-subj { font-size: 0.75rem; color: #6366f1; font-weight: 600; }
    .p-score { font-size: 0.75rem; color: #10b981; font-weight: 700; }
    .p-status { font-size: 0.75rem; color: #f59e0b; }
    .p-link { font-size: 0.75rem; color: #475569; text-decoration: none; border-bottom: 1px dashed #cbd5e1; display: inline-block; margin-top: 5px; }

    .stu-filter-row { display: flex; align-items: center; gap: 1rem; }
    .branch-select { padding: 0.5rem; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem; color: #475569; background: white; }

    /* Subjects View */
    .form-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #475569; font-size: 0.9rem; font-weight: 500; }
    .glass-input { width: 100%; padding: 0.6rem 1rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #1e293b; font-size: 0.95rem; }
    .btn-primary { background: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .subjects-list { display: flex; flex-direction: column; gap: 1rem; }
    .subject-card { display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .subj-info h4 { margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.1rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .tag.dept { background: #f1f5f9; color: #475569; }
    .tag.sem { background: #eff6ff; color: #1d4ed8; }
    .tag.branch { background: #ecfdf5; color: #059669; }
    .tag.domain { background: #ede9fe; color: #7c3aed; }
    .btn-icon.delete { background: #fef2f2; border: 1px solid #fecaca; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 1.1rem; }
    .btn-icon.delete:hover { background: #fee2e2; transform: scale(1.05); }

    /* Problem Statements */
    .problem-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .problem-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .problem-header { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .diff-chip { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px; text-transform: uppercase; width: fit-content; }
    .diff-chip[data-diff="Beginner"] { background: #ecfdf5; color: #059669; }
    .diff-chip[data-diff="Intermediate"] { background: #eff6ff; color: #1d4ed8; }
    .diff-chip[data-diff="Advanced"] { background: #fef2f2; color: #dc2626; }
    .problem-card h4 { margin: 0; font-size: 1.1rem; color: #1e293b; }
    .problem-desc { font-size: 0.9rem; color: #475569; line-height: 1.5; margin-bottom: 1rem; }
    .problem-meta { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .meta-item { font-size: 0.8rem; color: #64748b; font-weight: 500; }
    .problem-footer { border-top: 1px solid #f1f5f9; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #94a3b8; }
    .assigned-by strong { color: #6366f1; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }

    /* ── MOBILE (≤ 1024px) ──────────────────────────────────────── */
    @media (max-width: 1024px) {
      /* 4.5rem top = clears the sidebar hamburger button (≈60px) */
      .main-layout {
        margin-left: 0;
        padding: 4.5rem 1rem 2rem;
      }

      /* Header: stack title on top, tabs below — NO sticky/fixed */
      .dash-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
        background: transparent;
      }

      .dash-title h1 { font-size: 1.4rem; }
      .dash-title p { font-size: 0.82rem; }

      /* Tab bar: full-width scrollable on mobile */
      .view-toggles {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        border-radius: 10px;
        background: #ede9fe;
        border: 1.5px solid #c4b5fd;
        padding: 4px;
        gap: 3px;
      }
      .view-toggles::-webkit-scrollbar { display: none; }
      .view-toggles button {
        flex: 1;
        min-width: 80px;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 0.55rem 0.5rem;
      }
      .view-toggles .vt-icon { font-size: 1.25rem; }
      .view-toggles .vt-label { font-size: 0.7rem; display: block; }

      /* Stats grid: 3 cols on mobile */
      .stats-grid { 
        display: grid; 
        grid-template-columns: repeat(3, 1fr); 
        gap: 0.5rem; 
        margin-bottom: 1.25rem; 
      }
      .stat-card { padding: 0.6rem 0.4rem; display: flex; flex-direction: column; align-items: center; text-align: center; }
      .stat-card .value { font-size: 1.25rem; margin-bottom: 2px; }
      .stat-card .label { font-size: 0.6rem; text-transform: uppercase; white-space: nowrap; }
      .stat-icon { display: none; } /* Hide large icons on mobile stats to save space */

      /* Student stats: one row */
      .student-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; width: 100%; }
      .mini-stat { width: auto; min-width: 0; padding: 0.6rem 0.25rem; }
      .ms-num { font-size: 1.2rem; }
      .ms-lbl { font-size: 0.62rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      /* Filter row: keep tabs in one line */
      .section-header-row { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .stu-filter-row { flex-direction: column; align-items: flex-start; gap: 0.8rem; width: 100%; }
      .branch-select { width: 100%; }
      .stu-filter-tabs { 
        width: 100%; display: flex; overflow-x: auto; 
        scrollbar-width: none; -webkit-overflow-scrolling: touch; gap: 2px;
        background: #e2e8f0; padding: 4px; border-radius: 10px;
      }
      .stu-filter-tabs::-webkit-scrollbar { display: none; }
      .stu-filter-tabs button { 
        flex: 1; white-space: nowrap; padding: 0.6rem 0.5rem; 
        font-size: 0.72rem; min-width: fit-content;
      }

      /* Projects filter tabs: same fix */
      .controls-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .tabs { 
        width: 100%; display: flex; overflow-x: auto; 
        scrollbar-width: none; -webkit-overflow-scrolling: touch; gap: 4px;
        background: #e2e8f0; padding: 4px; border-radius: 10px;
      }
      .tabs::-webkit-scrollbar { display: none; }
      .tabs button { 
        flex: 1; white-space: nowrap; padding: 0.6rem 0.75rem; 
        font-size: 0.75rem; min-width: fit-content;
      }
      .search-wrapper { max-width: 100%; width: 100%; }

      /* Cards: 1 col */
      .grid-submissions { grid-template-columns: 1fr; }

      /* Table: horizontal scroll */
      .students-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
      .students-table { min-width: 600px; }

      /* Controls row: stack */
      .controls-row { flex-direction: column; align-items: flex-start; }
      .search-wrapper { max-width: 100%; width: 100%; }

      /* Form grid: 1 col */
      .form-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 480px) {
      .dash-title h1 { font-size: 1.25rem; }
      .dash-title p { font-size: 0.75rem; }
      .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
      .student-stats-row { grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
    }
  `]
})
export class FacultyDashboardComponent implements OnInit {
  submissions: any[] = [];
  filteredSubmissions: any[] = [];
  subjects: any[] = [];
  students: any[] = [];
  problemStatements: any[] = [];

  viewMode: 'projects' | 'students' | 'subjects' | 'real-world' = 'projects';
  filter: 'all' | 'pending' | 'graded' = 'all';
  searchTerm = '';
  isLoading = false;
  isLoadingStudents = false;
  isLoadingProblemStatements = false;
  studentFilter: 'all' | 'submitted' | 'pending' = 'all';
  studentBranchFilter: string = 'all';
  branchList = BRANCH_DATA;

  expandedStudentId: number | null = null;
  studentProjects: any[] = [];
  loadingStudentProjects = false;

  newSubject = { name: '', department: 'B.Tech', semester: '', branch: '', domain: '' };
  semesters = SEMESTERS;
  isAddingSubject = false;

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  get pendingCount() { return this.submissions.filter(s => !s.score).length; }
  get gradedCount() { return this.submissions.filter(s => s.score).length; }
  get facultyId() { return this.authService.currentUser()?.id; }
  get facultyName() { return this.authService.currentUser()?.name || 'Faculty'; }

  get submittedStudents() { return this.students.filter(s => s.hasSubmitted).length; }
  get notSubmittedStudents() { return this.students.filter(s => !s.hasSubmitted).length; }

  get filteredStudentList() {
    let list = this.students;

    // Status filter
    if (this.studentFilter === 'submitted') list = list.filter(s => s.hasSubmitted);
    else if (this.studentFilter === 'pending') list = list.filter(s => !s.hasSubmitted);

    // Branch filter
    if (this.studentBranchFilter !== 'all') {
      list = list.filter(s => s.branch === this.studentBranchFilter);
    }

    return list;
  }

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

  loadStudents() {
    if (!this.facultyId) return;
    this.isLoadingStudents = true;
    this.apiService.getFacultyStudents(this.facultyId).subscribe({
      next: (data) => { this.students = data; this.isLoadingStudents = false; },
      error: () => { this.isLoadingStudents = false; }
    });
  }

  loadSubjects() {
    if (this.facultyId) {
      this.apiService.getSubjects(undefined, undefined, this.facultyId).subscribe({
        next: (data) => { this.subjects = data; },
        error: (err) => console.error(err)
      });
    }
  }

  loadProblemStatements() {
    if (!this.facultyId) return;
    this.isLoadingProblemStatements = true;
    this.apiService.getProblemStatements(this.facultyId).subscribe({
      next: (data) => {
        this.problemStatements = data;
        this.isLoadingProblemStatements = false;
      },
      error: () => this.isLoadingProblemStatements = false
    });
  }

  toggleStudentExpand(student: any) {
    if (this.expandedStudentId === student.id) {
      this.expandedStudentId = null;
      this.studentProjects = [];
      return;
    }

    this.expandedStudentId = student.id;
    this.studentProjects = [];
    this.loadingStudentProjects = true;

    this.apiService.getProjects('student', student.id).subscribe({
      next: (projects) => {
        this.studentProjects = projects;
        this.loadingStudentProjects = false;
      },
      error: () => {
        this.loadingStudentProjects = false;
      }
    });
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
        this.newSubject = { name: '', department: 'B.Tech', semester: '', branch: '', domain: '' };
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
      next: () => { this.subjects = this.subjects.filter(s => s.id !== id); },
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

  formatSemester(sem: string): string {
    if (!sem || !sem.includes('-')) return sem;
    const [year] = sem.split('-');
    const yearLabels: { [key: string]: string } = {
      '1': '1st Year',
      '2': '2nd Year',
      '3': '3rd Year',
      '4': '4th Year'
    };
    return `${yearLabels[year] || year + 'th Year'} - ${sem}`;
  }

  setView(mode: 'projects' | 'students' | 'subjects' | 'real-world') {
    this.viewMode = mode;
    if (mode === 'students') this.loadStudents();
    if (mode === 'real-world') this.loadProblemStatements();
    this.scrollTop();
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDomainSelector(): boolean {
    return this.newSubject.branch === 'Computer Science (CSE)';
  }

  getDomainsForBranch(): string[] {
    const b = this.branchList.find(x => x.name === this.newSubject.branch);
    return b ? b.domains : [];
  }
}
