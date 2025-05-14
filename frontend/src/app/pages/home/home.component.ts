import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlunoDialogComponent } from './aluno-dialog/aluno-dialog.component';
import { MapaDialogComponent } from './mapa-dialog/mapa-dialog.component';

interface AlunoNode {
  name: string;
  street?: string;
  house_number?: number;
  district?: string;
  city?: string;
  children?: AlunoNode[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  treeControl = new NestedTreeControl<AlunoNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<AlunoNode>();
  selectedNode: AlunoNode | null = null;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.loadAlunos();
  }

  hasChild = (_: number, node: AlunoNode) => !!node.children && node.children.length > 0;

  loadAlunos() {
  this.dataSource.data = [
    {
      name: 'Ana',
      children: [
        { 
          name: 'R. dos Cactos, 901 - Jd. Brasil, Piracicaba',
          street: 'R. dos Cactos', 
          house_number: 901, 
          district: 'Jd. Brasil', 
          city: 'Piracicaba' 
        }
      ]
    },
    {
      name: 'Carlos',
      children: [
        { 
          name: 'Av. Paulista, 1000 - Centro, São Paulo',
          street: 'Av. Paulista', 
          house_number: 1000, 
          district: 'Centro', 
          city: 'São Paulo' 
        }
      ]
    }
  ];
}

  // ADICIONAR novo aluno
  adicionarAluno(): void {
    const dialogRef = this.dialog.open(AlunoDialogComponent, {
        width: '400px',
        data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            const newAluno: AlunoNode = {
                name: result.nome,
                children: [
                    { 
                        name: `${result.rua}, ${result.numero} - ${result.bairro}, ${result.cidade}`,
                        street: result.rua,
                        house_number: result.numero,
                        district: result.bairro,
                        city: result.cidade
                    }
                ]
            };
            
            this.dataSource.data = [...this.dataSource.data, newAluno];
        }
    });
}

  // EDITAR aluno existente
  editarAluno(): void {
    if (!this.selectedNode || !this.selectedNode.children) return;

    const endereco = this.selectedNode.children[0];
    
    const dialogRef = this.dialog.open(AlunoDialogComponent, {
        width: '400px',
        data: {
            mode: 'edit',
            nome: this.selectedNode.name,
            rua: endereco.street,
            numero: endereco.house_number,
            bairro: endereco.district,
            cidade: endereco.city
        }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result && this.selectedNode) {
            this.selectedNode.name = result.nome;
            if (this.selectedNode.children && this.selectedNode.children[0]) {
                this.selectedNode.children[0].name = `${result.rua}, ${result.numero} - ${result.bairro}, ${result.cidade}`;
                this.selectedNode.children[0].street = result.rua;
                this.selectedNode.children[0].house_number = result.numero;
                this.selectedNode.children[0].district = result.bairro;
                this.selectedNode.children[0].city = result.cidade;
            }
            
            this.dataSource.data = [...this.dataSource.data];
        }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedNode) {
        this.selectedNode.name = result.nome;
        if (this.selectedNode.children && this.selectedNode.children[0]) {
          this.selectedNode.children[0].street = result.rua;
          this.selectedNode.children[0].house_number = result.numero;
          this.selectedNode.children[0].district = result.bairro;
          this.selectedNode.children[0].city = result.cidade;
        }

        // Atualiza a árvore
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  // EXCLUIR aluno
  excluirAluno(): void {
    if (!this.selectedNode) return;

    if (confirm(`Tem certeza que deseja excluir o aluno ${this.selectedNode.name}?`)) {
      this.dataSource.data = this.dataSource.data.filter(
        aluno => aluno.name !== this.selectedNode!.name
      );
      this.selectedNode = null;
    }
  }

  // Selecionar nó
  selecionarNode(node: AlunoNode): void {
    this.selectedNode = node;
  }

  gerarRota(): void {
  if (!this.selectedNode || !this.selectedNode.children) {
    alert('Selecione um aluno primeiro!');
    return;
  }

  // Simulação - você precisará obter as coordenadas reais do aluno
  const studentCoords: [number, number] = [-22.7256, -47.6497]; // Exemplo: Piracicaba
  
  this.dialog.open(MapaDialogComponent, {
    width: '800px',
    height: '600px',
    data: {
      studentName: this.selectedNode.name,
      studentCoords: studentCoords
    }
  });
}

  logout(): void {
    this.authService.logout();
  }
}