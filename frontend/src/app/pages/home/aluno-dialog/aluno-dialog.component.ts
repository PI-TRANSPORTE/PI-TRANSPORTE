import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-aluno-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Adicionar' : 'Editar' }} Aluno</h2>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput [(ngModel)]="nome" placeholder="Nome do Aluno">
      </mat-form-field>
      <mat-form-field>
        <input matInput [(ngModel)]="rua" placeholder="Rua">
      </mat-form-field>
      <mat-form-field>
        <input matInput type="number" [(ngModel)]="numero" placeholder="Número">
      </mat-form-field>
      <mat-form-field>
        <input matInput [(ngModel)]="bairro" placeholder="Bairro">
      </mat-form-field>
      <mat-form-field>
        <input matInput [(ngModel)]="cidade" placeholder="Cidade">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="primary" (click)="onSave()">Salvar</button>
    </div>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }
  `]
})
export class AlunoDialogComponent {
  nome: string = '';
  rua: string = '';
  numero: number | null = null;
  bairro: string = '';
  cidade: string = '';

  constructor(
    public dialogRef: MatDialogRef<AlunoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.mode === 'edit') {
      this.nome = data.nome;
      this.rua = data.rua;
      this.numero = data.numero;
      this.bairro = data.bairro;
      this.cidade = data.cidade;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      nome: this.nome,
      rua: this.rua,
      numero: this.numero,
      bairro: this.bairro,
      cidade: this.cidade
    });
  }
}