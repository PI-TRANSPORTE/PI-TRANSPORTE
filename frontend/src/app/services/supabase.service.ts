import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Aluno {
  id: string;
  nome: string;
  rua: string;
  numero: number;
  bairro: string;
  cidade: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  // Credenciais do Supabase (substitua pelas suas)
  private supabaseUrl = 'https://mkyvfkepflgfkvwjzuof.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reXZma2VwZmxnZmt2d2p6dW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzU0OTMsImV4cCI6MjA2MjE1MTQ5M30.WcbiuAlfXTjMe6URDOOfcrOefHygGO_d5lw6Zrtf9dM';

  constructor() {
    // Inicializa o cliente Supabase
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  // Método para buscar alunos com tratamento de erros
  async getAlunos(): Promise<Aluno[]> {
    const { data, error } = await this.supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar alunos:', error);
      throw error;
    }

    return data || [];
  }

  // Método para adicionar aluno
  async addAluno(aluno: Omit<Aluno, 'id' | 'created_at'>): Promise<Aluno | null> {
    const { data, error } = await this.supabase
      .from('alunos')
      .insert([aluno])
      .select();

    if (error) {
      console.error('Erro ao adicionar aluno:', error);
      throw error;
    }

    return data?.[0] || null;
  }

  // Método para atualizar aluno
  async updateAluno(id: string, updates: Partial<Aluno>): Promise<Aluno | null> {
    const { data, error } = await this.supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }

    return data?.[0] || null;
  }

  // Método para deletar aluno
  async deleteAluno(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar aluno:', error);
      throw error;
    }
  }

  // Método para obter o cliente (útil para autenticação)
  getClient(): SupabaseClient {
    return this.supabase;
  }
}