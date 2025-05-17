export interface Aluno {
  id?: string;
  nome: string;
  rua: string;
  numero: number;
  bairro: string;
  cidade: string;
  lat: number;
  lon: number;
  created_at?: string;
}