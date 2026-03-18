import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { RegisterComponent } from './pages/register/register.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { FacultyDashboardComponent } from './pages/faculty-dashboard/faculty-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { SubmitProjectComponent } from './pages/submit-project/submit-project.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { StudentNotificationsComponent } from './pages/student-notifications/student-notifications.component';
import { FacultyStudentsComponent } from './pages/faculty-students/faculty-students.component';
import { FacultyGroupsComponent } from './pages/faculty-groups/faculty-groups.component';
import { AdminFacultyOverviewComponent } from './pages/admin-faculty-overview/admin-faculty-overview.component';
import { SectionManagementComponent } from './pages/section-management/section-management.component';
import { AdminProjectsComponent } from './pages/admin-projects/admin-projects.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Protected Routes — Student
    { path: 'student', component: StudentDashboardComponent, canActivate: [authGuard] },
    { path: 'student/submit', component: SubmitProjectComponent, canActivate: [authGuard] },
    { path: 'student/notifications', component: StudentNotificationsComponent, canActivate: [authGuard] },

    // Protected Routes — Faculty
    { path: 'faculty', component: FacultyDashboardComponent, canActivate: [authGuard] },
    { path: 'faculty/announcements', component: AnnouncementsComponent, canActivate: [authGuard] },
    { path: 'faculty/students', component: FacultyStudentsComponent, canActivate: [authGuard] },
    { path: 'faculty/groups', component: FacultyGroupsComponent, canActivate: [authGuard] },

    // Protected Routes — Admin
    { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] },
    {
        path: 'admin/students',
        component: UserManagementComponent,
        canActivate: [authGuard],
        data: { role: 'student' }
    },
    {
        path: 'admin/faculty',
        component: UserManagementComponent,
        canActivate: [authGuard],
        data: { role: 'faculty' }
    },
    { path: 'admin/faculty-overview', component: AdminFacultyOverviewComponent, canActivate: [authGuard] },
    { path: 'admin/sections', component: SectionManagementComponent, canActivate: [authGuard] },
    { path: 'admin/projects', component: AdminProjectsComponent, canActivate: [authGuard] },


    { path: 'projects/:id', component: ProjectDetailsComponent, canActivate: [authGuard] },

    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },

    { path: '**', redirectTo: '' }
];
