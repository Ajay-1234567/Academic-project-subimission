import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:3000/api';

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

    removeFacultyStudent(studentId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/faculty/students/${studentId}`);
    }

    getSubjects(dept?: string, sem?: string, facultyId?: number): Observable<any[]> {
        let url = `${this.apiUrl}/subjects?`;
        if (dept) url += `department=${encodeURIComponent(dept)}&`;
        if (sem) url += `semester=${encodeURIComponent(sem)}&`;
        if (facultyId != null) url += `facultyId=${facultyId}`; // Only append if not null/undefined
        return this.http.get<any[]>(url);
    }

    createSubject(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/subjects`, data);
    }

    deleteSubject(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/subjects/${id}`);
    }
}
