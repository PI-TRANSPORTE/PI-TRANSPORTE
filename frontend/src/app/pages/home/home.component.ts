import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true, // Marca o componente como standalone
  imports: [CommonModule], // Importa os módulos necessários
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent {

  // Colunas que serão exibidas na tabela
  displayedColumns: string[] = ['name', 'street', 'house_number', 'district', 'city'];

  // Fonte de dados da tabela
  dataSource = [
    { name: 'Ana', street: 'R. dos Cactos', house_number : 901, district: 'Jd. Brasil', city:'Piracicaba' },
  ];

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}