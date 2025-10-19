export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      atletas: {
        Row: {
          alergias: string | null
          altura: number | null
          ativo: boolean | null
          avaliacoes: Json | null
          categoria: string
          certidao_nascimento: string | null
          cidade: string | null
          clubes_anteriores: string[] | null
          comprovante_residencia_url: string | null
          contato_emergencia: string | null
          contato_responsavel: string | null
          cpf: string | null
          cpf_responsavel: string | null
          created_at: string
          data_nascimento: string | null
          data_ultima_avaliacao: string | null
          documento: string
          email: string | null
          equipe_id: string | null
          estado: string | null
          foto_url: string | null
          id: string
          medicamentos: string | null
          nacionalidade: string | null
          necessidades_especiais: string | null
          nome: string
          nome_responsavel: string | null
          numero_uniforme: number | null
          observacoes: string | null
          parentesco_responsavel: string | null
          pe_dominante: string | null
          peso: number | null
          posicao: string | null
          redes_sociais: Json | null
          rg: string | null
          sexo: string | null
          telefone: string | null
          tipo_sanguineo: string | null
          transferivel: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alergias?: string | null
          altura?: number | null
          ativo?: boolean | null
          avaliacoes?: Json | null
          categoria: string
          certidao_nascimento?: string | null
          cidade?: string | null
          clubes_anteriores?: string[] | null
          comprovante_residencia_url?: string | null
          contato_emergencia?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          cpf_responsavel?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_ultima_avaliacao?: string | null
          documento: string
          email?: string | null
          equipe_id?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          medicamentos?: string | null
          nacionalidade?: string | null
          necessidades_especiais?: string | null
          nome: string
          nome_responsavel?: string | null
          numero_uniforme?: number | null
          observacoes?: string | null
          parentesco_responsavel?: string | null
          pe_dominante?: string | null
          peso?: number | null
          posicao?: string | null
          redes_sociais?: Json | null
          rg?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_sanguineo?: string | null
          transferivel?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alergias?: string | null
          altura?: number | null
          ativo?: boolean | null
          avaliacoes?: Json | null
          categoria?: string
          certidao_nascimento?: string | null
          cidade?: string | null
          clubes_anteriores?: string[] | null
          comprovante_residencia_url?: string | null
          contato_emergencia?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          cpf_responsavel?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_ultima_avaliacao?: string | null
          documento?: string
          email?: string | null
          equipe_id?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          medicamentos?: string | null
          nacionalidade?: string | null
          necessidades_especiais?: string | null
          nome?: string
          nome_responsavel?: string | null
          numero_uniforme?: number | null
          observacoes?: string | null
          parentesco_responsavel?: string | null
          pe_dominante?: string | null
          peso?: number | null
          posicao?: string | null
          redes_sociais?: Json | null
          rg?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_sanguineo?: string | null
          transferivel?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atletas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atletas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atletas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_partidas: {
        Row: {
          comentario: string
          created_at: string
          id: string
          partida_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comentario: string
          created_at?: string
          id?: string
          partida_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comentario?: string
          created_at?: string
          id?: string
          partida_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_partidas_partida_id_fkey"
            columns: ["partida_id"]
            isOneToOne: false
            referencedRelation: "partidas"
            referencedColumns: ["id"]
          },
        ]
      }
      convites_equipe: {
        Row: {
          atleta_id: string | null
          created_at: string
          email_atleta: string | null
          enviado_por: string
          equipe_id: string
          id: string
          mensagem: string | null
          status: string
          updated_at: string
        }
        Insert: {
          atleta_id?: string | null
          created_at?: string
          email_atleta?: string | null
          enviado_por: string
          equipe_id: string
          id?: string
          mensagem?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          atleta_id?: string | null
          created_at?: string
          email_atleta?: string | null
          enviado_por?: string
          equipe_id?: string
          id?: string
          mensagem?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_equipe_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_equipe_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_equipe_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_equipe_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_public"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          ano_fundacao: number | null
          ativa: boolean | null
          categoria: string
          cidade: string | null
          contato_responsavel: string | null
          contato_tecnico: string | null
          created_at: string
          estadio_casa: string | null
          estatisticas: Json | null
          evento_id: string
          id: string
          limite_atletas: number | null
          logo_url: string | null
          modalidade: Database["public"]["Enums"]["sport_modality"]
          nome: string
          numero_atletas: number | null
          observacoes: string | null
          patrocinadores: string[] | null
          permite_inscricao_aberta: boolean | null
          redes_sociais: Json | null
          tecnico: string | null
          uniforme_alternativo: Json | null
          uniforme_cor: string | null
          uniforme_principal: Json | null
          updated_at: string
        }
        Insert: {
          ano_fundacao?: number | null
          ativa?: boolean | null
          categoria: string
          cidade?: string | null
          contato_responsavel?: string | null
          contato_tecnico?: string | null
          created_at?: string
          estadio_casa?: string | null
          estatisticas?: Json | null
          evento_id: string
          id?: string
          limite_atletas?: number | null
          logo_url?: string | null
          modalidade: Database["public"]["Enums"]["sport_modality"]
          nome: string
          numero_atletas?: number | null
          observacoes?: string | null
          patrocinadores?: string[] | null
          permite_inscricao_aberta?: boolean | null
          redes_sociais?: Json | null
          tecnico?: string | null
          uniforme_alternativo?: Json | null
          uniforme_cor?: string | null
          uniforme_principal?: Json | null
          updated_at?: string
        }
        Update: {
          ano_fundacao?: number | null
          ativa?: boolean | null
          categoria?: string
          cidade?: string | null
          contato_responsavel?: string | null
          contato_tecnico?: string | null
          created_at?: string
          estadio_casa?: string | null
          estatisticas?: Json | null
          evento_id?: string
          id?: string
          limite_atletas?: number | null
          logo_url?: string | null
          modalidade?: Database["public"]["Enums"]["sport_modality"]
          nome?: string
          numero_atletas?: number | null
          observacoes?: string | null
          patrocinadores?: string[] | null
          permite_inscricao_aberta?: boolean | null
          redes_sociais?: Json | null
          tecnico?: string | null
          uniforme_alternativo?: Json | null
          uniforme_cor?: string | null
          uniforme_principal?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          aceita_inscricoes_equipes: boolean | null
          aceita_inscricoes_individuais: boolean | null
          banner_url: string | null
          campos_personalizados: Json | null
          categorias: string[]
          configuracoes_partida: Json | null
          contato_organizador: string | null
          created_at: string
          criterios_desempate: string[] | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          duracao_partida: number | null
          exige_comprovante_pagamento: boolean | null
          exige_documento: boolean | null
          formato_partidas: Json | null
          gera_partidas_automatico: boolean | null
          id: string
          intervalo_partidas: number | null
          limite_atletas_por_equipe: number | null
          limite_equipes_por_categoria: number | null
          local: string
          modalidade: Database["public"]["Enums"]["sport_modality"]
          nome: string
          numero_fases: number | null
          observacoes: string | null
          organizador_id: string
          patrocinadores: string[] | null
          permite_transferencia: boolean | null
          pontos_derrota: number | null
          pontos_empate: number | null
          pontos_vitoria: number | null
          premiacao: Json | null
          redes_sociais: Json | null
          regras_especificas: string | null
          regulamento_url: string | null
          status: Database["public"]["Enums"]["event_status"]
          tipo_competicao: string | null
          tipo_sistema_partidas: string | null
          updated_at: string
          vagas_por_categoria: number | null
          valor_inscricao: number | null
        }
        Insert: {
          aceita_inscricoes_equipes?: boolean | null
          aceita_inscricoes_individuais?: boolean | null
          banner_url?: string | null
          campos_personalizados?: Json | null
          categorias?: string[]
          configuracoes_partida?: Json | null
          contato_organizador?: string | null
          created_at?: string
          criterios_desempate?: string[] | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          duracao_partida?: number | null
          exige_comprovante_pagamento?: boolean | null
          exige_documento?: boolean | null
          formato_partidas?: Json | null
          gera_partidas_automatico?: boolean | null
          id?: string
          intervalo_partidas?: number | null
          limite_atletas_por_equipe?: number | null
          limite_equipes_por_categoria?: number | null
          local: string
          modalidade: Database["public"]["Enums"]["sport_modality"]
          nome: string
          numero_fases?: number | null
          observacoes?: string | null
          organizador_id: string
          patrocinadores?: string[] | null
          permite_transferencia?: boolean | null
          pontos_derrota?: number | null
          pontos_empate?: number | null
          pontos_vitoria?: number | null
          premiacao?: Json | null
          redes_sociais?: Json | null
          regras_especificas?: string | null
          regulamento_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tipo_competicao?: string | null
          tipo_sistema_partidas?: string | null
          updated_at?: string
          vagas_por_categoria?: number | null
          valor_inscricao?: number | null
        }
        Update: {
          aceita_inscricoes_equipes?: boolean | null
          aceita_inscricoes_individuais?: boolean | null
          banner_url?: string | null
          campos_personalizados?: Json | null
          categorias?: string[]
          configuracoes_partida?: Json | null
          contato_organizador?: string | null
          created_at?: string
          criterios_desempate?: string[] | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          duracao_partida?: number | null
          exige_comprovante_pagamento?: boolean | null
          exige_documento?: boolean | null
          formato_partidas?: Json | null
          gera_partidas_automatico?: boolean | null
          id?: string
          intervalo_partidas?: number | null
          limite_atletas_por_equipe?: number | null
          limite_equipes_por_categoria?: number | null
          local?: string
          modalidade?: Database["public"]["Enums"]["sport_modality"]
          nome?: string
          numero_fases?: number | null
          observacoes?: string | null
          organizador_id?: string
          patrocinadores?: string[] | null
          permite_transferencia?: boolean | null
          pontos_derrota?: number | null
          pontos_empate?: number | null
          pontos_vitoria?: number | null
          premiacao?: Json | null
          redes_sociais?: Json | null
          regras_especificas?: string | null
          regulamento_url?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tipo_competicao?: string | null
          tipo_sistema_partidas?: string | null
          updated_at?: string
          vagas_por_categoria?: number | null
          valor_inscricao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_organizador_id_fkey"
            columns: ["organizador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes: {
        Row: {
          atleta_id: string | null
          categoria: string
          created_at: string
          data_inscricao: string
          equipe_id: string | null
          evento_id: string
          id: string
          pagamento_confirmado: boolean | null
          status: Database["public"]["Enums"]["inscription_status"]
          updated_at: string
          valor_pago: number | null
        }
        Insert: {
          atleta_id?: string | null
          categoria: string
          created_at?: string
          data_inscricao?: string
          equipe_id?: string | null
          evento_id: string
          id?: string
          pagamento_confirmado?: boolean | null
          status?: Database["public"]["Enums"]["inscription_status"]
          updated_at?: string
          valor_pago?: number | null
        }
        Update: {
          atleta_id?: string | null
          categoria?: string
          created_at?: string
          data_inscricao?: string
          equipe_id?: string | null
          evento_id?: string
          id?: string
          pagamento_confirmado?: boolean | null
          status?: Database["public"]["Enums"]["inscription_status"]
          updated_at?: string
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      partidas: {
        Row: {
          arbitro_id: string | null
          cartoes_amarelos_a: number | null
          cartoes_amarelos_b: number | null
          cartoes_vermelhos_a: number | null
          cartoes_vermelhos_b: number | null
          categoria: string
          created_at: string
          data_partida: string
          duracao_minutos: number | null
          equipe_a_id: string
          equipe_b_id: string
          evento_id: string
          eventos_partida: Json | null
          fase: string
          finalizada: boolean | null
          grupo: string | null
          id: string
          local: string
          numero_partida: number | null
          observacoes: string | null
          placar_a: number | null
          placar_b: number | null
          rodada: number | null
          tempo_acrescimo: number | null
          updated_at: string
        }
        Insert: {
          arbitro_id?: string | null
          cartoes_amarelos_a?: number | null
          cartoes_amarelos_b?: number | null
          cartoes_vermelhos_a?: number | null
          cartoes_vermelhos_b?: number | null
          categoria: string
          created_at?: string
          data_partida: string
          duracao_minutos?: number | null
          equipe_a_id: string
          equipe_b_id: string
          evento_id: string
          eventos_partida?: Json | null
          fase: string
          finalizada?: boolean | null
          grupo?: string | null
          id?: string
          local: string
          numero_partida?: number | null
          observacoes?: string | null
          placar_a?: number | null
          placar_b?: number | null
          rodada?: number | null
          tempo_acrescimo?: number | null
          updated_at?: string
        }
        Update: {
          arbitro_id?: string | null
          cartoes_amarelos_a?: number | null
          cartoes_amarelos_b?: number | null
          cartoes_vermelhos_a?: number | null
          cartoes_vermelhos_b?: number | null
          categoria?: string
          created_at?: string
          data_partida?: string
          duracao_minutos?: number | null
          equipe_a_id?: string
          equipe_b_id?: string
          evento_id?: string
          eventos_partida?: Json | null
          fase?: string
          finalizada?: boolean | null
          grupo?: string | null
          id?: string
          local?: string
          numero_partida?: number | null
          observacoes?: string | null
          placar_a?: number | null
          placar_b?: number | null
          rodada?: number | null
          tempo_acrescimo?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partidas_arbitro_id_fkey"
            columns: ["arbitro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_equipe_a_id_fkey"
            columns: ["equipe_a_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_equipe_a_id_fkey"
            columns: ["equipe_a_id"]
            isOneToOne: false
            referencedRelation: "equipes_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_equipe_b_id_fkey"
            columns: ["equipe_b_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_equipe_b_id_fkey"
            columns: ["equipe_b_id"]
            isOneToOne: false
            referencedRelation: "equipes_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          documento: string | null
          email: string
          foto_url: string | null
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["user_profile"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          documento?: string | null
          email: string
          foto_url?: string | null
          id: string
          nome: string
          perfil?: Database["public"]["Enums"]["user_profile"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          documento?: string | null
          email?: string
          foto_url?: string | null
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["user_profile"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rankings: {
        Row: {
          atleta_id: string | null
          categoria: string
          created_at: string
          derrotas: number | null
          empates: number | null
          equipe_id: string | null
          evento_id: string
          gols_contra: number | null
          gols_pro: number | null
          id: string
          pontos: number | null
          saldo_gols: number | null
          updated_at: string
          vitorias: number | null
        }
        Insert: {
          atleta_id?: string | null
          categoria: string
          created_at?: string
          derrotas?: number | null
          empates?: number | null
          equipe_id?: string | null
          evento_id: string
          gols_contra?: number | null
          gols_pro?: number | null
          id?: string
          pontos?: number | null
          saldo_gols?: number | null
          updated_at?: string
          vitorias?: number | null
        }
        Update: {
          atleta_id?: string | null
          categoria?: string
          created_at?: string
          derrotas?: number | null
          empates?: number | null
          equipe_id?: string | null
          evento_id?: string
          gols_contra?: number | null
          gols_pro?: number | null
          id?: string
          pontos?: number | null
          saldo_gols?: number | null
          updated_at?: string
          vitorias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rankings_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      atletas_public: {
        Row: {
          altura: number | null
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          equipe_id: string | null
          foto_url: string | null
          id: string | null
          nome: string | null
          numero_uniforme: number | null
          pe_dominante: string | null
          peso: number | null
          posicao: string | null
        }
        Insert: {
          altura?: number | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          equipe_id?: string | null
          foto_url?: string | null
          id?: string | null
          nome?: string | null
          numero_uniforme?: number | null
          pe_dominante?: string | null
          peso?: number | null
          posicao?: string | null
        }
        Update: {
          altura?: number | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          equipe_id?: string | null
          foto_url?: string | null
          id?: string | null
          nome?: string | null
          numero_uniforme?: number | null
          pe_dominante?: string | null
          peso?: number | null
          posicao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atletas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atletas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_public"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes_public: {
        Row: {
          ano_fundacao: number | null
          ativa: boolean | null
          categoria: string | null
          cidade: string | null
          created_at: string | null
          estadio_casa: string | null
          estatisticas: Json | null
          evento_id: string | null
          id: string | null
          logo_url: string | null
          modalidade: Database["public"]["Enums"]["sport_modality"] | null
          nome: string | null
          numero_atletas: number | null
          redes_sociais: Json | null
          uniforme_alternativo: Json | null
          uniforme_cor: string | null
          uniforme_principal: Json | null
        }
        Insert: {
          ano_fundacao?: number | null
          ativa?: boolean | null
          categoria?: string | null
          cidade?: string | null
          created_at?: string | null
          estadio_casa?: string | null
          estatisticas?: Json | null
          evento_id?: string | null
          id?: string | null
          logo_url?: string | null
          modalidade?: Database["public"]["Enums"]["sport_modality"] | null
          nome?: string | null
          numero_atletas?: number | null
          redes_sociais?: Json | null
          uniforme_alternativo?: Json | null
          uniforme_cor?: string | null
          uniforme_principal?: Json | null
        }
        Update: {
          ano_fundacao?: number | null
          ativa?: boolean | null
          categoria?: string | null
          cidade?: string | null
          created_at?: string | null
          estadio_casa?: string | null
          estatisticas?: Json | null
          evento_id?: string | null
          id?: string | null
          logo_url?: string | null
          modalidade?: Database["public"]["Enums"]["sport_modality"] | null
          nome?: string | null
          numero_atletas?: number | null
          redes_sociais?: Json | null
          uniforme_alternativo?: Json | null
          uniforme_cor?: string | null
          uniforme_principal?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "equipes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      gerar_partidas_evento: {
        Args: { p_categoria: string; p_evento_id: string }
        Returns: {
          equipe_a_id: string
          equipe_b_id: string
          fase: string
          rodada: number
        }[]
      }
    }
    Enums: {
      event_status:
        | "inscricoes_abertas"
        | "em_andamento"
        | "finalizado"
        | "cancelado"
      inscription_status: "pendente" | "aprovada" | "rejeitada"
      sport_modality:
        | "futebol"
        | "volei"
        | "basquete"
        | "futsal"
        | "handebol"
        | "tenis"
        | "natacao"
        | "atletismo"
        | "outro"
      user_profile: "organizador" | "atleta" | "arbitro" | "visitante"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_status: [
        "inscricoes_abertas",
        "em_andamento",
        "finalizado",
        "cancelado",
      ],
      inscription_status: ["pendente", "aprovada", "rejeitada"],
      sport_modality: [
        "futebol",
        "volei",
        "basquete",
        "futsal",
        "handebol",
        "tenis",
        "natacao",
        "atletismo",
        "outro",
      ],
      user_profile: ["organizador", "atleta", "arbitro", "visitante"],
    },
  },
} as const
