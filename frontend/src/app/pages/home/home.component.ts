import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { NestedTreeControl } from '@angular/cdk/tree';
import { AlunoDialogComponent } from './aluno-dialog/aluno-dialog.component';
import { MapaDialogComponent } from './mapa-dialog/mapa-dialog.component';
import { SupabaseService } from '../../services/supabase.service';
import { Aluno } from '../../models/aluno.model';

interface AlunoNode {
  name: string;
  street?: string;
  house_number?: number;
  district?: string;
  city?: string;
  lat?: number;
  lon?: number;
  children?: AlunoNode[];
  id?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit {
  treeControl = new NestedTreeControl<AlunoNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<AlunoNode>();
  selectedNode: AlunoNode | null = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private supabase: SupabaseService
  ) {
    this.treeControl.collapseAll();
  }

  async ngOnInit() {
    await this.loadAlunos();
  }

  hasChild = (_: number, node: AlunoNode) => !!node.children && node.children.length > 0;


  async loadAlunos() {
    this.isLoading = true;
    try {
      const alunos = await this.supabase.getAlunos();
      this.dataSource.data = alunos.map(aluno => this.mapAlunoToNode(aluno));
    } catch (error) {
      this.dataSource.data = this.getFallbackData();
    } finally {
      this.isLoading = false;
    }
  }

  private mapAlunoToNode(aluno: Aluno): AlunoNode {
    return {
      id: aluno.id,
      name: aluno.nome,
      lat: aluno.lat,
      lon: aluno.lon,
      children: [{
        name: `${aluno.rua}, ${aluno.numero} - ${aluno.bairro}, ${aluno.cidade}`,
        street: aluno.rua,
        house_number: aluno.numero,
        district: aluno.bairro,
        city: aluno.cidade,
        lat: aluno.lat,
        lon: aluno.lon
      }]
    };
  }

  private getFallbackData(): AlunoNode[] {
    return [
      {
        name: 'Ana',
        children: [{
          name: 'R. dos Cactos, 901 - Jd. Brasil, Piracicaba',
          street: 'R. dos Cactos',
          house_number: 901,
          district: 'Jd. Brasil',
          city: 'Piracicaba',
          lat: -22.7256,
          lon: -47.6497
        }]
      }
    ];
  }

  async adicionarAluno(): Promise<void> {
    const dialogRef = this.dialog.open(AlunoDialogComponent, {
      width: '400px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          // A adição agora é tratada completamente pelo AlunoDialogComponent
          await this.loadAlunos(); // Recarrega a lista
        } catch (error: any) {
          alert(`Erro ao adicionar aluno: ${error.message || 'Erro desconhecido'}`);
        }
      }
    });
  }

  async editarAluno(): Promise<void> {
    if (!this.selectedNode?.id) return;

    const alunoOriginal = await this.supabase.getAlunoById(this.selectedNode.id);

    const dialogRef = this.dialog.open(AlunoDialogComponent, {
      width: '400px',
      data: {
        mode: 'edit',
        aluno: alunoOriginal // Passa o objeto aluno completo
      }
    });

    dialogRef.afterClosed().subscribe(async updated => {
      if (updated) {
        await this.loadAlunos(); // Recarrega a lista após edição
        this.selectedNode = null;
      }
    });
  }

  async excluirAluno(): Promise<void> {
    if (!this.selectedNode?.id) return;

    if (confirm(`Tem certeza que deseja excluir o aluno ${this.selectedNode.name}?`)) {
      try {
        await this.supabase.deleteAluno(this.selectedNode.id);
        await this.loadAlunos(); // Recarrega a lista após exclusão
        this.selectedNode = null;
      } catch (error: any) {
        alert(`Erro ao excluir aluno: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  selecionarNode(node: AlunoNode): void {
    this.selectedNode = node;
  }

  gerarRota(): void {
    if (!this.selectedNode || !this.selectedNode.children || !this.selectedNode.lat || !this.selectedNode.lon) {
      alert('Selecione um aluno com localização válida primeiro!');
      return;
    }

    // Coordenadas do aluno (latitude, longitude)
    const studentCoords: [number, number] = [this.selectedNode.lat, this.selectedNode.lon];

    // Exemplo: Coordenadas de partida (pode ser dinâmico no futuro)
    const startCoords: [number, number] = [-22.900983, -47.057963];

    this.dialog.open(MapaDialogComponent, {
      width: '800px',
      height: '600px',
      data: {
        studentName: this.selectedNode.name,
        studentCoords: studentCoords,
        startCoords: startCoords
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}