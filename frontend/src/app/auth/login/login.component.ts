import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms'; // Para usar [(ngModel)]
import { CommonModule } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true, // Marca o componente como standalone
  imports: [CommonModule, FormsModule], // Importa os módulos necessários
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/home']); // Redireciona para a página inicial
    } else {
      alert('Usuário ou senha incorretos!');
    }
  }
}