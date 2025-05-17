import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupabaseService } from '../../../services/supabase.service';
import { GeocodingService } from '../../../services/geocoding.service';

// Defina a interface Aluno aqui ou importe de onde ela está definida
export interface Aluno {
  id: string;
  nome: string;
  rua: string;
  numero: number;
  bairro: string;
  cidade: string;
  lat: number;
  lon: number;
  created_at?: string;
}

@Component({
  selector: 'app-aluno-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Adicionar' : 'Editar' }} Aluno</h2>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput [(ngModel)]="nome" placeholder="Nome do Aluno" required>
      </mat-form-field>
      <mat-form-field>
        <input matInput [(ngModel)]="rua" placeholder="Rua" required>
      </mat-form-field>
      <mat-form-field>
        <input matInput type="number" [(ngModel)]="numero" placeholder="Número" required>
      </mat-form-field>
      <mat-form-field>
        <input matInput [(ngModel)]="bairro" placeholder="Bairro" required>
      </mat-form-field>
      <mat-form-field>
        <input matInput [(ngModel)]="cidade" placeholder="Cidade" required>
      </mat-form-field>
      
      <div *ngIf="isLoading" class="spinner-container">
        <mat-spinner diameter="30"></mat-spinner>
        <span>Validando endereço...</span>
      </div>
      
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()" [disabled]="isLoading">Cancelar</button>
      <button mat-button color="primary" (click)="onSave()" [disabled]="isLoading">
        {{ isLoading ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }
    .spinner-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
    }
    .error-message {
      color: #f44336;
      margin: 10px 0;
      font-size: 14px;
    }
  `]
})


export class AlunoDialogComponent {
  nome: string = '';
  rua: string = '';
  numero: number | null = null;
  bairro: string = '';
  cidade: string = '';
  isLoading = false;
  errorMessage = '';
  alunoId: string | null = null;
  originalAluno: any = null; // Armazena os dados originais para comparação

  constructor(
    public dialogRef: MatDialogRef<AlunoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private supabaseService: SupabaseService,
    private geocodingService: GeocodingService,
    private snackBar: MatSnackBar
  ) {
    if (data.mode === 'edit' && data.aluno) {
      this.originalAluno = {...data.aluno}; // Cria cópia dos dados originais
      this.alunoId = data.aluno.id;
      this.nome = data.aluno.nome;
      this.rua = data.aluno.rua;
      this.numero = data.aluno.numero;
      this.bairro = data.aluno.bairro;
      this.cidade = data.aluno.cidade;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onSave(): Promise<void> {
    // Validação básica dos campos
    if (!this.nome || !this.rua || this.numero === null || !this.bairro || !this.cidade) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Verifica se o endereço foi alterado (para edição)
      const enderecoMudou = this.data.mode === 'edit' && (
        this.rua !== this.originalAluno.rua ||
        this.numero !== this.originalAluno.numero ||
        this.bairro !== this.originalAluno.bairro ||
        this.cidade !== this.originalAluno.cidade
      );

      let coords: [number, number];
      
      if (this.data.mode === 'edit' && !enderecoMudou) {
        // Reutiliza coordenadas existentes se o endereço não mudou
        coords = [this.originalAluno.lat, this.originalAluno.lon];
      } else {
        // Geocodifica novo endereço (para novo aluno ou endereço alterado)
        const enderecoCompleto = `${this.rua}, ${this.numero}, ${this.bairro}, ${this.cidade}, Brasil`;
        coords = await this.geocodingService.addressToCoords(enderecoCompleto);
      }

      // Prepara os dados completos do aluno
      const alunoData: Omit<Aluno, 'id' | 'created_at'> = {
        nome: this.nome,
        rua: this.rua,
        numero: this.numero,
        bairro: this.bairro,
        cidade: this.cidade,
        lat: coords[0],
        lon: coords[1]
      };

      // Salva no Supabase
      if (this.data.mode === 'edit' && this.alunoId) {
        await this.supabaseService.updateAluno(this.alunoId, alunoData);
        this.snackBar.open('Aluno atualizado com sucesso!', 'Fechar', { duration: 3000 });
      } else {
        await this.supabaseService.addAluno(alunoData);
        this.snackBar.open('Aluno adicionado com sucesso!', 'Fechar', { duration: 3000 });
      }

      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Erro ao salvar aluno:', error);
      this.errorMessage = error.message || 'Erro ao salvar aluno. Verifique os dados e tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }
}