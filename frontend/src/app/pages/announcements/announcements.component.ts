import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <app-sidebar role="faculty"></app-sidebar>
    <div class="main-layout fade-in">

      <header class="page-header">
        <div class="header-content">
          <h1>Announcements</h1>
          <p>Send deadline reminders and notices to all students</p>
        </div>
      </header>

      <!-- Create Form -->
      <div class="form-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem;">
          <h3 class="form-title" style="margin: 0; border: none; padding: 0;">Create New Announcement</h3>
          <div class="template-selector">
            <select class="glass-input tiny-select" (change)="applyTemplate($event)">
              <option value="">-- Quick Templates --</option>
              <option *ngFor="let t of templates" [value]="t.title">{{ t.label }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Title</label>
            <input [(ngModel)]="form.title" class="glass-input" placeholder="e.g. Final Project Submission Deadline">
          </div>
          <div class="form-group deadline-group">
            <label>Deadline (Optional)</label>
              <input [(ngModel)]="form.deadlineDate" 
                     type="text" 
                     placeholder="Select Deadline Date"
                     onfocus="(this.type='date')" 
                     onblur="if(!this.value)this.type='text'"
                     class="glass-input">

          </div>
        </div>
        
        <div class="form-group">
          <label>Message</label>
          <textarea [(ngModel)]="form.message" class="glass-input" rows="4"
            placeholder="Write a detailed message for students..."></textarea>
        </div>
        
        <div class="form-actions">
          <button (click)="postAnnouncement()" class="btn-primary" [disabled]="isSending">
            {{ isSending ? 'Sending...' : 'Send to All Students' }}
          </button>
        </div>
      </div>

      <!-- Sent Announcements -->
      <div class="sent-section">
        <div class="section-header">
           <h3>History</h3>
           <span class="count-badge">{{ announcements.length }} sent</span>
        </div>

        <div *ngIf="isLoading" class="loading-state">Loading announcements...</div>

        <div *ngIf="!isLoading && announcements.length === 0" class="empty-state">
          <div class="empty-icon">📢</div>
          <h3>No announcements yet</h3>
          <p>Create your first announcement above.</p>
        </div>

        <div class="announcements-list" *ngIf="!isLoading && announcements.length > 0">
          <div *ngFor="let a of announcements" class="announce-card">
            <div class="card-header">
              <h4 class="card-title">{{ a.title }}</h4>
              <button (click)="deleteAnnouncement(a.id)" class="btn-icon delete" title="Delete">🗑️</button>
            </div>

            <p class="msg">{{ a.message }}</p>

            <div class="card-meta">
              <span *ngIf="a.deadline" class="meta-chip deadline">
                ⏰ Deadline: {{ a.deadline | date:'mediumDate':'UTC' }}
              </span>
              <span class="meta-chip date">
                {{ a.createdAt | date:'mediumDate' }}
              </span>
            </div>
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
    .page-header p { color: var(--text-secondary); margin: 0; font-size: 1rem; }

    /* Form Card */
    .form-card { 
      padding: 2.5rem; margin-bottom: 3rem; 
      background: var(--surface); border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .form-title { margin: 0 0 1.5rem; color: var(--primary); font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }

    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: #334155; font-size: 0.9rem; font-weight: 500; }
    
    .glass-input { 
      width: 100%; padding: 0.75rem 1rem; background: var(--surface);
      border: 1px solid var(--border); border-radius: 6px;
      color: var(--text-primary); font-size: 0.95rem; box-sizing: border-box; 
      transition: all 0.2s; font-family: inherit;
    }
    .glass-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .glass-input::placeholder { color: var(--text-secondary); }
    textarea.glass-input { resize: vertical; min-height: 100px; }

    .hint { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; }
    .tiny-select { padding: 0.4rem 0.8rem; font-size: 0.85rem; width: auto; min-width: 180px; height: auto; cursor: pointer; }

    .form-actions { display: flex; justify-content: flex-end; padding-top: 1rem; }
    .btn-primary { 
      padding: 0.75rem 2rem; background: var(--primary);
      color: white; border: none; border-radius: 6px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    /* List Section */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .section-header h3 { font-size: 1.1rem; color: #334155; margin: 0; font-weight: 600; }
    .count-badge { background: #f1f5f9; color: var(--text-secondary); padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.8rem; font-weight: 500; }

    .announcements-list { display: flex; flex-direction: column; gap: 1rem; }

    .announce-card { 
      background: var(--surface); padding: 1.5rem; border-radius: 8px;
      border: 1px solid var(--border); transition: all 0.2s;
    }
    .announce-card:hover { border-color: var(--border); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .card-title { margin: 0; font-size: 1.1rem; color: var(--text-primary); font-weight: 600; }
    
    .btn-icon { background: transparent; border: none; cursor: pointer; opacity: 0.4; transition: opacity 0.2s; font-size: 1rem; }
    .btn-icon:hover { opacity: 1; }
    .btn-icon.delete:hover { filter: drop-shadow(0 0 2px red); }

    .msg { color: #475569; line-height: 1.6; margin: 0 0 1.2rem; font-size: 0.95rem; white-space: pre-wrap; }

    .card-meta { display: flex; flex-wrap: wrap; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #f8fafc; }
    .meta-chip { font-size: 0.8rem; padding: 0.3rem 0.7rem; border-radius: 6px; font-weight: 500; }
    .meta-chip.deadline { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .meta-chip.date { background: var(--background); color: var(--text-secondary); border: 1px solid var(--border); margin-left: auto; }

    .empty-state { text-align: center; padding: 4rem; color: var(--text-secondary); background: var(--surface); border-radius: 12px; border: 1px dashed var(--border); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }

    @media (max-width: 1024px) {
      .main-layout { margin-left: 0; padding: 4.5rem 1rem 2rem; }
      .page-header { flex-direction: column; align-items: flex-start; }
      h1 { font-size: 1.6rem; }
      .form-card { padding: 1.25rem; }
      .form-grid { grid-template-columns: 1fr; gap: 1rem; }
      
      .date-time-row { flex-direction: column; gap: 0.75rem; }
      .glass-input[type="date"], .glass-input[type="time"] { 
        min-height: 48px; 
        color: var(--text-primary) !important;
        -webkit-appearance: listbox; /* Forces native mobile UI display */
      }
      .time-input { flex: none; width: 100%; }
      
      .card-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .btn-icon.delete { align-self: flex-end; }
    }

    @media (max-width: 480px) {
      .form-title { font-size: 1rem; }
      .btn-primary { width: 100%; padding: 0.85rem; }
    }
  `]
})
export class AnnouncementsComponent implements OnInit {
  announcements: any[] = [];
  isLoading = false;
  isSending = false;

  form = { title: '', message: '', deadlineDate: '' };
  
  templates = [
    { label: '⏰ Submission Deadline', title: 'Final Project Submission', message: 'This is a reminder that the final project submission deadline is approaching. Please ensure all your files and repository links are correctly updated before the cutoff.' },
    { label: '📊 Report Submission', title: 'Project Report Deadline', message: 'Please submit your comprehensive project report as per the template provided. Ensure all team members names and roll numbers are included correctly.' },
    { label: '✏️ Revision Needed', title: 'Action Required: Project Revisions', message: 'Faculty has reviewed your latest submission. Some corrections are required in your abstract or methodology. Please check the feedback and resubmit soon.' }
  ];

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadAnnouncements();
  }

  applyTemplate(event: any) {
    const title = event.target.value;
    if (!title) return;
    const template = this.templates.find(t => t.title === title);
    if (template) {
      this.form.title = template.title;
      this.form.message = template.message;
    }
  }

  loadAnnouncements() {
    this.isLoading = true;
    this.apiService.getAnnouncements().subscribe({
      next: (data) => { this.announcements = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  postAnnouncement() {
    if (!this.form.title || !this.form.message) {
      alert('Please fill in title and message.');
      return;
    }
    this.isSending = true;
    const user = this.authService.currentUser();

    // Combine date into MySQL DATETIME format (YYYY-MM-DD 23:59:59)
    let deadline: string | null = null;
    if (this.form.deadlineDate) {
      deadline = `${this.form.deadlineDate} 23:59:59`;
    }

    this.apiService.createAnnouncement({
      title: this.form.title,
      message: this.form.message,
      deadline,
      facultyId: user?.id,
      facultyName: user?.name
    }).subscribe({
      next: (newItem) => {
        this.announcements.unshift(newItem);
        this.form = { title: '', message: '', deadlineDate: '' };
        this.isSending = false;
      },
      error: (err: any) => {
        alert('Failed to send: ' + (err?.error?.message || 'Unknown error'));
        this.isSending = false;
      }
    });
  }

  deleteAnnouncement(id: number) {
    if (!confirm('Delete this announcement?')) return;
    this.apiService.deleteAnnouncement(id).subscribe({
      next: () => { this.announcements = this.announcements.filter(a => a.id !== id); },
      error: () => { alert('Failed to delete.'); }
    });
  }
}
