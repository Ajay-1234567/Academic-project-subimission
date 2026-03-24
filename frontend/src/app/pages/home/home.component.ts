import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">

      <!-- ===== NAVBAR ===== -->
      <nav class="navbar">
        <div class="nav-container">
          <div class="logo">
            <img src="logo_t.png" class="college-logo" alt="Centurion University Logo">
            <span class="logo-text">EduPortal</span>
          </div>
          <div class="nav-links">
            <a href="#features" class="nav-link">Features</a>
            <a href="#how-it-works" class="nav-link">How It Works</a>
            <a href="#roles" class="nav-link">Roles</a>
          </div>
          <div class="nav-actions">
            <a routerLink="/login" class="btn-outline-nav">Login</a>
            <a routerLink="/register" class="btn-cta">Get Started</a>
          </div>
        </div>
      </nav>

      <!-- ===== HERO ===== -->
      <section class="hero">
        <div class="hero-badge">🏆 Trusted by leading engineering colleges</div>
        <h1 class="hero-title">
          Academic Project Submission<br>
          <span class="gradient-text">Made Effortless</span>
        </h1>
        <p class="hero-sub">
          A centralized portal for students, faculty, and admins to manage project submissions,
          evaluations, and academic collaboration — all in one place.
        </p>
        <div class="hero-cta">
          <a routerLink="/register" class="btn-primary-lg">Start for Free →</a>
          <a routerLink="/login" class="btn-ghost">I already have an account</a>
        </div>

      </section>

      <!-- ===== FEATURES ===== -->
      <section class="features-section" id="features">
        <div class="section-label">FEATURES</div>
        <h2 class="section-title">Everything you need, all in one portal</h2>
        <p class="section-sub">Built for the modern academic environment with powerful tools for every user.</p>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon" style="background:#ede9fe; color:#7c3aed;">📤</div>
            <h3>Easy Submissions</h3>
            <p>Submit academic projects with title, abstract, GitHub repository link and assigned subject — all in minutes.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:#dcfce7; color:#16a34a;">📊</div>
            <h3>Real-time Grading</h3>
            <p>Faculty can grade, score and provide detailed feedback on submissions. Students see results instantly.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:#fef9c3; color:#ca8a04;">📢</div>
            <h3>Announcements</h3>
            <p>Faculty post deadline notices and project guidelines. Students get notified with a live bell indicator.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:#fee2e2; color:#dc2626;">🗂️</div>
            <h3>Subject Management</h3>
            <p>Faculty define subjects per department and semester. Students see only their relevant topics.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:#e0f2fe; color:#0284c7;">👥</div>
            <h3>Multi-Faculty Support</h3>
            <p>A student can be assigned to multiple faculty members and see all their subjects in one dashboard.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:#fce7f3; color:#db2777;">🛡️</div>
            <h3>Role-Based Access</h3>
            <p>Separate dashboards for Students, Faculty, and Admins — each with the right permissions and views.</p>
          </div>
        </div>
      </section>

      <!-- ===== HOW IT WORKS ===== -->
      <section class="how-section" id="how-it-works">
        <div class="section-label">HOW IT WORKS</div>
        <h2 class="section-title">From submission to evaluation in 4 steps</h2>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Register & Login</h3>
            <p>Students, faculty, and admins create accounts. Admin assigns students to faculty members.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>Browse Subjects</h3>
            <p>Students select their semester to see assigned subjects from their faculty members.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>Submit Project</h3>
            <p>Click a subject, enter project title, abstract and GitHub link. Submit with one click.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-number">4</div>
            <h3>Get Graded</h3>
            <p>Faculty reviews and grades the submission. Students see their score and feedback instantly.</p>
          </div>
        </div>
      </section>

      <!-- ===== ROLES ===== -->
      <section class="roles-section" id="roles">
        <div class="section-label">USER ROLES</div>
        <h2 class="section-title">Designed for every stakeholder</h2>

        <div class="roles-grid">
          <div class="role-card student">
            <div class="role-emoji">🎓</div>
            <h3>Student</h3>
            <ul>
              <li>✅ View assigned faculty & subjects</li>
              <li>✅ Submit projects per subject</li>
              <li>✅ Track scores and feedback</li>
              <li>✅ Receive deadline announcements</li>
              <li>✅ Manage and edit submissions</li>
            </ul>
            <a routerLink="/register" class="role-cta">Join as Student →</a>
          </div>
          <div class="role-card faculty">
            <div class="role-emoji">👨‍🏫</div>
            <h3>Faculty</h3>
            <ul>
              <li>✅ Add and manage subjects</li>
              <li>✅ View assigned students</li>
              <li>✅ Grade project submissions</li>
              <li>✅ Post announcements with deadlines</li>
              <li>✅ Monitor student progress</li>
            </ul>
            <a routerLink="/register" class="role-cta">Join as Faculty →</a>
          </div>
          <div class="role-card admin">
            <div class="role-emoji">🛡️</div>
            <h3>Admin</h3>
            <ul>
              <li>✅ Manage all users</li>
              <li>✅ Assign students to faculty</li>
              <li>✅ Oversee all departments</li>
              <li>✅ Control user roles</li>
              <li>✅ System-wide access</li>
            </ul>
            <a routerLink="/register" class="role-cta">Join as Admin →</a>
          </div>
        </div>
      </section>

      <!-- ===== CTA BANNER ===== -->
      <section class="cta-banner">
        <div class="cta-content">
          <h2>Ready to streamline project evaluation at your institution?</h2>
          <p>Join hundreds of students and faculty already using EduPortal.</p>
          <a routerLink="/register" class="btn-primary-lg white">Get Started Free →</a>
        </div>
      </section>

      <!-- ===== FOOTER ===== -->
      <footer class="footer">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo">
              <img src="logo_t.png" class="footer-logo" alt="College Logo">
              <span class="logo-text">EduPortal</span>
            </div>
            <p>Academic Project Submission &amp; Evaluation Portal — built for the modern university.</p>
          </div>
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#roles">User Roles</a>
          </div>
          <div class="footer-col">
            <h4>Account</h4>
            <a routerLink="/login">Login</a>
            <a routerLink="/register">Register</a>
          </div>

        </div>
        <div class="footer-bottom">
          <span>© 2026 EduPortal — Academic Project Submission Portal. All rights reserved.</span>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page-wrapper {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      min-height: 100vh;
    }

    /* ── NAVBAR ── */
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
    }
    .nav-container {
      max-width: 1200px; margin: 0 auto;
      padding: 0.5rem 2rem;
      min-height: 80px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { display: flex; align-items: center; gap: 0.75rem; }
    .college-logo { width: 68px; height: 68px; object-fit: contain; display: block; }
    .logo-text { font-size: 1.3rem; font-weight: 800; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 2rem; align-items: center; }
    .nav-link { color: #475569; text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
    .nav-link:hover { color: #6366f1; }
    .nav-actions { display: flex; gap: 1rem; align-items: center; }
    .btn-outline-nav { padding: 0.5rem 1.2rem; border: 1.5px solid #cbd5e1; border-radius: 8px; text-decoration: none; color: #475569; font-weight: 500; transition: all 0.2s; }
    .btn-outline-nav:hover { border-color: #6366f1; color: #6366f1; }
    .btn-cta { padding: 0.5rem 1.4rem; background: #6366f1; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
    .btn-cta:hover { background: #4f46e5; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }

    /* ── HERO ── */
    .hero {
      max-width: 800px; margin: 0 auto;
      padding: 6rem 2rem 4rem;
      text-align: center;
    }
    .hero-badge {
      display: inline-block; background: #ede9fe; color: #7c3aed;
      padding: 0.4rem 1.2rem; border-radius: 99px; font-size: 0.85rem; font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .hero-title {
      font-size: 3.5rem; font-weight: 900; line-height: 1.1;
      color: #0f172a; margin-bottom: 1.5rem;
    }
    .gradient-text {
      background: linear-gradient(135deg, #6366f1, #ec4899);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: 1.15rem; color: #64748b; line-height: 1.7;
      max-width: 600px; margin: 0 auto 2.5rem;
    }
    .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3.5rem; }
    .btn-primary-lg {
      padding: 0.9rem 2.2rem; background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; border-radius: 10px; text-decoration: none; font-weight: 700;
      font-size: 1.05rem; transition: all 0.2s;
      box-shadow: 0 8px 20px rgba(99,102,241,0.3);
    }
    .btn-primary-lg:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(99,102,241,0.4); }
    .btn-primary-lg.white { background: white; color: #6366f1; }
    .btn-ghost { padding: 0.9rem 1.8rem; color: #6366f1; text-decoration: none; font-weight: 600; border: 1.5px solid #c7d2fe; border-radius: 10px; transition: all 0.2s; }
    .btn-ghost:hover { background: #ede9fe; }

    .hero-stats {
      display: flex; justify-content: center; align-items: center;
      gap: 2rem; flex-wrap: wrap;
      background: white; border: 1px solid #e2e8f0;
      padding: 1.5rem 3rem; border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .stat-pill { text-align: center; }
    .stat-num { display: block; font-size: 1.8rem; font-weight: 800; color: #6366f1; }
    .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 500; }
    .divider-v { width: 1px; height: 40px; background: #e2e8f0; }

    /* ── SECTION COMMON ── */
    .section-label {
      text-align: center; font-size: 0.8rem; font-weight: 700; letter-spacing: 2px;
      color: #6366f1; margin-bottom: 0.75rem; text-transform: uppercase;
    }
    .section-title { text-align: center; font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem; }
    .section-sub { text-align: center; color: #64748b; font-size: 1.05rem; max-width: 550px; margin: 0 auto 3rem; }

    /* ── FEATURES ── */
    .features-section {
      max-width: 1200px; margin: 0 auto;
      padding: 5rem 2rem;
    }
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;
    }
    .feature-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 2rem; transition: all 0.25s;
    }
    .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); border-color: #c7d2fe; }
    .feature-icon { width: 52px; height: 52px; border-radius: 12px; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; }
    .feature-card h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.6rem; }
    .feature-card p { color: #64748b; font-size: 0.95rem; line-height: 1.6; }

    /* ── HOW IT WORKS ── */
    .how-section {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 5rem 2rem;
    }
    .how-section .section-label { color: #c4b5fd; }
    .how-section .section-title { color: white; }
    .steps-grid {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;
    }
    .step-card {
      background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px; padding: 2rem; text-align: center;
      flex: 1; min-width: 200px; max-width: 220px;
      backdrop-filter: blur(10px);
    }
    .step-number {
      width: 44px; height: 44px; background: white; color: #6366f1;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.2rem; margin: 0 auto 1rem;
    }
    .step-card h3 { color: white; font-size: 1rem; font-weight: 700; margin-bottom: 0.6rem; }
    .step-card p { color: rgba(255,255,255,0.8); font-size: 0.88rem; line-height: 1.6; }
    .step-arrow { font-size: 1.8rem; color: rgba(255,255,255,0.5); }

    /* ── ROLES ── */
    .roles-section {
      max-width: 1200px; margin: 0 auto;
      padding: 5rem 2rem;
    }
    .roles-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;
    }
    .role-card {
      background: white; border-radius: 16px; padding: 2.5rem;
      border: 1px solid #e2e8f0; transition: all 0.25s;
    }
    .role-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
    .role-card.student { border-top: 4px solid #6366f1; }
    .role-card.faculty { border-top: 4px solid #10b981; }
    .role-card.admin { border-top: 4px solid #f59e0b; }
    .role-emoji { font-size: 2.5rem; margin-bottom: 1rem; }
    .role-card h3 { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin-bottom: 1.2rem; }
    .role-card ul { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
    .role-card li { font-size: 0.9rem; color: #475569; }
    .role-cta { display: inline-block; font-weight: 600; font-size: 0.9rem; color: #6366f1; text-decoration: none; transition: gap 0.2s; }
    .role-cta:hover { text-decoration: underline; }

    /* ── CTA BANNER ── */
    .cta-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 5rem 2rem; text-align: center;
    }
    .cta-content { max-width: 600px; margin: 0 auto; }
    .cta-content h2 { font-size: 2rem; font-weight: 800; color: white; margin-bottom: 1rem; }
    .cta-content p { color: #94a3b8; margin-bottom: 2rem; font-size: 1.05rem; }

    /* ── FOOTER ── */
    .footer {
      background: #0f172a; padding: 4rem 2rem 2rem; color: #94a3b8;
    }
    .footer-grid {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem;
      margin-bottom: 3rem;
    }
    .footer-brand p { font-size: 0.9rem; line-height: 1.7; margin-top: 1rem; }
    .footer-brand .logo { display: flex; align-items: center; gap: 0.75rem; }
    .footer-logo { width: 52px; height: 52px; object-fit: contain; }
    .footer-brand .logo-text { font-size: 1.2rem; font-weight: 800; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .footer-col h4 { color: white; font-size: 0.9rem; font-weight: 700; margin-bottom: 1rem; }
    .footer-col { display: flex; flex-direction: column; gap: 0.6rem; }
    .footer-col a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
    .footer-col a:hover { color: #c7d2fe; }
    .footer-bottom {
      max-width: 1200px; margin: 0 auto;
      border-top: 1px solid #1e293b; padding-top: 1.5rem;
      font-size: 0.85rem; color: #475569; text-align: center;
    }

    /* MOBILE RESPONSIVE STYLES */
    @media (max-width: 768px) {
      .nav-container { padding: 1rem; justify-content: center; } /* Center logo */
      .nav-links, .nav-actions { display: none; } /* Hide duplicate top-nav buttons on mobile */
      .college-logo { width: 50px; height: 50px; }
      .logo-text { font-size: 1.4rem; }
      
      .hero { padding: 3rem 1rem 2rem; }
      .hero-title { font-size: 2.2rem; line-height: 1.2; }
      .hero-sub { font-size: 1rem; }
      .hero-cta { flex-direction: column; gap: 1rem; width: 100%; }
      .btn-primary-lg, .btn-ghost { width: 100%; display: block; }
      
      .hero-stats { flex-direction: column; gap: 1.5rem; padding: 1.5rem; }
      .divider-v { display: none; }
      
      .features-section, .roles-section, .how-section, .cta-banner { padding: 3rem 1.5rem; }
      .section-title { font-size: 1.8rem; }
      
      .steps-grid { flex-direction: column; gap: 1rem; }
      .step-card { max-width: 100%; width: 100%; }
      .step-arrow { transform: rotate(90deg); margin: 0.5rem 0; }
      
      .roles-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; gap: 2rem; text-align: center; }
      .footer-brand .logo { justify-content: center; }
    }
  `]
})
export class HomeComponent implements OnInit {
  stats = { students: 0, faculty: 0, projects: 0, departments: 0 };

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any>('/api/stats').subscribe({
      next: (data) => { this.stats = data; },
      error: () => { /* keep zeros on error */ }
    });
  }
}
