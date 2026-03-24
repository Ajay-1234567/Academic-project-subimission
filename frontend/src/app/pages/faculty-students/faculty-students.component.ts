import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

const DEPARTMENTS = ['B.Tech'];

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

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const GRAD_YEAR_MAP: { [key: string]: string } = {
  '1st Year': '2029',
  '2nd Year': '2028',
  '3rd Year': '2027',
  '4th Year': '2026'
};

@Component({
  selector: 'app-faculty-students',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <app-sidebar role="faculty"></app-sidebar>
    <div class="main-layout fade-in">

      <header class="page-header">
        <div class="header-content">
          <h1>My Students <small style="font-size: 0.5em; opacity: 0.5;">v1.2</small></h1>
          <p>Add and manage students assigned to you</p>
        </div>
        <div class="header-stats">
          <div class="stat-chip">
            <span class="stat-num">{{ students.length }}</span>
            <span class="stat-lbl">Students</span>
          </div>
          <div class="stat-chip dept-chip" *ngIf="uniqueDepts > 0">
            <span class="stat-num">{{ uniqueDepts }}</span>
            <span class="stat-lbl">Departments</span>
          </div>
        </div>
      </header>

      <!-- Add Student Form -->
      <div class="form-card">
        <h3 class="form-title">
          <span *ngIf="!isEditing">+ Add New Student</span>
          <span *ngIf="isEditing">Edit Student Details</span>
        </h3>
        
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Assigned Faculty</label>
            <input [value]="facultyName" disabled class="glass-input readonly-field">
          </div>
          <div class="form-group">
            <label>Full Name <span class="req">*</span></label>
            <input [(ngModel)]="form.name" class="glass-input" placeholder="e.g. Alice Johnson">
          </div>
          <div class="form-group">
            <label>Email Address <span class="req">*</span></label>
            <input [(ngModel)]="form.email" type="email" class="glass-input" placeholder="student@university.edu" [class.highlight-input]="isEditing">
          </div>
          <div class="form-group">
            <label>{{ isEditing ? 'New Password' : 'Password' }} <span class="req" *ngIf="!isEditing">*</span></label>
            <input [(ngModel)]="form.password" type="password" class="glass-input" [placeholder]="isEditing ? 'Leave blank to keep current' : 'Set login password'">
          </div>
          <div class="form-group">
            <label>Academic Year <span class="req">*</span></label>
            <select [(ngModel)]="form.academicYear" (change)="onYearOrBranchChange()" class="glass-input glass-select" required>
              <option value="">Select Year</option>
              <option *ngFor="let y of academicYears" [value]="y">{{ y }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Branch <span class="req">*</span></label>
            <select [(ngModel)]="form.branch" (change)="onYearOrBranchChange()" class="glass-input glass-select" required>
              <option value="">Select Branch</option>
              <option *ngFor="let b of branchList" [value]="b.name">{{ b.name }}</option>
            </select>
          </div>
          <div class="form-group" *ngIf="showDomainDropdown()">
            <label>Domain / Specialization</label>
            <select [(ngModel)]="form.domain" (change)="onYearOrBranchChange()" class="glass-input glass-select">
              <option value="">Select Domain</option>
              <option *ngFor="let d of getDomainsForBranch()" [value]="d">{{ d }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Section <span class="req">*</span></label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <select [(ngModel)]="form.section" class="glass-input glass-select" [disabled]="availableSections.length === 0" style="flex: 1;" required>
                <option value="">{{ availableSections.length === 0 ? 'No Sections Available' : 'Select Section' }}</option>
                <option *ngFor="let s of availableSections" [value]="s.name">{{ s.name }}</option>
              </select>
              <button type="button" (click)="onYearOrBranchChange()" class="btn-refresh" title="Force Refresh">🔄</button>
            </div>
            <button type="button" *ngIf="availableSections.length === 0 && (form.branch || form.academicYear)" (click)="loadAllSections()" class="btn-load-all">Load All Sections Anyway</button>
            <div class="search-status" *ngIf="searchStatus">{{ searchStatus }}</div>
            <small class="help-text" *ngIf="availableSections.length === 0 && form.branch">
              Searching for <b>{{ form.academicYear }}</b> (Grad: {{ getGradYear() }}) 
              in <b>{{ form.branch }}</b> 
              with domain <b>{{ form.domain || 'General' }}</b>... 
              <br>Admin must configure sections matching these exact values.
            </small>
          </div>
          <div class="form-group">
            <label>Roll Number</label>
            <input [(ngModel)]="form.rollNumber" class="glass-input" placeholder="e.g. 21CS001">
          </div>
          <div class="form-group">
            <label>Subjects / Courses</label>
            <div class="subject-selection">
               <div *ngIf="availableSubjects.length === 0" class="no-subjs">No subjects created yet. Go to Dashboard > Subjects to add some.</div>
                <div *ngFor="let s of availableSubjects" class="checkbox-item">
                  <input type="checkbox" [id]="'subj-' + s.id" [checked]="isSubjectSelected(s.name)" (change)="toggleSubject(s.name)">
                  <label [for]="'subj-' + s.id">{{ s.name }} <small class="text-muted">({{ formatSemester(s.semester) }})</small></label>
                </div>
            </div>
            <!-- Fallback for manual entry if needed, or just display selected count -->
            <div class="selected-summary" *ngIf="form.subjects.length > 0">
              Selected: {{ form.subjects.join(', ') }}
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <span class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</span>
          
          <button (click)="addStudent()" class="btn-primary" [disabled]="isAdding" *ngIf="!isEditing">
            {{ isAdding ? 'Adding...' : 'Add Student' }}
          </button>
          
          <div class="edit-actions" *ngIf="isEditing">
             <button (click)="addStudent()" class="btn-primary" [disabled]="isAdding">
               {{ isAdding ? 'Updating...' : 'Save Changes' }}
             </button>
             <button (click)="cancelEdit()" class="btn-outline">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="search-row">
        <div class="search-wrapper">
           <span class="search-icon">🔍</span>
           <input [(ngModel)]="searchTerm" class="search-input" placeholder="Search by name, department or subject...">
        </div>
        <span class="results-count">{{ filteredStudents.length }} result(s)</span>
      </div>

      <!-- Students List -->
      <div *ngIf="isLoading" class="loading-state">Loading students...</div>

      <div *ngIf="!isLoading && filteredStudents.length === 0" class="empty-state">
        <div class="empty-icon">🎓</div>
        <h3>No students yet</h3>
        <p>Use the form above to add your first student.</p>
      </div>

      <div class="students-grid" *ngIf="!isLoading && filteredStudents.length > 0">
        <div *ngFor="let s of filteredStudents" class="student-card">
          <div class="card-top">
            <div class="avatar">{{ s.name.charAt(0).toUpperCase() }}</div>
            <div class="student-info">
              <h4>{{ s.name }}</h4>
              <span class="username">{{ s.email }}</span>
            </div>
            <div class="card-menu">
              <button (click)="editStudent(s)" class="btn-icon" title="Edit">✏️</button>
              <button (click)="removeStudent(s)" class="btn-icon delete" title="Remove">🗑️</button>
            </div>
          </div>
          
          <div class="info-row" *ngIf="s.branch || s.section">
             <div class="info-item" *ngIf="s.branch">
               <span class="label">Branch</span>
               <span class="val">{{ s.branch }}</span>
             </div>
             <div class="info-item" *ngIf="s.section">
               <span class="label">Section</span>
               <span class="val">{{ s.section }}</span>
             </div>
             <div class="info-item" *ngIf="s.academicYear">
               <span class="label">Year</span>
               <span class="val">{{ s.academicYear }}</span>
             </div>
          </div>
          
          <div class="tags" *ngIf="s.subject">
             <span class="tag subj-tag">📚 {{ s.subject }}</span>
          </div>

          <div class="card-footer">
             <span class="email-badge">{{ s.email }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; background: var(--background); min-height: 100vh; }

    /* Header */
    .page-header { 
      display: flex; justify-content: space-between; align-items: flex-start; 
      margin-bottom: 3rem; flex-wrap: wrap; gap: 2rem; 
    }
    .header-content { flex: 1; min-width: 300px; }
    h1 { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem; letter-spacing: -0.5px; }
    .page-header p { color: var(--text-secondary); margin: 0 0 0.5rem; font-size: 1rem; }
    
    .header-stats { display: flex; gap: 1rem; }
    .stat-chip { 
      text-align: center; padding: 0.5rem 1rem; background: var(--surface);
      border: 1px solid var(--border); border-radius: 8px; 
      min-width: 100px;
    }
    .stat-num { display: block; font-size: 1.5rem; font-weight: 700; color: var(--primary); line-height: 1.2; }
    .stat-lbl { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }

    /* Form Card */
    .form-card { 
      padding: 2.5rem; margin-bottom: 2rem; 
      background: var(--surface); border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .form-title { margin: 0 0 1.5rem; color: var(--primary); font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #334155; font-size: 0.9rem; font-weight: 500; }
    .req { color: #ef4444; }
    
    .glass-input { 
      width: 100%; padding: 0.75rem 1rem; background: var(--surface);
      border: 1px solid var(--border); border-radius: 6px;
      color: var(--text-primary); font-size: 0.95rem; box-sizing: border-box; 
      transition: all 0.2s;
    }
    .glass-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .glass-input::placeholder { color: var(--text-secondary); }
    .glass-select { background-image: none; cursor: pointer; }
    
    .readonly-field { background-color: #f1f5f9; color: var(--text-secondary); cursor: not-allowed; border-color: var(--border); }
    .full-width { grid-column: 1 / -1; }

    .form-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 1.5rem; }
    
    .btn-primary { 
      padding: 0.75rem 2rem; background: var(--primary);
      color: white; border: none; border-radius: 6px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .btn-outline {
      padding: 0.75rem 1.5rem; background: var(--surface); border: 1px solid var(--border);
      color: #475569; border-radius: 6px; cursor: pointer; font-weight: 500;
    }
    .btn-outline:hover { background: #f1f5f9; color: #0f172a; }

    .error-msg { color: #ef4444; font-size: 0.9rem; background: #fef2f2; padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #fecaca; }

    /* Search */
    .search-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; }
    .search-wrapper { 
      flex: 1; position: relative; max-width: 500px; 
    }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 0.9rem; color: var(--text-secondary); }
    .search-input { 
      width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; 
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      color: var(--text-primary); font-size: 0.95rem; 
    }
    .search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .results-count { color: var(--text-secondary); font-size: 0.9rem; }

    /* Grid */
    .students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

    .student-card { 
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s;
      display: flex; flex-direction: column;
    }
    .student-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border-color: var(--border); }

    .card-top { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
    .avatar { 
      width: 48px; height: 48px; border-radius: 10px;
      background: #eff6ff; color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.2rem; flex-shrink: 0; 
    }
    .student-info { flex: 1; overflow: hidden; }
    .student-info h4 { margin: 0 0 0.2rem; font-size: 1rem; color: var(--text-primary); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .username { font-size: 0.85rem; color: var(--text-secondary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .card-menu { display: flex; gap: 0.25rem; }
    .btn-icon { 
      background: transparent; border: none; color: var(--text-secondary); 
      width: 28px; height: 28px; border-radius: 4px; cursor: pointer; 
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
    }
    .btn-icon:hover { background: #f1f5f9; color: var(--primary); }
    .btn-icon.delete:hover { background: #fef2f2; color: #ef4444; }

    .info-row { 
      display: flex; gap: 1rem; margin-bottom: 1rem; 
      background: var(--background); padding: 0.75rem; border-radius: 8px; border: 1px solid #f1f5f9;
    }
    .info-item { display: flex; flex-direction: column; }
    .info-item .label { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
    .info-item .val { font-size: 0.85rem; color: #334155; font-weight: 500; }

    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .tag { padding: 0.3rem 0.8rem; border-radius: 99px; font-size: 0.8rem; }
    .subj-tag { background: rgba(16,185,129,0.2); color: #059669; }
    .no-tag { background: rgba(255,255,255,0.05); color: var(--text-secondary); font-style: italic; }

    .card-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .email-badge { 
      display: inline-block; font-size: 0.8rem; color: var(--text-secondary); 
      background: #f1f5f9; padding: 0.25rem 0.6rem; border-radius: 4px;
      font-family: monospace; 
    }

    .empty-state { text-align: center; padding: 4rem; color: var(--text-secondary); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
    .empty-state h3 { color: var(--text-primary); margin-bottom: 0.5rem; }
    .loading-state { text-align: center; padding: 3rem; color: var(--text-secondary); }

    /* Checkboxes */
    .subject-selection { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; 
      max-height: 150px; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; padding: 0.5rem; background: var(--surface);
    }
    .checkbox-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
    .checkbox-item input { margin: 0; }
    .no-subjs { font-size: 0.85rem; color: var(--text-secondary); font-style: italic; padding: 0.5rem; }
    .text-muted { color: var(--text-secondary); font-size: 0.8rem; }
    .selected-summary { font-size: 0.8rem; color: var(--primary); margin-top: 0.4rem; font-weight: 500; }

    @media (max-width: 1024px) {
      .main-layout { margin-left: 0; padding: 4.5rem 1.25rem 2rem; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; margin-bottom: 2.5rem; }
      h1 { font-size: 1.7rem; }
      p { margin-bottom: 0.5rem; }
      .header-stats { width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .stat-chip { min-width: 0; margin: 0; }
      .form-card { padding: 1.5rem; }
      .form-grid { grid-template-columns: 1fr; gap: 1.25rem; }
      .search-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .search-wrapper { max-width: 100%; width: 100%; }
    }

    @media (max-width: 480px) {
      .header-stats { grid-template-columns: 1fr; }
      .btn-primary { width: 100%; }
    }
    .btn-refresh { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 0.5rem; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover { background: #f1f5f9; border-color: var(--primary); }
    .btn-load-all { margin-top: 0.5rem; font-size: 0.75rem; color: var(--primary); background: transparent; border: none; padding: 0; text-decoration: underline; cursor: pointer; font-weight: 600; }
    .search-status { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; font-style: italic; }
  `]
})
export class FacultyStudentsComponent implements OnInit {
  availableSubjects: any[] = [];

  students: any[] = [];
  searchTerm = '';
  isLoading = false;
  isAdding = false;
  errorMsg = '';
  departments = DEPARTMENTS;
  branchList = BRANCH_DATA;
  academicYears = ACADEMIC_YEARS;
  availableSections: any[] = [];

  form = { name: '', email: '', password: '', department: 'B.Tech', branch: '', domain: '', section: '', subjects: [] as string[], academicYear: '', rollNumber: '' };
  isEditing = false;
  editingId: number | null = null;

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  get facultyId(): number { return this.authService.currentUser()?.id; }

  get uniqueDepts(): number {
    return new Set(this.students.map(s => s.department).filter(Boolean)).size;
  }

  get filteredStudents(): any[] {
    if (!this.searchTerm.trim()) return this.students;
    const q = this.searchTerm.toLowerCase();
    return this.students.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.subject?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  }

  get facultyName(): string { return this.authService.currentUser()?.name || 'Unknown Faculty'; }

  ngOnInit() {
    this.loadStudents();
    this.loadAvailableSubjects();
  }

  loadAvailableSubjects() {
    if (this.facultyId) {
      this.apiService.getSubjects(undefined, undefined, this.facultyId).subscribe({
        next: (data) => { this.availableSubjects = data; },
        error: () => { }
      });
    }
  }

  loadStudents() {
    this.isLoading = true;
    this.apiService.getFacultyStudents(this.facultyId).subscribe({
      next: (data) => { this.students = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  toggleSubject(subjName: string) {
    const index = this.form.subjects.indexOf(subjName);
    if (index > -1) {
      this.form.subjects.splice(index, 1);
    } else {
      this.form.subjects.push(subjName);
    }
  }

  isSubjectSelected(subjName: string): boolean {
    return this.form.subjects.includes(subjName);
  }

  addStudent() {
    this.errorMsg = '';

    const payload = {
      ...this.form,
      subject: this.form.subjects.join(', ') // Convert array to comma string for backend
    };

    if (this.isEditing && this.editingId) {
      if (!this.form.name || !this.form.email) {
        this.errorMsg = 'Name and email are required.';
        return;
      }
      this.isAdding = true;
      this.apiService.updateProfile(this.editingId, payload).subscribe({
        next: (updatedStudent) => {
          // Update local list
          const index = this.students.findIndex(s => s.id === this.editingId);
          if (index !== -1) {
            // Merge updated properties
            this.students[index] = { ...this.students[index], ...updatedStudent };
          }
          this.cancelEdit();
          this.isAdding = false;
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Failed to update student.';
          this.isAdding = false;
        }
      });
      return;
    }

    // Add Logic
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.errorMsg = 'Name, email and password are required.';
      return;
    }
    this.isAdding = true;
    this.apiService.addFacultyStudent(this.facultyId, payload).subscribe({
      next: (student) => {
        this.students = [student, ...this.students];
        this.resetForm();
        this.isAdding = false;
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'Failed to add student.';
        this.isAdding = false;
      }
    });
  }

  resetForm() {
    this.form = { name: '', email: '', password: '', department: 'B.Tech', branch: '', domain: '', section: '', subjects: [], academicYear: '', rollNumber: '' };
    this.availableSections = [];
  }

  onYearOrBranchChange() {
    this.form.section = '';
    this.availableSections = [];
    this.searchStatus = '';

    if (this.form.branch && this.form.academicYear) {
      const gradYear = this.getGradYear();
      this.searchStatus = `Searching for ${this.form.academicYear} (Grad ${gradYear})...`;
      
      this.apiService.getSections('B.Tech', gradYear, this.form.branch, this.form.domain).subscribe({
        next: (data) => {
          this.availableSections = data;
          this.searchStatus = data.length > 0 ? '' : 'No sections found for this combination.';
        },
        error: () => { 
          this.searchStatus = 'Error connecting to server.';
        }
      });
    }
  }

  getGradYear(): string {
    return GRAD_YEAR_MAP[this.form.academicYear] || 'Unknown';
  }

  loadAllSections() {
    this.searchStatus = 'Loading all sections...';
    this.apiService.getSections().subscribe({
      next: (data) => {
        this.availableSections = data;
        this.searchStatus = `Found ${data.length} total sections. Select one from the list.`;
      },
      error: () => this.searchStatus = 'Failed to load sections.'
    });
  }

  searchStatus = '';

  showDomainDropdown(): boolean {
    return this.form.branch === 'Computer Science (CSE)';
  }

  getDomainsForBranch(): string[] {
    const b = this.branchList.find(x => x.name === this.form.branch);
    return b ? b.domains : [];
  }

  editStudent(s: any) {
    this.isEditing = true;
    this.editingId = s.id;
    this.form = {
      name: s.name,
      email: s.email,
      department: s.department || 'B.Tech',
      branch: s.branch || '',
      domain: s.domain || '',
      section: s.section || '',
      subjects: s.subject ? s.subject.split(', ') : [],
      academicYear: s.academicYear || '',
      rollNumber: s.rollNumber || '',
      password: ''
    };

    // Load sections for the edit mode
    if (this.form.branch && this.form.academicYear) {
      const gradYear = GRAD_YEAR_MAP[this.form.academicYear];
      this.apiService.getSections('B.Tech', gradYear, this.form.branch, this.form.domain).subscribe({
        next: (data) => this.availableSections = data,
        error: () => { }
      });
    }

    // Scroll to form
    const formEl = document.querySelector('.form-card');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
    this.errorMsg = '';
  }

  removeStudent(s: any) {
    if (!confirm(`Remove ${s.name} from your list? They can still log in.`)) return;
    this.apiService.removeFacultyStudent(this.facultyId, s.id).subscribe({
      next: () => { this.students = this.students.filter(x => x.id !== s.id); },
      error: () => { alert('Failed to remove.'); }
    });
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
}
