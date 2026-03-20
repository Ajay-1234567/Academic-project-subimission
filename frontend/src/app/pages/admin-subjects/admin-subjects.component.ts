import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-admin-subjects',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent],
    template: `
    <app-sidebar role="admin"></app-sidebar>
    <div class="main-layout fade-in">
      <header class="page-header">
        <div>
          <h1>Global Subject Management</h1>
          <p>View and manage all subjects across the platform</p>
        </div>
      </header>

      <div class="content-grid">
        <!-- Filter Bar -->
        <div class="glass-panel filter-card">
          <div class="filter-group">
            <label>Filter by Branch</label>
            <select [(ngModel)]="filterBranch" (change)="loadSubjects()" class="glass-input">
              <option value="">All Branches</option>
              <option value="Computer Science (CSE)">Computer Science (CSE)</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Search Subjects</label>
            <input [(ngModel)]="searchTerm" placeholder="Search by name..." class="glass-input">
          </div>
        </div>

        <!-- Subjects List -->
        <div class="glass-panel list-card">
          <div class="list-header">
            <h3>Subjects ({{ filteredSubjects.length }})</h3>
          </div>

          <div *ngIf="isLoading" class="loading">Loading subjects...</div>

          <div class="table-container" *ngIf="!isLoading">
            <table class="w-full">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Faculty</th>
                  <th>Semester</th>
                  <th>Branch / Domain</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredSubjects">
                  <td>
                    <div class="subj-name-cell">
                      <div class="subj-icon">📚</div>
                      {{ s.name }}
                    </div>
                  </td>
                  <td>
                    <div class="faculty-cell">
                      {{ s.facultyName || 'Unknown' }}
                    </div>
                  </td>
                  <td>{{ s.semester }}</td>
                  <td>
                    <div class="tag-box">
                      <span class="badge b-blue" *ngIf="s.branch">{{ s.branch }}</span>
                      <span class="badge b-purple" *ngIf="s.domain">{{ s.domain }}</span>
                    </div>
                  </td>
                  <td>
                    <button (click)="deleteSubject(s.id)" class="btn-icon delete" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div *ngIf="filteredSubjects.length === 0" class="empty-state">
              No subjects found matching your criteria.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .main-layout { margin-left: 250px; padding: 2.5rem; background: #f8fafc; min-height: 100vh; }
    .page-header { margin-bottom: 2rem; }
    h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
    p { color: #64748b; margin-top: 0.5rem; }

    .content-grid { display: flex; flex-direction: column; gap: 2rem; }
    .glass-panel { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

    .filter-card { display: flex; gap: 2rem; flex-wrap: wrap; }
    .filter-group { flex: 1; min-width: 200px; }
    .filter-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }

    .glass-input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; }
    
    .list-header { margin-bottom: 1.5rem; }
    .list-header h3 { margin: 0; font-size: 1.25rem; color: #1e293b; }

    .table-container { overflow-x: auto; }
    .w-full { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem; border-bottom: 2px solid #f1f5f9; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; }
    td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; color: #334155; }

    .subj-name-cell { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; }
    .subj-icon { width: 32px; height: 32px; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }

    .tag-box { display: flex; flex-direction: column; gap: 4px; }
    .badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; width: fit-content; }
    .b-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
    .b-purple { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); }

    .btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; padding: 0.5rem; border-radius: 6px; }
    .btn-icon:hover { transform: scale(1.1); background: #fee2e2; }
    .delete { color: #ef4444; }

    .loading, .empty-state { text-align: center; padding: 3rem; color: #64748b; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }
  `]
})
export class AdminSubjectsComponent implements OnInit {
    private apiService = inject(ApiService);

    subjects: any[] = [];
    isLoading = false;
    filterBranch = '';
    searchTerm = '';

    ngOnInit() {
        this.loadSubjects();
    }

    loadSubjects() {
        this.isLoading = true;
        this.apiService.getSubjects().subscribe({
            next: (data) => {
                this.subjects = data;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    get filteredSubjects() {
        return this.subjects.filter(s => {
            const matchesBranch = !this.filterBranch || s.branch === this.filterBranch;
            const matchesSearch = !this.searchTerm || s.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesBranch && matchesSearch;
        });
    }

    deleteSubject(id: number) {
        if (!confirm('Are you sure you want to delete this subject? faculty will lose this subject data.')) return;
        this.apiService.deleteSubject(id).subscribe({
            next: () => {
                this.subjects = this.subjects.filter(s => s.id !== id);
            },
            error: (err) => {
                alert('Failed to delete subject.');
            }
        });
    }
}
