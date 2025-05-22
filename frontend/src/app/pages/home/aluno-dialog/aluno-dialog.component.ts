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
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

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
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>{{ data.mode === 'add' ? 'person_add' : 'edit' }}</mat-icon>
        {{ data.mode === 'add' ? 'Adicionar Novo Aluno' : 'Editar Aluno' }}
      </h2>
      
      <mat-divider></mat-divider>
      
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Nome do Aluno</mat-label>
          <input matInput [(ngModel)]="nome" required>
          <mat-icon matSuffix>person</mat-icon>
        </mat-form-field>
        
        <div class="address-row">
          <mat-form-field appearance="outline" floatLabel="always" class="street-field">
            <mat-label>Rua</mat-label>
            <input matInput [(ngModel)]="rua" required>
            <mat-icon matSuffix>home</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" floatLabel="always" class="number-field">
            <mat-label>Número</mat-label>
            <input matInput type="number" [(ngModel)]="numero" required>
          </mat-form-field>
        </div>
        
        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Bairro</mat-label>
          <input matInput [(ngModel)]="bairro" required>
          <mat-icon matSuffix>location_city</mat-icon>
        </mat-form-field>
        
        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Cidade</mat-label>
          <input matInput [(ngModel)]="cidade" required>
          <mat-icon matSuffix>place</mat-icon>
        </mat-form-field>
        
        <div *ngIf="isLoading" class="loading-state">
          <mat-spinner diameter="30"></mat-spinner>
          <span class="loading-text">Validando endereço...</span>
        </div>
        
        <div *ngIf="errorMessage" class="error-state">
          <mat-icon>error_outline</mat-icon>
          <span class="error-text">{{ errorMessage }}</span>
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <div mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()" [disabled]="isLoading">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="isLoading">
          <mat-icon>{{ isLoading ? 'hourglass_top' : 'save' }}</mat-icon>
          {{ isLoading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 24px;
      background-color: #3f51b5;
      color: white;
      margin: 0;
    }
    
    .dialog-title mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .dialog-content {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .address-row {
      display: flex;
      gap: 15px;
    }
    
    .street-field {
      flex: 3;
    }
    
    .number-field {
      flex: 1;
    }
    
    .loading-state {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .loading-text {
      color: #666;
      font-size: 14px;
    }
    
    .error-state {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      background-color: #ffebee;
      border-radius: 4px;
      color: #d32f2f;
    }
    
    .error-state mat-icon {
      font-size: 20px;
    }
    
    .error-text {
      font-size: 14px;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      background-color: #fafafa;
    }
    
    .dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-divider {
      margin: 0 !important;
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
      this.errorMessage = error.message || 'Erro ao salvar aluno. Verifique os dados e tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }
}