import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Aluno } from '../models/aluno.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://mkyvfkepflgfkvwjzuof.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reXZma2VwZmxnZmt2d2p6dW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzU0OTMsImV4cCI6MjA2MjE1MTQ5M30.WcbiuAlfXTjMe6URDOOfcrOefHygGO_d5lw6Zrtf9dM'
    );
  }

  // Método para buscar todos os alunos
  async getAlunos(): Promise<Aluno[]> {
    const { data, error } = await this.supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar alunos:', error);
      throw new Error('Falha ao carregar alunos');
    }

    return data || [];
  }

  // Método para buscar um aluno específico por ID
  async getAlunoById(id: string): Promise<Aluno> {
    const { data, error } = await this.supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar aluno:', error);
      throw new Error('Aluno não encontrado');
    }

    return data;
  }

  // Método para adicionar aluno
  async addAluno(aluno: Omit<Aluno, 'id' | 'created_at'>): Promise<Aluno> {
    // Validação básica dos dados
    if (!aluno.lat || !aluno.lon) {
      throw new Error('Coordenadas geográficas são obrigatórias');
    }

    const { data, error } = await this.supabase
      .from('alunos')
      .insert(aluno)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar aluno:', error);
      throw new Error('Falha ao cadastrar aluno');
    }

    return data;
  }

  // Método para atualizar aluno
  async updateAluno(id: string, updates: Partial<Aluno>): Promise<Aluno> {
    // Não permitir atualização para null nas coordenadas
    if (updates.lat === null || updates.lon === null) {
      throw new Error('Coordenadas geográficas são obrigatórias');
    }

    const { data, error } = await this.supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw new Error('Falha ao atualizar aluno');
    }

    return data;
  }

  // Método para deletar aluno
  async deleteAluno(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar aluno:', error);
      throw new Error('Falha ao excluir aluno');
    }
  }
}