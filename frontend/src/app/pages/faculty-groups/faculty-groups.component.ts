import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-faculty-groups',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
    template: `
    <app-sidebar role="faculty"></app-sidebar>
    <div class="main-layout fade-in">

      <header class="page-header">
        <div>
          <h1>Group Management</h1>
          <p>Create and manage student groups for group project submissions</p>
        </div>
        <div class="header-stats">
          <div class="stat-chip">
            <span class="chip-num">{{ groups.length }}</span>
            <span class="chip-lbl">Groups</span>
          </div>
          <div class="stat-chip submitted-chip">
            <span class="chip-num">{{ submittedGroupCount }}</span>
            <span class="chip-lbl">Submitted</span>
          </div>
          <div class="stat-chip pending-chip">
            <span class="chip-num">{{ notSubmittedGroupCount }}</span>
            <span class="chip-lbl">Not Submitted</span>
          </div>
        </div>
      </header>

      <!-- Create Group Form -->
      <div class="form-card">
        <h3>{{ editingGroupId ? '✏️ Edit Group' : '+ Create New Group' }}</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>Group Number <span class="req">*</span></label>
            <input [(ngModel)]="groupForm.groupNumber" class="glass-input" placeholder="e.g. G1, G2, 101" [disabled]="!!editingGroupId">
          </div>
          <div class="form-group">
            <label>Group Name <span class="optional">(optional)</span></label>
            <input [(ngModel)]="groupForm.groupName" class="glass-input" placeholder="e.g. Team Alpha">
          </div>
        </div>

        <!-- Member Selection -->
        <div class="form-group">
          <label>Select Members</label>
          <div class="info-note" *ngIf="unassignedStudents.length === 0 && availableStudents.length > 0">
            ⚠️ All students are already assigned to groups. Remove a student from their current group to reassign.
          </div>
          <div class="info-note" *ngIf="availableStudents.length === 0">
            ⚠️ No students added yet. Go to <a routerLink="/faculty/students">My Students</a> to add students first.
          </div>
          <div class="member-selection" *ngIf="availableStudents.length > 0">
            <div *ngFor="let s of availableStudents" class="member-check-item"
                 [class.already-in-group]="isStudentInAnotherGroup(s.id)">
              <input type="checkbox" [id]="'mem-' + s.id"
                     [checked]="groupForm.memberIds.includes(s.id)"
                     (change)="toggleMember(s.id)">
              <label [for]="'mem-' + s.id">
                <div class="member-info">
                  <div class="member-avatar">{{ s.name.charAt(0) }}</div>
                  <div>
                    <div class="member-name">{{ s.name }}</div>
                    <div class="member-meta">{{ s.email }} {{ s.rollNumber ? '· ' + s.rollNumber : '' }}</div>
                    <div class="member-group-tag" *ngIf="isStudentInAnotherGroup(s.id)">
                      Currently in Group {{ getStudentGroup(s.id) }}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div class="selected-count" *ngIf="groupForm.memberIds.length > 0">
            {{ groupForm.memberIds.length }} member(s) selected
          </div>
        </div>

        <div class="form-actions">
          <span class="error-msg" *ngIf="formError">{{ formError }}</span>
          <div class="action-btns">
            <button (click)="cancelEdit()" class="btn-outline" *ngIf="editingGroupId">Cancel</button>
            <button (click)="saveGroup()" class="btn-primary" [disabled]="isSaving">
              {{ isSaving ? 'Saving...' : (editingGroupId ? 'Update Group' : 'Create Group') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Groups List -->
      <div *ngIf="isLoading" class="loading-state">Loading groups...</div>

      <div *ngIf="!isLoading && groups.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No groups yet</h3>
        <p>Create a group above to organize your students for group project submissions.</p>
      </div>

      <div class="groups-grid" *ngIf="!isLoading && groups.length > 0">
        <div *ngFor="let g of groups" class="group-card" [class.has-submitted]="g.hasSubmitted">
          <div class="group-card-header">
            <div class="group-num-badge">Group {{ g.groupNumber }}</div>
            <div class="group-header-actions">
              <button (click)="editGroup(g)" class="btn-icon" title="Edit">✏️</button>
              <button (click)="deleteGroup(g)" class="btn-icon del" title="Delete">🗑️</button>
            </div>
          </div>

          <div class="group-name" *ngIf="g.groupName">{{ g.groupName }}</div>

          <!-- Submission Status -->
          <div class="sub-status" [class.submitted]="g.hasSubmitted" [class.not-sub]="!g.hasSubmitted">
            <span *ngIf="g.hasSubmitted">✅ Project Submitted</span>
            <span *ngIf="!g.hasSubmitted">⏳ Not Submitted</span>
          </div>

          <!-- Members -->
          <div class="members-section">
            <div class="members-label">Members ({{ g.members?.length || 0 }})</div>
            <div class="members-list">
              <div *ngFor="let m of g.members" class="member-pill">
                <span class="pill-avatar">{{ m.name.charAt(0) }}</span>
                <div class="pill-info">
                  <span class="pill-name">{{ m.name }}</span>
                  <span class="pill-roll" *ngIf="m.rollNumber">{{ m.rollNumber }}</span>
                </div>
              </div>
              <div *ngIf="!g.members || g.members.length === 0" class="no-members">No members</div>
            </div>
          </div>

          <!-- Projects -->
          <div class="projects-section" *ngIf="g.projects && g.projects.length > 0">
            <div class="projects-label">Submitted Projects</div>
            <div *ngFor="let p of g.projects" class="project-row">
              <a [routerLink]="['/projects', p.id]" class="project-link">{{ p.title }}</a>
              <span class="proj-status" [class.graded]="p.score">
                {{ p.score ? 'Graded: ' + p.score + '/100' : 'Pending Review' }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
    styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; background: #f8fafc; min-height: 100vh; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    h1 { font-size: 2rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; }
    p { color: #64748b; margin: 0; font-size: 1rem; }

    .header-stats { display: flex; gap: 1rem; }
    .stat-chip { text-align: center; padding: 0.6rem 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; min-width: 80px; }
    .stat-chip.submitted-chip { border-top: 3px solid #10b981; }
    .stat-chip.pending-chip { border-top: 3px solid #f59e0b; }
    .chip-num { display: block; font-size: 1.5rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .chip-lbl { font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }

    /* Form */
    .form-card { background: white; border-radius: 14px; border: 1px solid #e2e8f0; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .form-card h3 { margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #475569; font-weight: 600; font-size: 0.9rem; }
    .req { color: #ef4444; }
    .optional { color: #94a3b8; font-size: 0.8rem; font-weight: 400; }
    .glass-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; color: #1e293b; background: #fff; transition: border-color 0.2s; }
    .glass-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .glass-input:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
    .info-note { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.88rem; color: #92400e; margin-bottom: 1rem; }
    .info-note a { color: #6366f1; font-weight: 600; }

    .member-selection { border: 1px solid #e2e8f0; border-radius: 8px; max-height: 280px; overflow-y: auto; background: #fff; }
    .member-check-item { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
    .member-check-item:last-child { border-bottom: none; }
    .member-check-item:hover { background: #f8fafc; }
    .member-check-item.already-in-group { background: #fffdf0; }
    .member-check-item input[type="checkbox"] { display: none; }
    .member-check-item label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
    .member-check-item input:checked + label { }
    .member-info { display: flex; align-items: center; gap: 0.75rem; width: 100%; }
    .member-avatar { width: 32px; height: 32px; border-radius: 8px; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .member-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
    .member-meta { font-size: 0.78rem; color: #64748b; }
    .member-group-tag { font-size: 0.75rem; color: #d97706; background: #fffbeb; border-radius: 4px; padding: 0.1rem 0.4rem; display: inline-block; margin-top: 0.2rem; }

    /* Custom checkbox style */
    .member-check-item { position: relative; }
    .member-check-item label::before { content: ''; width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; flex-shrink: 0; transition: all 0.2s; background: white; }
    .member-check-item input:checked + label::before { background: #6366f1; border-color: #6366f1; }
    .member-check-item input:checked + label::after { content: '✓'; position: absolute; left: 1.18rem; top: 50%; transform: translateY(-50%); color: white; font-size: 0.7rem; font-weight: 700; }

    .selected-count { margin-top: 0.5rem; font-size: 0.82rem; color: #6366f1; font-weight: 600; }
    .form-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .action-btns { display: flex; gap: 0.75rem; }
    .error-msg { color: #ef4444; font-size: 0.88rem; background: #fef2f2; padding: 0.5rem 1rem; border-radius: 6px; }
    .btn-primary { background: #6366f1; color: white; border: none; padding: 0.75rem 1.75rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: #f1f5f9; }

    /* Groups Grid */
    .groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }

    .group-card { background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.5rem; transition: all 0.2s; }
    .group-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
    .group-card.has-submitted { border-top: 4px solid #10b981; }

    .group-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .group-num-badge { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-weight: 700; font-size: 0.9rem; padding: 0.3rem 0.9rem; border-radius: 99px; }
    .group-header-actions { display: flex; gap: 0.25rem; }
    .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 1rem; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon.del:hover { background: #fef2f2; }
    .group-name { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 0.75rem; }

    .sub-status { font-size: 0.82rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 99px; display: inline-flex; align-items: center; gap: 0.25rem; margin-bottom: 1rem; }
    .sub-status.submitted { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .sub-status.not-sub { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }

    .members-section { margin-bottom: 1rem; }
    .members-label, .projects-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.5rem; }
    .members-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .member-pill { display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; border-radius: 8px; padding: 0.5rem 0.75rem; }
    .pill-avatar { width: 26px; height: 26px; border-radius: 6px; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
    .pill-info { display: flex; flex-direction: column; line-height: 1.2; }
    .pill-name { font-size: 0.88rem; font-weight: 500; color: #1e293b; }
    .pill-roll { font-size: 0.75rem; color: #94a3b8; font-family: monospace; }
    .no-members { color: #94a3b8; font-style: italic; font-size: 0.85rem; }

    .projects-section { border-top: 1px solid #f1f5f9; padding-top: 1rem; }
    .project-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .project-link { font-size: 0.85rem; color: #6366f1; font-weight: 500; text-decoration: none; }
    .project-link:hover { text-decoration: underline; }
    .proj-status { font-size: 0.75rem; color: #64748b; }
    .proj-status.graded { color: #059669; font-weight: 600; }

    .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 14px; border: 1px dashed #cbd5e1; color: #64748b; }
    .empty-icon { font-size: 3rem; margin-bottom: 0.75rem; opacity: 0.5; }
    .empty-state h3 { color: #1e293b; margin-bottom: 0.5rem; }
    .loading-state { text-align: center; padding: 3rem; color: #64748b; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }

    @media (max-width: 1024px) {
      .main-layout { margin-left: 0; padding: 4.5rem 1rem 2rem; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      h1 { font-size: 1.6rem; }
      .header-stats { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
      .stat-chip { min-width: 0; padding: 0.6rem 0.2rem; }
      .chip-num { font-size: 1.2rem; }
      .chip-lbl { font-size: 0.6rem; }
      .form-card { padding: 1.5rem; }
      .form-grid { grid-template-columns: 1fr; gap: 1rem; }
      .groups-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FacultyGroupsComponent implements OnInit {
    groups: any[] = [];
    availableStudents: any[] = [];
    isLoading = false;
    isSaving = false;
    formError = '';
    editingGroupId: number | null = null;

    groupForm = { groupNumber: '', groupName: '', memberIds: [] as number[] };

    private apiService = inject(ApiService);
    private authService = inject(AuthService);

    get facultyId(): number { return this.authService.currentUser()?.id; }

    get submittedGroupCount() { return this.groups.filter(g => g.hasSubmitted).length; }
    get notSubmittedGroupCount() { return this.groups.filter(g => !g.hasSubmitted).length; }

    get unassignedStudents() {
        return this.availableStudents.filter(s => !this.isStudentInAnotherGroup(s.id));
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;
        Promise.all([
            new Promise<void>(resolve => {
                this.apiService.getFacultyStudents(this.facultyId).subscribe({
                    next: (data) => { this.availableStudents = data; resolve(); },
                    error: () => resolve()
                });
            }),
            new Promise<void>(resolve => {
                this.apiService.getFacultyGroups(this.facultyId).subscribe({
                    next: (data) => { this.groups = data; resolve(); },
                    error: () => resolve()
                });
            })
        ]).then(() => { this.isLoading = false; });
    }

    isStudentInAnotherGroup(studentId: number): boolean {
        if (this.editingGroupId) {
            // When editing, check if in a group OTHER than the one being edited
            return this.groups.some(g =>
                g.id !== this.editingGroupId &&
                g.members?.some((m: any) => m.id === studentId)
            );
        }
        return this.groups.some(g => g.members?.some((m: any) => m.id === studentId));
    }

    getStudentGroup(studentId: number): string {
        const group = this.groups.find(g => g.members?.some((m: any) => m.id === studentId));
        return group ? group.groupNumber : '';
    }

    toggleMember(studentId: number) {
        const idx = this.groupForm.memberIds.indexOf(studentId);
        if (idx > -1) {
            this.groupForm.memberIds.splice(idx, 1);
        } else {
            this.groupForm.memberIds.push(studentId);
        }
    }

    saveGroup() {
        this.formError = '';
        if (!this.groupForm.groupNumber.trim()) {
            this.formError = 'Group number is required.';
            return;
        }

        this.isSaving = true;

        if (this.editingGroupId) {
            this.apiService.updateGroup(this.facultyId, this.editingGroupId, {
                groupName: this.groupForm.groupName,
                memberIds: this.groupForm.memberIds
            }).subscribe({
                next: (res) => {
                    const idx = this.groups.findIndex(g => g.id === this.editingGroupId);
                    if (idx > -1) {
                        this.groups[idx].groupName = this.groupForm.groupName;
                        this.groups[idx].members = res.members;
                    }
                    this.cancelEdit();
                    this.isSaving = false;
                    this.loadData(); // Refresh to get latest
                },
                error: (err) => {
                    this.formError = err?.error?.message || 'Failed to update group.';
                    this.isSaving = false;
                }
            });
        } else {
            this.apiService.createGroup(this.facultyId, this.groupForm).subscribe({
                next: (group) => {
                    this.groups.unshift(group);
                    this.groupForm = { groupNumber: '', groupName: '', memberIds: [] };
                    this.isSaving = false;
                },
                error: (err) => {
                    this.formError = err?.error?.message || 'Failed to create group.';
                    this.isSaving = false;
                }
            });
        }
    }

    editGroup(g: any) {
        this.editingGroupId = g.id;
        this.groupForm = {
            groupNumber: g.groupNumber,
            groupName: g.groupName || '',
            memberIds: g.members ? g.members.map((m: any) => m.id) : []
        };
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelEdit() {
        this.editingGroupId = null;
        this.groupForm = { groupNumber: '', groupName: '', memberIds: [] };
        this.formError = '';
    }

    deleteGroup(g: any) {
        if (!confirm(`Delete Group ${g.groupNumber}? This will not delete the students.`)) return;
        this.apiService.deleteGroup(this.facultyId, g.id).subscribe({
            next: () => { this.groups = this.groups.filter(x => x.id !== g.id); },
            error: () => alert('Failed to delete group.')
        });
    }
}
