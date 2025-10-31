/**
 * Central Type Definitions for SportManager
 * Provides strong typing across the application
 */

/**
 * Database Enums
 */
export type UserProfile = 'organizador' | 'atleta' | 'arbitro' | 'visitante';
export type EventStatus = 'inscricoes_abertas' | 'em_andamento' | 'finalizado' | 'cancelado';
export type InscriptionStatus = 'pendente' | 'aprovada' | 'rejeitada';
export type SportModality =
  | 'futebol'
  | 'volei'
  | 'basquete'
  | 'futsal'
  | 'handebol'
  | 'tenis'
  | 'natacao'
  | 'atletismo';

export type UserRole = 'admin' | 'organizador' | 'responsavel' | 'atleta';

/**
 * Core Entities
 */
export interface Profile {
  id: string;
  nome: string;
  email: string;
  perfil: UserProfile;
  telefone: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  foto_url: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleEntry {
  id: string;
  user_id: string;
  role: UserRole;
  equipe_id: string | null;
  created_at: string;
}

export interface Evento {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  modalidade: SportModality;
  categorias: string[];
  status: EventStatus;
  banner_url: string | null;
  regulamento_url: string | null;
  organizador_id: string;
  numero_equipes: number;
  limite_equipes: number | null;
  inscricoes_abertas: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipe {
  id: string;
  nome: string;
  tecnico: string | null;
  modalidade: SportModality;
  categoria: string;
  evento_id: string | null;
  cidade: string | null;
  estadio_casa: string | null;
  ano_fundacao: number | null;
  logo_url: string | null;
  uniforme_principal: UniformeConfig | null;
  uniforme_alternativo: UniformeConfig | null;
  estatisticas: EstatisticasEquipe | null;
  ativa: boolean;
  numero_atletas: number;
  limite_atletas: number | null;
  responsavel_id: string | null;
  created_at: string;
}

export interface UniformeConfig {
  cor_camisa: string;
  cor_shorts: string;
  cor_meiao: string;
  numero_cor: string;
}

export interface EstatisticasEquipe {
  vitorias?: number;
  empates?: number;
  derrotas?: number;
  gols_pro?: number;
  gols_contra?: number;
  jogos?: number;
}

export interface Atleta {
  id: string;
  nome: string;
  data_nascimento: string;
  cpf: string | null;
  rg: string | null;
  categoria: string;
  posicao: string | null;
  numero_uniforme: number | null;
  altura: number | null;
  peso: number | null;
  pe_dominante: 'direito' | 'esquerdo' | 'ambos' | null;
  foto_url: string | null;

  // Health information
  tipo_sanguineo: string | null;
  alergias: string | null;
  medicamentos: string | null;
  contato_emergencia: string | null;
  telefone_emergencia: string | null;

  // Registration
  user_id: string | null;
  responsavel_id: string | null;
  ativo: boolean;

  // Metadata
  avaliacoes: AvaliacoesAtleta | null;
  historico: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvaliacoesAtleta {
  velocidade?: number;
  resistencia?: number;
  forca?: number;
  tecnica?: number;
  tatica?: number;
}

export interface EquipeAtleta {
  id: string;
  equipe_id: string;
  atleta_id: string;
  data_entrada: string;
  data_saida: string | null;
  ativo: boolean;
  numero_uniforme: number | null;
  posicao: string | null;
  titular: boolean;
}

export interface Partida {
  id: string;
  evento_id: string;
  equipe_a_id: string;
  equipe_b_id: string;
  placar_a: number;
  placar_b: number;
  data_hora: string;
  local: string | null;
  finalizada: boolean;
  fase: string | null;
  grupo: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Inscricao {
  id: string;
  evento_id: string;
  equipe_id: string;
  categoria: string;
  status: InscriptionStatus;
  data_inscricao: string;
  observacoes: string | null;
  created_at: string;
}

export interface Ranking {
  id: string;
  evento_id: string;
  equipe_id: string;
  categoria: string;
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo_gols: number;
  jogos: number;
  aproveitamento: number;
  posicao: number | null;
  updated_at: string;
}

export interface ComentarioPartida {
  id: string;
  partida_id: string;
  user_id: string;
  comentario: string;
  created_at: string;
}

export interface AthleteInviteToken {
  id: string;
  token: string;
  equipe_id: string;
  email: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface ManagerInviteToken {
  id: string;
  token: string;
  email: string;
  role: UserRole;
  expires_at: string;
  used: boolean;
  created_by: string;
  created_at: string;
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Form Types
 */
export interface EventoFormData {
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  local?: string;
  modalidade: SportModality;
  categorias: string[];
  limite_equipes?: number;
  banner_url?: string;
  regulamento_url?: string;
}

export interface EquipeFormData {
  nome: string;
  tecnico?: string;
  modalidade: SportModality;
  categoria: string;
  cidade?: string;
  estadio_casa?: string;
  ano_fundacao?: number;
  limite_atletas?: number;
  uniforme_principal?: UniformeConfig;
  uniforme_alternativo?: UniformeConfig;
}

export interface AtletaFormData {
  nome: string;
  data_nascimento: string;
  cpf?: string;
  rg?: string;
  categoria: string;
  posicao?: string;
  numero_uniforme?: number;
  altura?: number;
  peso?: number;
  pe_dominante?: 'direito' | 'esquerdo' | 'ambos';
  tipo_sanguineo?: string;
  alergias?: string;
  medicamentos?: string;
  contato_emergencia?: string;
  telefone_emergencia?: string;
}

export interface PartidaFormData {
  evento_id: string;
  equipe_a_id: string;
  equipe_b_id: string;
  data_hora: string;
  local?: string;
  fase?: string;
  grupo?: string;
}

/**
 * Filter Types
 */
export interface EventoFilters {
  modalidade?: SportModality;
  status?: EventStatus;
  categoria?: string;
  search?: string;
}

export interface EquipeFilters {
  modalidade?: SportModality;
  categoria?: string;
  evento_id?: string;
  ativa?: boolean;
  search?: string;
}

export interface AtletaFilters {
  categoria?: string;
  posicao?: string;
  equipe_id?: string;
  ativo?: boolean;
  search?: string;
}

export interface PartidaFilters {
  evento_id?: string;
  equipe_id?: string;
  finalizada?: boolean;
  fase?: string;
  grupo?: string;
  data_inicio?: string;
  data_fim?: string;
}

/**
 * Utility Types
 */
export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialField<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

/**
 * Constants
 */
export const SPORT_MODALITIES: readonly SportModality[] = [
  'futebol',
  'volei',
  'basquete',
  'futsal',
  'handebol',
  'tenis',
  'natacao',
  'atletismo',
] as const;

export const EVENT_STATUSES: readonly EventStatus[] = [
  'inscricoes_abertas',
  'em_andamento',
  'finalizado',
  'cancelado',
] as const;

export const USER_ROLES: readonly UserRole[] = [
  'admin',
  'organizador',
  'responsavel',
  'atleta',
] as const;
