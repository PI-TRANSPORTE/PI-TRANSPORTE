import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard'

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] }, // Protege a rota
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // Rota padrão
    { path: '**', redirectTo: '/login' }, // Rota de fallback
];
