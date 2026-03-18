import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    getProjects(role: string, userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/projects?role=${role}&userId=${userId}`);
    }

    submitProject(projectData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/projects`, projectData);
    }

    submitEvaluation(evaluationData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/evaluate`, evaluationData);
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    getStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats`);
    }

    getUsers(role?: string): Observable<any[]> {
        const url = role ? `${this.apiUrl}/users?role=${role}` : `${this.apiUrl}/users`;
        return this.http.get<any[]>(url);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${id}`);
    }

    getUserById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${id}`);
    }

    getProjectById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/projects/${id}`);
    }

    updateProfile(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${id}`, data);
    }

    updateProject(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/projects/${id}`, data);
    }

    deleteProject(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/projects/${id}`);
    }

    getAnnouncements(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/announcements`);
    }

    createAnnouncement(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/announcements`, data);
    }

    deleteAnnouncement(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/announcements/${id}`);
    }

    getFacultyStudents(facultyId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/faculty/${facultyId}/students`);
    }

    addFacultyStudent(facultyId: number, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/faculty/${facultyId}/students`, data);
    }

    removeFacultyStudent(facultyId: number, studentId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/faculty/${facultyId}/students/${studentId}`);
    }

    getSubjects(dept?: string, sem?: string, facultyId?: number, branch?: string, domain?: string): Observable<any[]> {
        let url = `${this.apiUrl}/subjects?`;
        if (dept) url += `department=${encodeURIComponent(dept)}&`;
        if (sem) url += `semester=${encodeURIComponent(sem)}&`;
        if (facultyId != null) url += `facultyId=${facultyId}&`;
        if (branch) url += `branch=${encodeURIComponent(branch)}&`;
        if (domain) url += `domain=${encodeURIComponent(domain)}&`;
        return this.http.get<any[]>(url);
    }

    createSubject(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/subjects`, data);
    }

    deleteSubject(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/subjects/${id}`);
    }

    // Group Management
    getFacultyGroups(facultyId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/faculty/${facultyId}/groups`);
    }

    createGroup(facultyId: number, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/faculty/${facultyId}/groups`, data);
    }

    updateGroup(facultyId: number, groupId: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/faculty/${facultyId}/groups/${groupId}`, data);
    }

    deleteGroup(facultyId: number, groupId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/faculty/${facultyId}/groups/${groupId}`);
    }

    getStudentGroup(studentId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/students/${studentId}/group`);
    }

    getGroupProjects(groupId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/projects/group/${groupId}`);
    }

    // Admin: See all faculty + their students
    getAdminFacultyStudents(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/faculty-students`);
    }

    // Sections Management
    getSections(dept?: string, year?: string, branch?: string, domain?: string): Observable<any[]> {
        let url = `${this.apiUrl}/sections?`;
        if (dept) url += `department=${encodeURIComponent(dept)}&`;
        if (year) url += `graduationYear=${encodeURIComponent(year)}&`;
        if (branch) url += `branch=${encodeURIComponent(branch)}&`;
        if (domain) url += `domain=${encodeURIComponent(domain)}`;
        return this.http.get<any[]>(url);
    }

    saveSection(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/sections`, data);
    }

    deleteSection(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/sections/${id}`);
    }

    // Problem Statements
    getProblemStatements(facultyId?: number, branch?: string): Observable<any[]> {
        let url = `${this.apiUrl}/problem-statements?`;
        if (facultyId) url += `facultyId=${facultyId}&`;
        if (branch) url += `branch=${encodeURIComponent(branch)}`;
        return this.http.get<any[]>(url);
    }

    createProblemStatement(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/problem-statements`, data);
    }

    deleteProblemStatement(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/problem-statements/${id}`);
    }
}

