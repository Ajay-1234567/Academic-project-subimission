import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-faculty-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  template: `
    <app-sidebar role="admin"></app-sidebar>
    <div class="main-layout fade-in">

      <header class="page-header">
        <div>
          <h1>Faculty–Student Overview</h1>
          <p>See all students under each faculty, their submission status, and manage from here</p>
        </div>
        <div class="header-actions">
          <div class="admin-search-wrap">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="facultySearch" placeholder="Search faculty by name..." class="admin-search-input">
          </div>
          <a routerLink="/admin" class="back-btn">← Back to Dashboard</a>
        </div>
      </header>


      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading faculty data...</span>
      </div>

      <!-- No Data -->
      <div *ngIf="!isLoading && facultyList.length === 0" class="empty-state">
        <div class="empty-icon">👨‍🏫</div>
        <h3>No faculty found</h3>
        <p>Add faculty members via <a routerLink="/admin/faculty">Manage Faculty</a>.</p>
      </div>

      <!-- Faculty Sections -->
      <ng-container *ngIf="!isLoading">
        <div *ngFor="let f of filteredFacultyList" class="faculty-section">

          <!-- Faculty Header -->
          <div class="faculty-header">
            <div class="faculty-avatar">{{ f.name.charAt(0).toUpperCase() }}</div>
            <div class="faculty-info">
              <h2>{{ f.name }}</h2>
              <span class="faculty-email">{{ f.email }}</span>
            </div>
            <div class="faculty-badges">
              <span class="badge total">{{ f.totalStudents }} Students</span>
              <span class="badge submitted">{{ f.submittedCount }} Submitted ✅</span>
              <span class="badge pending">{{ f.notSubmittedCount }} Pending ⏳</span>
            </div>
            <div class="faculty-actions">
              <a [routerLink]="['/admin/students']" class="fac-btn outline">Manage Students</a>
              <a [routerLink]="['/admin/faculty']" class="fac-btn outline">Manage Faculty</a>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-row" *ngIf="f.totalStudents > 0">
            <span class="progress-label">Submission Progress</span>
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="(f.submittedCount / f.totalStudents * 100) + '%'"></div>
            </div>
            <span class="progress-pct">{{ (f.submittedCount / f.totalStudents * 100) | number:'1.0-0' }}%</span>
          </div>

          <!-- Table Filter Tabs -->
          <div *ngIf="f.students && f.students.length > 0" class="students-table-wrap">
            <div class="table-filter-row">
              <button [class.act]="getFilter(f.id) === 'all'" (click)="setFilter(f.id, 'all')">All ({{ f.students.length }})</button>
              <button [class.act]="getFilter(f.id) === 'submitted'" (click)="setFilter(f.id, 'submitted')">
                ✅ Submitted ({{ f.submittedCount }})
              </button>
              <button [class.act]="getFilter(f.id) === 'pending'" (click)="setFilter(f.id, 'pending')">
                ⏳ Not Submitted ({{ f.notSubmittedCount }})
              </button>
            </div>

            <table class="students-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Subjects</th>
                  <th>Submissions</th>
                  <th>Graded</th>
                  <th>Group</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let s of getFilteredStudents(f); let i = index">
                  <!-- Student Row -->
                  <tr [class.submitted-row]="s.hasSubmitted"
                      [class.pending-row]="!s.hasSubmitted"
                      [class.expanded-row]="isExpanded(s.id, f.id)"
                      (click)="toggleStudentExpand(s, f)">
                    <td class="row-num">{{ i + 1 }}</td>
                    <td>
                      <div class="student-cell">
                        <div class="student-avatar">{{ s.name.charAt(0).toUpperCase() }}</div>
                        <div>
                          <div class="student-name">{{ s.name }}</div>
                          <div class="email-cell">{{ s.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="roll-badge">{{ s.rollNumber || '—' }}</span></td>
                    <td>{{ s.department || '—' }}</td>
                    <td>{{ s.academicYear || '—' }}</td>
                    <td>
                      <span class="subj-tag" *ngIf="s.subject">{{ s.subject }}</span>
                      <span *ngIf="!s.subject" class="no-data">—</span>
                    </td>
                    <td class="count-cell">
                      <span class="count-badge" [class.has-count]="s.totalSubmissions > 0">{{ s.totalSubmissions }}</span>
                    </td>
                    <td class="count-cell">
                      <span class="count-badge graded-count" [class.has-count]="s.gradedCount > 0">{{ s.gradedCount }}</span>
                    </td>
                    <td>
                      <span class="group-pill" *ngIf="s.groups && s.groups.length > 0">
                        {{ s.groups[0].groupNumber }}
                      </span>
                      <span *ngIf="!s.groups || s.groups.length === 0" class="no-data">—</span>
                    </td>
                    <td>
                      <span class="status-pill sub" *ngIf="s.hasSubmitted">✅ Submitted</span>
                      <span class="status-pill pend" *ngIf="!s.hasSubmitted">⏳ Pending</span>
                    </td>
                    <td (click)="$event.stopPropagation()">
                      <div class="action-btns">
                        <button class="action-btn view-btn"
                                (click)="toggleStudentExpand(s, f)"
                                [title]="isExpanded(s.id, f.id) ? 'Collapse' : 'View Projects'">
                          {{ isExpanded(s.id, f.id) ? '▲ Hide' : '📂 Projects' }}
                        </button>
                        <button class="action-btn send-btn"
                                *ngIf="!s.hasSubmitted"
                                title="Student has not submitted yet"
                                disabled>
                          ⏳ Remind
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Expanded: Show Student Projects filtered by this faculty's subject -->
                  <tr *ngIf="isExpanded(s.id, f.id)" class="project-expand-row">
                    <td colspan="10">
                      <div class="project-expand-panel">
                        <!-- Loading projects -->
                        <div *ngIf="loadingProjects" class="proj-loading">Loading projects...</div>

                        <!-- No projects -->
                        <div *ngIf="!loadingProjects && studentProjects.length === 0" class="no-projects">
                          <span>📭 {{ s.name }} has not submitted any projects yet.</span>
                        </div>

                        <!-- Projects list -->
                        <div *ngIf="!loadingProjects && studentProjects.length > 0">
                          <div class="expand-header">
                            <div class="expand-title-row">
                              <span class="expand-title">Projects assigned under <strong>{{ f.name }}</strong> by {{ s.name }}</span>
                              <span class="expand-subj-scope" *ngIf="s.subject">
                                📚 Assigned subject under {{ f.name }}: <span class="scope-badge">{{ s.subject }}</span>
                              </span>
                            </div>
                            <span class="proj-count-badge">{{ studentProjects.length }} project(s)</span>
                          </div>
                          <div class="projects-grid">
                            <div *ngFor="let p of studentProjects" class="project-mini-card" [class.graded-card]="p.score">
                              <div class="pmc-top">
                                <div class="pmc-status-dot" [class.graded]="p.score" [class.pending]="!p.score"></div>
                                <div class="pmc-title">{{ p.title }}</div>
                                <div class="pmc-id">#{{ p.id }}</div>
                              </div>
                              <div class="pmc-meta">
                                <span class="pmc-tag sem" *ngIf="p.semester">📅 {{ p.semester }}</span>
                                <span class="pmc-tag subj" *ngIf="p.subject">📚 {{ p.subject }}</span>
                                <span class="pmc-tag type" *ngIf="p.projectType === 'group'">👥 Group</span>
                              </div>
                              <div class="pmc-footer">
                                <div class="pmc-score" *ngIf="p.score">
                                  <span class="score-label">Score</span>
                                  <span class="score-value">{{ p.score }}/100</span>
                                </div>
                                <div class="pmc-status-text" *ngIf="!p.score">
                                  <span class="pending-text">⏳ Awaiting Evaluation</span>
                                </div>
                                <a [routerLink]="['/projects', p.id]" class="view-proj-btn">
                                  🔗 View Project
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </ng-container>

                <tr *ngIf="getFilteredStudents(f).length === 0">
                  <td colspan="10" class="no-results">No students match the current filter.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="!f.students || f.students.length === 0" class="no-students-msg">
            <span>No students assigned to this faculty yet. <a routerLink="/admin/students" class="add-link">Add Students →</a></span>
          </div>
        </div>
      </ng-container>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

    .main-layout { margin-left: 250px; padding: 2.5rem; background: #f8fafc; min-height: 100vh; }
     }

    /* Header */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
    h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.3rem; }
    p { color: #64748b; font-size: 1rem; margin: 0; }
    .back-btn { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 1.2rem; color: #475569; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; white-space: nowrap; }
    .back-btn:hover { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; }

    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .admin-search-wrap { position: relative; min-width: 250px; }
    .admin-search-wrap .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.9rem; }
    .admin-search-input { width: 100%; padding: 0.5rem 1rem 0.5rem 2.2rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-size: 0.9rem; }
    .admin-search-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

    /* Loading / Empty */
    .loading-state { display: flex; align-items: center; gap: 1rem; color: #64748b; padding: 3rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b; }
    .empty-state a { color: #6366f1; font-weight: 600; }
    .empty-icon { font-size: 3rem; margin-bottom: 0.75rem; opacity: 0.5; }

    /* Faculty Section Card */
    .faculty-section { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

    /* Faculty Header */
    .faculty-header { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem 2rem; background: linear-gradient(135deg, #f8fafc, #eff6ff); border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
    .faculty-avatar { width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.3rem; flex-shrink: 0; }
    .faculty-info { flex: 1; min-width: 150px; }
    .faculty-info h2 { margin: 0 0 0.2rem; font-size: 1.2rem; font-weight: 700; color: #1e293b; }
    .faculty-email { font-size: 0.82rem; color: #64748b; }
    .faculty-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge { font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 99px; }
    .badge.total { background: #ede9fe; color: #7c3aed; }
    .badge.submitted { background: #ecfdf5; color: #059669; }
    .badge.pending { background: #fffbeb; color: #d97706; }
    .faculty-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .fac-btn { font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 8px; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.25rem; }
    .fac-btn.outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
    .fac-btn.outline:hover { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; }

    /* Progress */
    .progress-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 2rem; border-bottom: 1px solid #f1f5f9; }
    .progress-label { font-size: 0.78rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .progress-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #10b981); border-radius: 99px; transition: width 0.7s ease; }
    .progress-pct { font-size: 0.85rem; font-weight: 700; color: #1e293b; min-width: 40px; text-align: right; }

    /* Table Filter Tabs */
    .table-filter-row { display: flex; gap: 0.5rem; padding: 1rem 2rem 0; flex-wrap: wrap; }
    .table-filter-row button { background: #f1f5f9; border: none; border-radius: 6px; padding: 0.4rem 1rem; font-size: 0.82rem; font-weight: 500; color: #475569; cursor: pointer; transition: all 0.2s; }
    .table-filter-row button.act { background: #6366f1; color: white; box-shadow: 0 2px 4px rgba(99,102,241,0.3); }
    .table-filter-row button:hover:not(.act) { background: #e2e8f0; color: #1e293b; }

    /* Table */
    .students-table-wrap { overflow-x: auto; }
    .students-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .students-table th { padding: 0.85rem 1rem; text-align: left; font-size: 0.73rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; background: #f8fafc; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
    .students-table td { padding: 0.9rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #334155; }
    .students-table tr:last-child td { border-bottom: none; }
    .students-table tbody tr:hover td { background: #f0f4ff; cursor: pointer; }
    .submitted-row td { }
    .pending-row td { background: #fffdf5; }
    .pending-row:hover td { background: #fef9e7 !important; }
    .expanded-row td { background: #f0f4ff !important; border-bottom: none; }
    .row-num { color: #94a3b8; font-size: 0.78rem; font-family: monospace; width: 30px; }

    .student-cell { display: flex; align-items: center; gap: 0.6rem; }
    .student-avatar { width: 34px; height: 34px; border-radius: 9px; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .student-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
    .email-cell { color: #64748b; font-size: 0.78rem; }
    .roll-badge { background: #f1f5f9; color: #475569; padding: 0.15rem 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.8rem; border: 1px solid #e2e8f0; }
    .subj-tag { background: rgba(16,185,129,0.12); color: #059669; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.78rem; font-weight: 500; }
    .no-data { color: #94a3b8; }
    .count-cell { text-align: center; }
    .count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 26px; border-radius: 6px; font-size: 0.88rem; font-weight: 700; color: #94a3b8; background: #f1f5f9; }
    .count-badge.has-count { color: #1e293b; background: #ede9fe; }
    .count-badge.graded-count.has-count { color: #059669; background: #ecfdf5; }

    .status-pill { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.3rem 0.75rem; border-radius: 99px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
    .graded-count { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .group-pill {
      background: #ede9fe; color: #7c3aed; padding: 0.2rem 0.5rem;
      border-radius: 4px; font-size: 0.78rem; font-weight: 700;
      white-space: nowrap; border: 1px solid #ddd6fe;
    }
    .status-pill.sub { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .status-pill.pend { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }

    /* Action Buttons */
    .action-btns { display: flex; gap: 0.4rem; }
    .action-btn { font-size: 0.78rem; font-weight: 600; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; border: none; transition: all 0.2s; white-space: nowrap; }
    .action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .view-btn { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }
    .view-btn:hover { background: #dbeafe; color: #1d4ed8; }
    .send-btn { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }

    /* Project Expand Panel */
    .project-expand-row td { padding: 0; border-bottom: 1px solid #e2e8f0; background: #f5f8ff; }
    .project-expand-panel { padding: 1.5rem 2rem; border-top: 2px solid #6366f1; }
    .expand-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; }
    .expand-title-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .expand-title { font-size: 0.9rem; color: #475569; }
    .expand-title strong { color: #1e293b; }
    .expand-subj-scope { font-size: 0.82rem; color: #64748b; display: flex; align-items: center; gap: 0.35rem; }
    .scope-badge { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
    .proj-count-badge { background: #6366f1; color: white; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 99px; white-space: nowrap; flex-shrink: 0; }

    .proj-loading { color: #64748b; font-style: italic; font-size: 0.9rem; }
    .no-projects { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 1rem 1.5rem; color: #92400e; font-size: 0.88rem; display: flex; align-items: center; gap: 0.5rem; }

    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .project-mini-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; transition: all 0.2s; }
    .project-mini-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
    .project-mini-card.graded-card { border-top: 3px solid #10b981; }
    .pmc-top { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem; }
    .pmc-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
    .pmc-status-dot.graded { background: #10b981; }
    .pmc-status-dot.pending { background: #f59e0b; }
    .pmc-title { flex: 1; font-weight: 700; color: #1e293b; font-size: 0.92rem; line-height: 1.4; }
    .pmc-id { font-size: 0.75rem; color: #94a3b8; font-family: monospace; flex-shrink: 0; }
    .pmc-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
    .pmc-tag { font-size: 0.75rem; font-weight: 500; padding: 0.15rem 0.5rem; border-radius: 4px; }
    .pmc-tag.sem { background: #f1f5f9; color: #475569; }
    .pmc-tag.subj { background: #e0f2fe; color: #0284c7; }
    .pmc-tag.type { background: #ede9fe; color: #7c3aed; }
    .pmc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; }
    .pmc-score { display: flex; flex-direction: column; }
    .score-label { font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
    .score-value { font-size: 1.2rem; font-weight: 800; color: #059669; }
    .pending-text { font-size: 0.78rem; color: #d97706; }
    .view-proj-btn { background: #6366f1; color: white; text-decoration: none; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.85rem; border-radius: 6px; transition: background 0.2s; white-space: nowrap; }
    .view-proj-btn:hover { background: #4f46e5; }

    .no-results { text-align: center; color: #94a3b8; padding: 2.5rem; font-style: italic; }
    .no-students-msg { padding: 1.5rem 2rem; color: #94a3b8; font-size: 0.9rem; }
    .add-link { color: #6366f1; font-weight: 600; text-decoration: none; }
    .add-link:hover { text-decoration: underline; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }
  `]
})
export class AdminFacultyOverviewComponent implements OnInit {
  facultyList: any[] = [];
  isLoading = false;
  facultySearch = '';
  filterMap: { [facultyId: number]: 'all' | 'submitted' | 'pending' } = {};

