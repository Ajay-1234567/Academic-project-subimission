import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Signal for reactive state management (Angular 17+)
    readonly currentUser = signal<any>(null);

    constructor(private router: Router) {
        // Check localStorage on load
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.currentUser.set(JSON.parse(savedUser));
        }
    }

    login(user: any) {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'student') {
            this.router.navigate(['/student']);
        } else if (user.role === 'faculty') {
            this.router.navigate(['/faculty']);
        } else if (user.role === 'admin') {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate(['/']);
        }
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    isLoggedIn() {
        return !!this.currentUser();
    }

    getUser() {
        return this.currentUser();
    }

    updateUser(user: any) {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
    }
}
