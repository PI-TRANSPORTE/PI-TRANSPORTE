import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';

@Injectable ({
    providedIn: 'root',
})
export class AuthService {
    
    private isAuthenticated = false;

    constructor(private router: Router) {}

    login(username: string, password: string) : boolean {

        if ( username === 'pi@transporte' && password === 'univesp' ) {
            
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }

    logout(): void {
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }
}