  // Expanded student tracking — composite key: "facultyId_studentId"
  expandedKey: string | null = null;
  studentProjects: any[] = [];
  loadingProjects = false;

  private apiService = inject(ApiService);
  private router = inject(Router);

  ngOnInit() {
    this.isLoading = true;
    this.apiService.getAdminFacultyStudents().subscribe({
      next: (data) => {
        this.facultyList = data;
        data.forEach((f: any) => { this.filterMap[f.id] = 'all'; });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  getFilter(facultyId: number): string {
    return this.filterMap[facultyId] || 'all';
  }

  setFilter(facultyId: number, filter: 'all' | 'submitted' | 'pending') {
    this.filterMap[facultyId] = filter;
    // Collapse any open row for this faculty when filter changes
    this.expandedKey = null;
    this.studentProjects = [];
  }

  getFilteredStudents(f: any): any[] {
    const filter = this.filterMap[f.id] || 'all';
    if (filter === 'submitted') return f.students.filter((s: any) => s.hasSubmitted);
    if (filter === 'pending') return f.students.filter((s: any) => !s.hasSubmitted);
    return f.students;
  }

  // Returns true only for the specific faculty+student combination
  isExpanded(studentId: number, facultyId: number): boolean {
    return this.expandedKey === `${facultyId}_${studentId}`;
  }

  toggleStudentExpand(student: any, faculty: any) {
    const key = `${faculty.id}_${student.id}`;

    if (this.expandedKey === key) {
      // Collapse
      this.expandedKey = null;
      this.studentProjects = [];
      return;
    }

    // Expand — load ALL projects for this student
    this.expandedKey = key;
    this.studentProjects = [];
    this.loadingProjects = true;

    this.apiService.getProjects('student', student.id).subscribe({
      next: (projects: any[]) => {
        // Scope the projects to only those matching this faculty's assigned subjects for this student
        const facultySubjects = (student.subject || '').split(',').map((s: string) => s.trim().toLowerCase());

        this.studentProjects = projects.filter(p =>
          p.subject && facultySubjects.includes(p.subject.toLowerCase())
        );
        this.loadingProjects = false;
      },
      error: () => {
        this.studentProjects = [];
        this.loadingProjects = false;
      }
    });
  }

  get filteredFacultyList() {
    if (!this.facultySearch.trim()) return this.facultyList;
    const q = this.facultySearch.toLowerCase();
    return this.facultyList.filter(f => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q));
  }
}
