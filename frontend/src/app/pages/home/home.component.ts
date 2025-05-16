import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlunoDialogComponent } from './aluno-dialog/aluno-dialog.component';
import { MapaDialogComponent } from './mapa-dialog/mapa-dialog.component';
import { SupabaseService } from '../../services/supabase.service';

interface AlunoNode {
  name: string;
  street?: string;
  house_number?: number;
  district?: string;
  city?: string;
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
    MatDialogModule
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
  ) {}

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
      console.error('Erro ao carregar alunos:', error);
      this.dataSource.data = this.getFallbackData();
    } finally {
      this.isLoading = false;
    }
  }

  private mapAlunoToNode(aluno: any): AlunoNode {
    return {
      id: aluno.id,
      name: aluno.nome,
      children: [{
        name: `${aluno.rua}, ${aluno.numero} - ${aluno.bairro}, ${aluno.cidade}`,
        street: aluno.rua,
        house_number: aluno.numero,
        district: aluno.bairro,
        city: aluno.cidade
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
          city: 'Piracicaba'
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
          const alunoData = {
            nome: result.nome,
            rua: result.rua,
            numero: Number(result.numero),
            bairro: result.bairro,
            cidade: result.cidade
          };

          const novoAluno = await this.supabase.addAluno(alunoData);
          
          if (novoAluno) {
            // Adiciona localmente sem recarregar tudo
            this.dataSource.data = [
              ...this.dataSource.data, 
              this.mapAlunoToNode(novoAluno)
            ];
          }
        } catch (error: any) {
          console.error('Erro detalhado:', error);
          alert(`Erro ao adicionar aluno: ${error.message || 'Erro desconhecido'}`);
        }
      }
    });
  }

  async editarAluno(): Promise<void> {
    if (!this.selectedNode?.id || !this.selectedNode.children) return;

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

    dialogRef.afterClosed().subscribe(async result => {
      if (result && this.selectedNode?.id) {
        try {
          const updates = {
            nome: result.nome,
            rua: result.rua,
            numero: Number(result.numero),
            bairro: result.bairro,
            cidade: result.cidade
          };

          await this.supabase.updateAluno(this.selectedNode.id, updates);
          
          // Atualiza localmente
          const index = this.dataSource.data.findIndex(a => a.id === this.selectedNode?.id);
          if (index !== -1) {
            this.dataSource.data[index] = {
              ...this.dataSource.data[index],
              name: updates.nome,
              children: [{
                name: `${updates.rua}, ${updates.numero} - ${updates.bairro}, ${updates.cidade}`,
                street: updates.rua,
                house_number: updates.numero,
                district: updates.bairro,
                city: updates.cidade
              }]
            };
            this.dataSource.data = [...this.dataSource.data];
          }
        } catch (error: any) {
          console.error('Erro ao editar aluno:', error);
          alert(`Erro ao editar aluno: ${error.message || 'Erro desconhecido'}`);
        }
      }
    });
  }

  async excluirAluno(): Promise<void> {
    if (!this.selectedNode?.id) return;

    if (confirm(`Tem certeza que deseja excluir o aluno ${this.selectedNode.name}?`)) {
      try {
        await this.supabase.deleteAluno(this.selectedNode.id);
        
        // Remove localmente
        this.dataSource.data = this.dataSource.data.filter(
          aluno => aluno.id !== this.selectedNode!.id
        );
        this.selectedNode = null;
      } catch (error: any) {
        console.error('Erro ao excluir aluno:', error);
        alert(`Erro ao excluir aluno: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  selecionarNode(node: AlunoNode): void {
    this.selectedNode = node;
  }

gerarRota() {
  const start: [number, number] = [-46.6625, -23.5614]; // [long, lat]
  const end: [number, number] = [-46.6564, -23.5666];
  
  this.dialog.open(MapaDialogComponent, {
    data: {
      studentName: this.selectedNode?.name || 'Teste',
      studentCoords: end,
      startCoords: start 
    }
  });
}

 /* gerarRota(): void {
    if (!this.selectedNode || !this.selectedNode.children) {
      alert('Selecione um aluno primeiro!');
      return;
    }

    const studentCoords: [number, number] = [-22.7256, -47.6497]; // Exemplo: Piracicaba
    
    this.dialog.open(MapaDialogComponent, {
      width: '800px',
      height: '600px',
      data: {
        studentName: this.selectedNode.name,
        studentCoords: studentCoords
      }
    });
  */

  logout(): void {
    this.authService.logout();
  }
}