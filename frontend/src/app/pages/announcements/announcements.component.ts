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
        <div>
          <h1>Announcements</h1>
          <p>Send deadline reminders and notices to all students</p>
        </div>
      </header>

      <!-- Create Form -->
      <div class="form-card">
        <h3 class="form-title">Create New Announcement</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Title</label>
            <input [(ngModel)]="form.title" class="glass-input" placeholder="e.g. Final Project Submission Deadline">
          </div>
          <div class="form-group deadline-group">
            <label>Deadline (Optional)</label>
            <div class="date-time-row">
              <input [(ngModel)]="form.deadlineDate" type="date" class="glass-input">
              <input [(ngModel)]="form.deadlineTime" type="time" class="glass-input time-input">
            </div>
            <span class="hint">Defaults to 23:59 if time is not set.</span>
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
                ⏰ Deadline: {{ a.deadline | date:'medium' }}
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
    .main-layout { margin-left: 250px; padding: 2rem; background: #f8fafc; min-height: 100vh; }
    @media (max-width: 768px) { .main-layout { margin-left: 0; padding-top: 80px; } }

    /* Header */
    .page-header { margin-bottom: 2rem; }
    h1 { font-size: 2rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; letter-spacing: -0.5px; }
    .page-header p { color: #64748b; margin: 0; font-size: 1rem; }

    /* Form Card */
    .form-card { 
      padding: 2.5rem; margin-bottom: 3rem; 
      background: white; border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .form-title { margin: 0 0 1.5rem; color: var(--primary); font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }

    .form-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 1.5rem; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: #334155; font-size: 0.9rem; font-weight: 500; }
    
    .glass-input { 
      width: 100%; padding: 0.75rem 1rem; background: #fff;
      border: 1px solid #cbd5e1; border-radius: 6px;
      color: #1e293b; font-size: 0.95rem; box-sizing: border-box; 
      transition: all 0.2s; font-family: inherit;
    }
    .glass-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .glass-input::placeholder { color: #94a3b8; }
    textarea.glass-input { resize: vertical; min-height: 100px; }

    .date-time-row { display: flex; gap: 0.5rem; }
    .time-input { flex: 0 0 140px; }
    .hint { display: block; font-size: 0.8rem; color: #64748b; margin-top: 0.5rem; }

    .form-actions { display: flex; justify-content: flex-end; padding-top: 1rem; }
    .btn-primary { 
      padding: 0.75rem 2rem; background: var(--primary);
      color: white; border: none; border-radius: 6px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    /* List Section */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
    .section-header h3 { font-size: 1.1rem; color: #334155; margin: 0; font-weight: 600; }
    .count-badge { background: #f1f5f9; color: #64748b; padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.8rem; font-weight: 500; }

    .announcements-list { display: flex; flex-direction: column; gap: 1rem; }

    .announce-card { 
      background: white; padding: 1.5rem; border-radius: 8px;
      border: 1px solid #e2e8f0; transition: all 0.2s;
    }
    .announce-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .card-title { margin: 0; font-size: 1.1rem; color: #1e293b; font-weight: 600; }
    
    .btn-icon { background: transparent; border: none; cursor: pointer; opacity: 0.4; transition: opacity 0.2s; font-size: 1rem; }
    .btn-icon:hover { opacity: 1; }
    .btn-icon.delete:hover { filter: drop-shadow(0 0 2px red); }

    .msg { color: #475569; line-height: 1.6; margin: 0 0 1.2rem; font-size: 0.95rem; white-space: pre-wrap; }

    .card-meta { display: flex; flex-wrap: wrap; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #f8fafc; }
    .meta-chip { font-size: 0.8rem; padding: 0.3rem 0.7rem; border-radius: 6px; font-weight: 500; }
    .meta-chip.deadline { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .meta-chip.date { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; margin-left: auto; }

    .empty-state { text-align: center; padding: 4rem; color: #64748b; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }
    .empty-state h3 { color: #1e293b; margin-bottom: 0.5rem; }
    .loading-state { text-align: center; padding: 3rem; color: #64748b; }
  `]
})
export class AnnouncementsComponent implements OnInit {
  announcements: any[] = [];
  isLoading = false;
  isSending = false;

  form = { title: '', message: '', deadlineDate: '', deadlineTime: '' };

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadAnnouncements();
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

    // Combine date + time into MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
    let deadline: string | null = null;
    if (this.form.deadlineDate) {
      const time = this.form.deadlineTime || '23:59';
      deadline = `${this.form.deadlineDate} ${time}:00`;
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
        this.form = { title: '', message: '', deadlineDate: '', deadlineTime: '' };
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
