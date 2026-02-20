import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink],
  template: `
    <app-sidebar role="admin"></app-sidebar>
    <div class="main-layout fade-in">

      <!-- Header -->
      <header class="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="subtitle">Welcome back — here's your system overview</p>
        </div>
        <div class="header-time">{{ today }}</div>
      </header>

      <!-- Stat Cards -->
      <div class="stats-grid" *ngIf="stats; else loadingTpl">
        <div class="stat-card indigo">
          <div class="stat-left">
            <span class="stat-label">Total Students</span>
            <span class="stat-value">{{ stats.students }}</span>
            <span class="stat-hint">Registered students</span>
          </div>
          <div class="stat-emoji">🎓</div>
        </div>

        <div class="stat-card pink">
          <div class="stat-left">
            <span class="stat-label">Total Faculty</span>
            <span class="stat-value">{{ stats.faculty }}</span>
            <span class="stat-hint">Faculty members</span>
          </div>
          <div class="stat-emoji">👨‍🏫</div>
        </div>

        <div class="stat-card green">
          <div class="stat-left">
            <span class="stat-label">Total Projects</span>
            <span class="stat-value">{{ stats.projects }}</span>
            <span class="stat-hint">Project submissions</span>
          </div>
          <div class="stat-emoji">📁</div>
        </div>
      </div>
      <ng-template #loadingTpl>
        <div class="loading-msg">
          <div class="spinner"></div>
          <span>Loading dashboard...</span>
        </div>
      </ng-template>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2 class="section-heading">Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/admin/students" class="action-card blue">
            <div class="action-icon">🎓</div>
            <div class="action-text">
              <strong>Manage Students</strong>
              <span>View, add or remove students</span>
            </div>
            <div class="action-arrow">→</div>
          </a>
          <a routerLink="/admin/faculty" class="action-card purple">
            <div class="action-icon">👨‍🏫</div>
            <div class="action-text">
              <strong>Manage Faculty</strong>
              <span>View and assign faculty members</span>
            </div>
            <div class="action-arrow">→</div>
          </a>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section">
        <h2 class="section-heading">Recent Activity</h2>
        <div class="activity-card" *ngIf="stats?.activity?.length; else noActivity">
          <div *ngFor="let act of stats.activity" class="activity-row">
            <div class="act-icon" [ngClass]="act.type === 'New User' ? 'user-icon' : 'proj-icon'">
              {{ act.type === 'New User' ? '👤' : '📄' }}
            </div>
            <div class="act-body">
              <span class="act-type">{{ act.type }}</span>
              <span class="act-detail">{{ act.detail }}</span>
            </div>
            <span class="act-id">#{{ act.id }}</span>
          </div>
        </div>
        <ng-template #noActivity>
          <div class="empty-activity">
            <div class="empty-icon">📋</div>
            <p>No recent activity to show.</p>
          </div>
        </ng-template>
      </section>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

    .main-layout { margin-left: 250px; padding: 2.5rem; background: #f8fafc; min-height: 100vh; }
    @media (max-width: 768px) { .main-layout { margin-left: 0; padding: 1.5rem; } }

    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2.5rem;
    }
    h1 {
      font-size: 2rem; font-weight: 800; color: #0f172a;
      margin: 0 0 0.3rem;
    }
    .subtitle { color: #64748b; font-size: 1rem; margin: 0; }
    .header-time { 
      font-size: 0.85rem; color: #94a3b8; font-weight: 500;
      background: white; border: 1px solid #e2e8f0; 
      padding: 0.4rem 1rem; border-radius: 8px;
    }

    /* Stat Cards */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    
    .stat-card {
      background: white; border-radius: 16px; padding: 1.8rem 2rem;
      display: flex; justify-content: space-between; align-items: center;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: all 0.25s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
    .stat-card.indigo { border-top: 4px solid #6366f1; }
    .stat-card.pink   { border-top: 4px solid #ec4899; }
    .stat-card.green  { border-top: 4px solid #10b981; }

    .stat-left { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 0.4rem; }
    .stat-value { font-size: 2.8rem; font-weight: 800; color: #0f172a; line-height: 1; margin-bottom: 0.3rem; }
    .stat-hint { font-size: 0.8rem; color: #94a3b8; }
    .stat-emoji { font-size: 2.5rem; background: #f8fafc; padding: 0.8rem; border-radius: 12px; }

    /* Section Heading */
    .section-heading { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 1rem; }

    /* Quick Actions */
    .quick-actions { margin-bottom: 2.5rem; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }

    .action-card {
      display: flex; align-items: center; gap: 1rem;
      background: white; border: 1px solid #e2e8f0;
      border-radius: 14px; padding: 1.4rem 1.5rem;
      text-decoration: none; color: inherit;
      transition: all 0.25s;
    }
    .action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-color: #a5b4fc; }
    .action-card.blue { border-left: 4px solid #6366f1; }
    .action-card.purple { border-left: 4px solid #8b5cf6; }

    .action-icon { font-size: 1.8rem; background: #f8fafc; padding: 0.6rem; border-radius: 10px; }
    .action-text { flex: 1; display: flex; flex-direction: column; }
    .action-text strong { font-size: 1rem; font-weight: 700; color: #1e293b; }
    .action-text span { font-size: 0.83rem; color: #64748b; margin-top: 0.15rem; }
    .action-arrow { font-size: 1.3rem; color: #94a3b8; transition: transform 0.2s; }
    .action-card:hover .action-arrow { transform: translateX(4px); color: #6366f1; }

    /* Activity */
    .activity-section { }
    .activity-card {
      background: white; border: 1px solid #e2e8f0;
      border-radius: 14px; overflow: hidden;
    }

    .activity-row {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;
    }
    .activity-row:last-child { border-bottom: none; }
    .activity-row:hover { background: #f8fafc; }

    .act-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; flex-shrink: 0;
    }
    .user-icon { background: #ede9fe; }
    .proj-icon { background: #dcfce7; }

    .act-body { flex: 1; display: flex; flex-direction: column; }
    .act-type { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.7px; }
    .act-detail { font-size: 0.95rem; color: #1e293b; font-weight: 500; }
    .act-id { color: #94a3b8; font-size: 0.8rem; font-family: monospace; }

    .empty-activity {
      text-align: center; padding: 4rem 2rem;
      background: white; border-radius: 14px; border: 1px dashed #cbd5e1;
      color: #94a3b8;
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.5; }
    .empty-activity p { margin: 0; }

    /* Loading */
    .loading-msg { display: flex; align-items: center; gap: 1rem; color: #64748b; padding: 2rem; }
    .spinner {
      width: 24px; height: 24px; border: 3px solid #e2e8f0;
      border-top-color: #6366f1; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.3s ease; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  private apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Failed to load admin stats', err)
    });
  }
}
