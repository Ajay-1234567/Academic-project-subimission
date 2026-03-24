import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';

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
const GRAD_YEARS = ['2023', '2024', '2025', '2026', '2027', '2028', '2029'];

@Component({
  selector: 'app-section-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <app-sidebar role="admin"></app-sidebar>
    <div class="main-layout fade-in">
      <header class="page-header">
        <div>
          <h1>Sections & Branches</h1>
          <p>Configure sections and assign branches to them</p>
        </div>
      </header>

      <div class="grid-container">
        <div class="sidebar-forms">
          <!-- Configuration Form -->
          <div class="glass-card form-section">
            <h3>{{ editingId ? 'Update Section' : 'Create New Section' }}</h3>
            
            <div class="form-group">
              <label>Department</label>
              <select [(ngModel)]="form.department" class="glass-input" disabled>
                <option value="B.Tech">B.Tech</option>
              </select>
            </div>

            <div class="form-group">
              <label>Graduation Year</label>
              <select [(ngModel)]="form.graduationYear" class="glass-input">
                <option value="">Select Year</option>
                <option *ngFor="let y of gradYears" [value]="y">{{ y }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Section Name</label>
              <input [(ngModel)]="form.name" class="glass-input" placeholder="e.g. Section A">
            </div>

            <div class="form-group" *ngIf="showDomainSelector()">
              <label>Domain / Specialization (for CSE)</label>
              <select [(ngModel)]="form.domain" class="glass-input">
                <option value="">None / General</option>
                <option *ngFor="let d of getDomainsForCSE()" [value]="d">{{ d }}</option>
              </select>
            </div>

            <!-- Subjects for Selected Domain (Mini List) -->
            <div class="form-group" *ngIf="form.domain || showDomainSelector()">
              <label>Regulated Subjects for {{ form.domain || 'General' }}</label>
              <div class="mini-subjects-list">
                <div *ngFor="let s of getFormSubjects()" class="subj-mini-item">
                  <span class="dot"></span>
                  <div class="subj-item-details">
                    <span class="name">{{ s.name }}</span>
                    <span class="item-domain">{{ s.domain || 'General' }}</span>
                  </div>
                  <span class="sem">{{ s.semester }}</span>
                  <button (click)="removeSubject(s.id)" class="mini-delete-btn" title="Remove from catalog">🗑️</button>
                </div>
                <div *ngIf="getFormSubjects().length === 0" class="empty-mini">
                  No subjects found for this domain.
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Assign Branches to this Section</label>
              <div class="branch-grid">
                <div *ngFor="let b of branchData" class="checkbox-item">
                  <input type="checkbox" [id]="'b-' + b.name" [checked]="isBranchSelected(b.name)" (change)="toggleBranch(b.name)">
                  <label [for]="'b-' + b.name">{{ b.name }}</label>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button (click)="saveSection()" class="btn-primary" [disabled]="!form.name || !form.graduationYear">
                {{ editingId ? 'Update Section' : 'Create Section' }}
              </button>
              <button *ngIf="editingId" (click)="resetForm()" class="btn-outline">Cancel</button>
            </div>
          </div>

          <!-- NEW: Define Global Subjects Card -->
          <div class="glass-card mt-4 manage-subjects-card">
            <h3>Define Global Subject</h3>
            <div class="form-group">
              <label>Subject Name</label>
              <input [(ngModel)]="subjectForm.name" class="glass-input" placeholder="e.g. Flutter Development">
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select [(ngModel)]="subjectForm.semester" class="glass-input">
                <option value="">Select Sem</option>
                <option *ngFor="let s of semesters" [value]="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Domain</label>
              <select [(ngModel)]="subjectForm.domain" class="glass-input">
                <option value="">General</option>
                <option *ngFor="let d of getDomainsForCSE()" [value]="d">{{ d }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Assign Faculty</label>
              <select [(ngModel)]="subjectForm.facultyId" class="glass-input">
                <option [ngValue]="null">Optional</option>
                <option *ngFor="let f of facultyList" [value]="f.id">{{ f.name }}</option>
              </select>
            </div>
            <div class="form-group info-block">
              <label>Target Group</label>
              <div class="info-tag">Branch: Computer Science (CSE)</div>
              <div class="info-tag">Dept: B.Tech</div>
            </div>

            <button (click)="addGlobalSubject()" class="btn-save-mini" [disabled]="!subjectForm.name || !subjectForm.semester">
              Save to Catalog
            </button>
          </div>
        </div>

        <!-- Sections List -->
        <div class="list-section">
          <div class="filter-row">
            <select [(ngModel)]="filterYear" (change)="loadSections()" class="filter-select">
              <option value="">All Graduation Years</option>
              <option *ngFor="let y of gradYears" [value]="y">{{ y }}</option>
            </select>
          </div>

          <div class="sections-grid">
            <div *ngFor="let s of sections" class="section-card">
              <div class="card-header">
                <span class="year-badge">{{ s.graduationYear }}</span>
                <h3>{{ s.name }}</h3>
              </div>
              
            <div class="domain-info">
              <span class="domain-badge" [class.general-badge]="!s.domain || s.domain === 'None / General'">
                Domain: {{ s.domain || 'General' }}
              </span>
            </div>

              <!-- Subjects under this section's domain -->
              <div class="card-subjects" *ngIf="s.domain">
                <label>Curriculum Subjects:</label>
                <div class="mini-subj-list">
                  <span *ngFor="let sub of getSubjectsForDomain(s.domain)" class="subj-pill">
                    {{ sub.name }} <small>({{ sub.semester }})</small>
                  </span>
                  <span *ngIf="getSubjectsForDomain(s.domain).length === 0" class="no-subj">No subjects defined</span>
                </div>
              </div>

              <div class="branches-tag-cloud">
                <span *ngFor="let b of splitBranches(s.branches)" class="branch-tag">{{ b }}</span>
                <span *ngIf="!s.branches" class="no-branches">No branches assigned</span>
              </div>

              <div class="card-footer">
                <button (click)="editSection(s)" class="btn-sm">Edit</button>
                <button (click)="deleteSection(s.id)" class="btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>

          <div *ngIf="sections.length === 0" class="empty-state">
            <div class="empty-icon">📂</div>
            <p>No sections found for this year.</p>
          </div>
        </div>
      </div>

      <!-- MASTER CATALOG VIEW -->
      <div class="glass-card mt-8 master-catalog">
        <div class="catalog-header">
          <div>
            <h3>Master Subject Catalog</h3>
            <p>Full list of all educational units you have added to the system</p>
          </div>
          <div class="catalog-search">
            <input [(ngModel)]="catalogSearch" class="glass-input small" placeholder="🔍 Search subjects...">
            <button (click)="clearAllSubjects()" class="btn-wipe-all" title="Wipe Entire Catalog">Clear All</button>
          </div>
        </div>

        <div class="catalog-table-wrapper">
          <table class="catalog-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Semester</th>
                <th>Domain / Specialization</th>
                <th>Assigned Faculty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let subj of filteredCatalog">
                <td class="bold-cell">{{ subj.name }}</td>
                <td>{{ subj.semester }}</td>
                <td>
                  <span class="category-pill" [class.general]="!subj.domain || subj.domain === 'General' || subj.domain === 'None / General'">
                    {{ subj.domain || 'General' }}
                  </span>
                </td>
                <td>{{ subj.facultyName || 'Unassigned' }}</td>
                <td>
                  <button (click)="removeSubject(subj.id)" class="mini-delete" title="Delete Permanent">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="filteredCatalog.length === 0">
                <td colspan="5" class="empty-catalog">No subjects found matching your search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; background: #f8fafc; min-height: 100vh; }
    @media (max-width: 1024px) { .main-layout { margin-left: 0; padding: 5rem 1.25rem 2rem; } }
    .page-header { margin-bottom: 2rem; }
    h1 { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
    p { color: #64748b; margin-top: 0.5rem; }

    .grid-container { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 1024px) { .grid-container { display: flex; flex-direction: column; } }
    
    .glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .form-section h3 { margin-top: 0; margin-bottom: 1.5rem; color: #1e293b; }
    
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
    
    .glass-input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; background: #fff; }
    .glass-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

    .branch-grid { display: grid; grid-template-columns: 1fr; gap: 0.5rem; max-height: 150px; overflow-y: auto; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }
    .checkbox-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #334155; }
    
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    .btn-primary { flex: 1; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-outline { padding: 0.75rem; background: transparent; border: 1px solid #cbd5e1; color: #64748b; border-radius: 8px; cursor: pointer; }
    
    .filter-row { margin-bottom: 1.5rem; }
    .filter-select { padding: 0.6rem 1rem; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #1e293b; }

    .sections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .section-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .year-badge { font-size: 0.75rem; font-weight: 700; background: #ede9fe; color: #6366f1; padding: 0.2rem 0.6rem; border-radius: 4px; }
    .section-card h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
    
    .domain-info { margin-bottom: 0.5rem; }
    .domain-badge { font-size: 0.75rem; color: #0891b2; background: #ecfeff; padding: 0.1rem 0.5rem; border-radius: 4px; font-weight: 600; border: 1px solid #cffafe; }

    .branches-tag-cloud { flex: 1; display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem; }
    .branch-tag { font-size: 0.75rem; background: #f1f5f9; color: #475569; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #e2e8f0; }
    .no-branches { font-size: 0.8rem; color: #94a3b8; font-style: italic; }

    .card-footer { display: flex; gap: 0.5rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
    .btn-sm { font-size: 0.8rem; padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 500; }
    .btn-sm.btn-danger { color: #ef4444; border-color: #fecaca; }
    .btn-sm.btn-danger:hover { background: #fef2f2; }

    .empty-state { text-align: center; padding: 3rem; color: #94a3b8; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; }

    /* Mini subject list styles */
    .mini-subjects-list { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; max-height: 150px; overflow-y: auto; }
    .subj-mini-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; font-size: 0.82rem; color: #475569; }
    .subj-mini-item .dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; }
    .subj-mini-item .sem { margin-left: auto; font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
    .empty-mini { font-size: 0.75rem; color: #94a3b8; font-style: italic; text-align: center; padding: 0.5rem; }
    .mini-delete-btn { background: none; border: none; font-size: 0.9rem; cursor: pointer; padding: 2px 6px; border-radius: 4px; margin-left: 0.5rem; opacity: 0; transition: opacity 0.2s; }
    .subj-mini-item:hover .mini-delete-btn { opacity: 1; color: #ef4444; }

    /* Add Subject Form Styles */
    .mt-4 { margin-top: 1.5rem; }
    .btn-save-mini {
      width: 100%; padding: 0.5rem; background: #6366f1; color: white; border: none; border-radius: 6px;
      font-weight: 600; font-size: 0.88rem; cursor: pointer; height: 38px; margin-top: 1rem;
    }
    .btn-save-mini:hover { background: #4f46e5; }
    .btn-save-mini:disabled { opacity: 0.5; cursor: not-allowed; }
    .manage-subjects-card h3 { color: #1e293b; margin-top: 0; margin-bottom: 1rem; }

    .card-subjects { margin: 1rem 0; border-top: 1px solid #f1f5f9; padding-top: 0.75rem; }
    .card-subjects label { display: block; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.05em; }
    .mini-subj-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .subj-pill { font-size: 0.75rem; background: #fdf2f8; color: #db2777; border: 1px solid #fbcfe8; padding: 0.15rem 0.5rem; border-radius: 99px; font-weight: 500; }
    .subj-pill small { color: #be185d; }
    .no-subj { font-size: 0.75rem; color: #94a3b8; font-style: italic; }
    .sidebar-forms { display: flex; flex-direction: column; gap: 1rem; }

    /* Full Catalog Styles */
    .mt-8 { margin-top: 2rem; }
    .catalog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
    .catalog-header h3 { margin: 0; color: #1e293b; }
    .catalog-header p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #64748b; }
    .catalog-search { width: 300px; display: flex; align-items: center; gap: 0.5rem; }
    
    .catalog-table-wrapper { overflow-x: auto; }
    .catalog-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
    .catalog-table th { padding: 1rem; background: transparent; border-bottom: 2px solid #e2e8f0; font-weight: 700; color: #475569; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .catalog-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #475569; vertical-align: middle; }
    .bold-cell { font-weight: 600; color: #1e293b; }
    
    .category-pill { font-size: 0.7rem; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
    .category-pill.general { background: #f1f5f9; color: #64748b; }
    
    .general-badge { background: #f1f5f9 !important; color: #64748b !important; border-color: #e2e8f0 !important; }
    
    .mini-delete { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.4rem; border-radius: 6px; transition: all 0.2s; font-size: 1.1rem; }
    .mini-delete:hover { color: #ef4444; background: #fee2e2; }
    
    .empty-catalog { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }
    
    .btn-wipe-all { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
    .btn-wipe-all:hover { background: #ef4444; color: white; }

    @media (max-width: 768px) {
      .catalog-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .catalog-search { width: 100%; }
      .catalog-search input { flex: 1; min-width: 0; width: 0; }
      .master-catalog { overflow: hidden; padding: 1.75rem 1.5rem 2rem; }
      .glass-card { padding: 1.5rem; }
      h1 { font-size: 1.5rem; }
      .filter-select { width: 100%; }
      .sections-grid { grid-template-columns: 1fr; }
      .catalog-table th, .catalog-table td { padding: 0.75rem 0.6rem; font-size: 0.8rem; }
    }
  `]
})
export class SectionManagementComponent implements OnInit {
  branchData = BRANCH_DATA;
  gradYears = GRAD_YEARS;

  sections: any[] = [];
  subjects: any[] = [];
  facultyList: any[] = [];
  filterYear = '';
  catalogSearch = '';

  subjectForm = { name: '', department: 'B.Tech', semester: '', branch: 'Computer Science (CSE)', domain: '', facultyId: null as number | null };
  semesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

  form = { id: undefined, name: '', graduationYear: '', department: 'B.Tech', domain: '', selectedBranches: [] as string[] };
  editingId: number | null = null;

  private apiService = inject(ApiService);

  ngOnInit() {
    this.loadSections();
    this.loadAllSubjects();
    this.loadFaculty();
  }

  loadFaculty() {
    this.apiService.getUsers('faculty').subscribe({
      next: (data) => this.facultyList = data,
      error: () => { }
    });
  }

  addGlobalSubject() {
    const payload = {
      name: this.subjectForm.name,
      department: 'B.Tech',
      semester: this.subjectForm.semester,
      branch: 'Computer Science (CSE)',
      domain: this.subjectForm.domain || '',
      facultyId: this.subjectForm.facultyId
    };

    console.log('Sending Subject Payload:', payload);

    this.apiService.createSubject(payload).subscribe({
      next: (sub) => {
        alert('Subject saved to catalog!');
        const faculty = this.facultyList.find(f => f.id == payload.facultyId);
        const newSub = {
          ...sub,
          facultyName: faculty ? faculty.name : 'No Faculty',
          branch: payload.branch, // Ensure it is set in local array even if server returns null
          domain: payload.domain // Ensure it is set in local array even if server returns null
        };
        this.subjects.push(newSub);
        // Reset form but keep branch/dept
        this.subjectForm.name = '';
        this.subjectForm.semester = '';
        this.subjectForm.facultyId = null;
      },
      error: (err) => {
        console.error('Save error:', err);
        alert('Failed to add subject');
      }
    });
  }

  loadAllSubjects() {
    this.apiService.getSubjects().subscribe({
      next: (data) => this.subjects = data,
      error: () => { }
    });
  }


  deleteSection(id: number) {
    console.log('Delete button clicked for ID:', id);
    if (!id) {
      alert('Internal Error: Section ID is missing on this card!');
      return;
    }

    if (!confirm(`Are you sure you want to delete this section (ID: ${id})?`)) return;

    this.apiService.deleteSection(id).subscribe({
      next: (resp) => {
        console.log('Delete success response:', resp);
        alert('Section deleted OK!');
        this.loadSections();
      },
      error: (err) => {
        console.error('Delete error details:', err);
        alert('Server Refused Deletion: ' + (err.error?.error || err.error?.message || 'Check terminal logs'));
      }
    });
  }

  removeSubject(id: number) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this subject?')) return;
    this.apiService.deleteSubject(id).subscribe({
      next: () => {
        alert('Subject removed!');
        this.subjects = this.subjects.filter(s => s.id !== id);
      },
      error: () => alert('Failed to delete subject')
    });
  }

  clearAllSubjects() {
    if (!confirm('EXTREME WARNING: This will delete EVERY subject in your catalog. Do you want to continue?')) return;
    this.apiService.getSubjects().subscribe(all => {
      all.forEach(s => this.apiService.deleteSubject(s.id).subscribe());
      this.subjects = [];
      alert('Catalog Wiped!');
    });
  }

  loadSections() {
    this.apiService.getSections(undefined, this.filterYear).subscribe({
      next: (data) => this.sections = data,
      error: () => { }
    });
  }

  isBranchSelected(branch: string): boolean {
    return this.form.selectedBranches.includes(branch);
  }

  toggleBranch(branch: string) {
    const idx = this.form.selectedBranches.indexOf(branch);
    if (idx > -1) this.form.selectedBranches.splice(idx, 1);
    else this.form.selectedBranches.push(branch);
  }

  saveSection() {
    const payload = {
      id: this.editingId,
      name: this.form.name,
      graduationYear: this.form.graduationYear,
      department: this.form.department,
      domain: this.form.domain,
      branches: this.form.selectedBranches.join(', ')
    };

    this.apiService.saveSection(payload).subscribe({
      next: () => {
        alert('Section saved successfully!');
        this.resetForm();
        this.loadSections();
      },
      error: (err) => alert(err.error?.message || 'Failed to save section')
    });
  }

  showDomainSelector(): boolean {
    return this.form.selectedBranches.includes('Computer Science (CSE)');
  }

  getDomainsForCSE(): string[] {
    const cse = this.branchData.find(b => b.name === 'Computer Science (CSE)');
    return cse ? cse.domains : [];
  }

  editSection(s: any) {
    this.editingId = s.id;
    this.form = {
      id: s.id,
      name: s.name,
      graduationYear: s.graduationYear,
      department: s.department,
      domain: s.domain || '',
      selectedBranches: s.branches ? s.branches.split(', ') : []
    };
  }

  resetForm() {
    this.editingId = null;
    this.form = { id: undefined, name: '', graduationYear: '', department: 'B.Tech', domain: '', selectedBranches: [] };
  }

  splitBranches(bStr: string) {
    return bStr ? bStr.split(', ') : [];
  }


  getFormSubjects() {
    const currentDomain = (this.form.domain || '').toLowerCase().trim();
    const currentDept = this.form.department || 'B.Tech';

    return this.subjects.filter(s => {
      // Must match department
      if (s.department !== currentDept) return false;

      // Secondary check: ensure it's a Computer Science subject
      if (s.branch !== 'Computer Science (CSE)') return false;

      const subjDomain = (s.domain || '').toLowerCase().trim();

      // If "None / General" selected, show only subjects with no specific domain or marked general
      if (!currentDomain || currentDomain === 'none / general' || currentDomain === 'general') {
        return !subjDomain || subjDomain === 'none / general' || subjDomain === 'general' || subjDomain === '';
      }

      // Otherwise match specific domain exactly
      return subjDomain === currentDomain;
    });
  }

  getSubjectsForDomain(domain: string) {
    const targetDomain = (domain || '').toLowerCase().trim();
    const currentDept = 'B.Tech';

    return this.subjects.filter(s => {
      if (s.department !== currentDept) return false;
      if (s.branch !== 'Computer Science (CSE)') return false;

      const sDomain = (s.domain || '').toLowerCase().trim();

      if (!targetDomain || targetDomain === 'none / general' || targetDomain === 'general') {
        return !sDomain || sDomain === 'none / general' || sDomain === 'general' || sDomain === '';
      }
      return sDomain === targetDomain;
    });
  }

  get filteredCatalog() {
    return this.subjects.filter(s =>
      s.branch === 'Computer Science (CSE)' &&
      (s.name.toLowerCase().includes(this.catalogSearch.toLowerCase()) ||
        (s.domain || 'General').toLowerCase().includes(this.catalogSearch.toLowerCase()))
    );
  }
}
