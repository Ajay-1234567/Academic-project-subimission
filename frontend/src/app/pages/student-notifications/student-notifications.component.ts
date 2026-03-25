import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-student-notifications',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <app-sidebar role="student"></app-sidebar>
    <div class="main-layout fade-in">

      <header class="header">
        <div>
          <h1>🔔 Notifications</h1>
          <p>Deadline reminders and announcements from your faculty</p>
        </div>
        <div class="header-stats">
          <span class="stat-pill active-pill">{{ activeCount }} Active</span>
          <span class="stat-pill urgent-pill" *ngIf="urgentCount > 0">{{ urgentCount }} Due Soon!</span>
        </div>
      </header>

      <div *ngIf="isLoading" class="loading-state">Loading notifications...</div>

      <div *ngIf="!isLoading && announcements.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No Announcements Yet</h3>
        <p>Your faculty hasn't posted any notifications. Check back later.</p>
      </div>

      <div class="notifications-list" *ngIf="!isLoading">
        <div *ngFor="let a of announcements"
             class="notif-card"
             [class.card-urgent]="isUrgent(a.deadline)"
             [class.card-expired]="isExpired(a.deadline)">

          <!-- Card Header -->
          <div class="card-header">
            <div class="left">
              <span class="pulse-dot" *ngIf="!isExpired(a.deadline) && a.deadline"></span>
              <span class="notif-icon">{{ isExpired(a.deadline) ? '✅' : (isUrgent(a.deadline) ? '🚨' : '📣') }}</span>
              <h3 class="notif-title">{{ a.title }}</h3>
            </div>
            <span class="status-badge"
                  [class.badge-active]="!a.deadline && !isExpired(a.deadline)"
                  [class.badge-urgent]="isUrgent(a.deadline)"
                  [class.badge-expired]="isExpired(a.deadline)"
                  [class.badge-normal]="a.deadline && !isUrgent(a.deadline) && !isExpired(a.deadline)">
              {{ isExpired(a.deadline) ? '✅ Closed' : (isUrgent(a.deadline) ? '🔥 Due Soon!' : '🟢 Active') }}
            </span>
          </div>

          <!-- Message -->
          <p class="notif-msg">{{ a.message }}</p>

          <!-- Deadline Block — always visible -->
          <div class="deadline-block" [class.no-deadline]="!a.deadline" [class.expired-block]="isExpired(a.deadline)">

            <div *ngIf="!a.deadline" class="no-deadline-msg">
              <span>📅 No deadline set for this announcement</span>
            </div>

            <div *ngIf="a.deadline">
              <div class="deadline-header">
                <span class="dl-label">📅 Project Deadline</span>
                <strong class="dl-date">{{ a.deadline | date:'MMMM d, y':'UTC' }}</strong>
              </div>

              <!-- Live Countdown -->
              <div *ngIf="!isExpired(a.deadline)" class="countdown-row">
                <div class="countdown-unit" *ngFor="let unit of getCountdown(a.deadline)"
                     [class.unit-urgent]="isUrgent(a.deadline)">
                  <span class="num">{{ unit.value }}</span>
                  <span class="lbl">{{ unit.label }}</span>
                </div>
                <span class="remaining-label">remaining</span>
              </div>

              <div *ngIf="isExpired(a.deadline)" class="expired-msg">
                <span>🚫 This deadline has passed.</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="card-footer">
            <span class="poster">Posted by <strong>{{ a.facultyName }}</strong></span>
            <span class="posted-time">{{ a.createdAt | date:'medium' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { margin-left: 250px; padding: 2rem; }
    @media (max-width: 1024px) { .main-layout { margin-left: 0; padding: 5rem 1.25rem 2rem; } }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    h1 { font-size: 2.5rem; background: linear-gradient(to right, #fbbf24, #f59e0b);
         -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
    .header p { color: var(--text-secondary); margin: 0; }
    .header-stats { display: flex; gap: 0.5rem; align-items: center; }
    .stat-pill { padding: 0.35rem 1rem; border-radius: 99px; font-size: 0.85rem; font-weight: 600; }
    .active-pill { background: rgba(34,197,94,0.2); color: #4ade80; }
    .urgent-pill { background: rgba(239,68,68,0.2); color: #f87171; animation: pulse-badge 1s infinite; }
    @keyframes pulse-badge { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

    .notifications-list { max-width: 900px; display: flex; flex-direction: column; gap: 1.2rem; }

    /* Cards */
    .notif-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
                  border-radius: 16px; padding: 1.75rem;
                  border-left: 4px solid #6366f1;
                  transition: transform 0.2s; }
    .notif-card:hover { transform: translateX(5px); }
    .notif-card.card-urgent { border-left-color: #ef4444; box-shadow: 0 0 25px rgba(239,68,68,0.15); }
    .notif-card.card-expired { border-left-color: #374151; opacity: 0.7; }

    /* Header */
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem; }
    .left { display: flex; align-items: center; gap: 0.65rem; }
    .notif-icon { font-size: 1.4rem; }
    .notif-title { margin: 0; font-size: 1.15rem; font-weight: 600; }

    .pulse-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; flex-shrink: 0;
                 animation: pulse-dot 1.5s infinite; }
    @keyframes pulse-dot {
      0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
      70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }

    /* Status badges */
    .status-badge { padding: 0.3rem 0.9rem; border-radius: 99px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
    .badge-active, .badge-normal { background: rgba(99,102,241,0.2); color: #818cf8; }
    .badge-urgent { background: rgba(239,68,68,0.2); color: #f87171; }
    .badge-expired { background: rgba(75,85,99,0.3); color: #9ca3af; }

    .notif-msg { color: var(--text-secondary); line-height: 1.7; margin: 0 0 1.2rem; }

    /* Deadline block */
    .deadline-block { border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.2rem;
                      background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); }
    .deadline-block.no-deadline { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06); }
    .deadline-block.expired-block { background: rgba(75,85,99,0.1); border-color: rgba(75,85,99,0.3); }

    .no-deadline-msg { color: var(--text-secondary); font-style: italic; font-size: 0.9rem; }

    .deadline-header { display: flex; flex-wrap: wrap; justify-content: space-between; 
                       align-items: center; gap: 0.5rem; margin-bottom: 0.9rem; }
    .dl-label { color: var(--text-secondary); font-size: 0.88rem; }
    .dl-date { color: white; }

    /* Countdown */
    .countdown-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .countdown-unit { text-align: center; background: rgba(99,102,241,0.2);
                      border-radius: 10px; padding: 0.5rem 0.9rem; min-width: 58px; }
    .countdown-unit.unit-urgent { background: rgba(239,68,68,0.2); }
    .countdown-unit .num { display: block; font-size: 1.7rem; font-weight: 700;
                           color: #818cf8; line-height: 1; }
    .countdown-unit.unit-urgent .num { color: #f87171; }
    .countdown-unit .lbl { display: block; font-size: 0.65rem; color: var(--text-secondary);
                           text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .remaining-label { color: var(--text-secondary); font-size: 0.85rem; }

    .expired-msg { color: #f87171; font-size: 0.9rem; }

    /* Footer */
    .card-footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;
                   padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.07);
                   color: var(--text-secondary); font-size: 0.8rem; }
    .card-footer strong { color: white; }

    .loading-state, .empty-state { text-align: center; padding: 4rem; color: var(--text-secondary); }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h3 { color: white; }
  `]
})
export class StudentNotificationsComponent implements OnInit, OnDestroy {
  announcements: any[] = [];
  isLoading = false;
  private timer: any;
  private cdr = inject(ChangeDetectorRef);
  private apiService = inject(ApiService);

  get activeCount() { return this.announcements.filter(a => !this.isExpired(a.deadline)).length; }
  get urgentCount() { return this.announcements.filter(a => this.isUrgent(a.deadline)).length; }

  ngOnInit() {
    this.loadNotifications();
    // Refresh countdown every second
    this.timer = setInterval(() => this.cdr.markForCheck(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  loadNotifications() {
    this.isLoading = true;
    this.apiService.getAnnouncements().subscribe({
      next: (data) => { this.announcements = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  isExpired(deadline: string | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  }

  isUrgent(deadline: string | null): boolean {
    if (!deadline || this.isExpired(deadline)) return false;
    return (new Date(deadline).getTime() - Date.now()) < 48 * 60 * 60 * 1000;
  }

  getCountdown(deadline: string): { value: number; label: string }[] {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return [];
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return [
      { value: days, label: 'Days' },
      { value: hours, label: 'Hrs' },
      { value: mins, label: 'Min' },
      { value: secs, label: 'Sec' },
    ];
  }
}
