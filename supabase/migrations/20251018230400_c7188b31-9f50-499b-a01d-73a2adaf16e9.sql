-- Garantir que as tabelas principais existem com todas as colunas necessárias

-- Adicionar colunas que podem estar faltando na tabela eventos
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS tipo_sistema_partidas TEXT DEFAULT 'manual';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS gera_partidas_automatico BOOLEAN DEFAULT false;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS formato_partidas JSONB DEFAULT '{"tipo": "todos_contra_todos", "ida_volta": false, "grupos": 1}'::jsonb;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS duracao_partida INTEGER DEFAULT 90;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS intervalo_partidas INTEGER DEFAULT 30;

-- Adicionar colunas na tabela partidas para maior customização
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS rodada INTEGER;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS grupo TEXT;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS numero_partida INTEGER;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS cartoes_amarelos_a INTEGER DEFAULT 0;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS cartoes_vermelhos_a INTEGER DEFAULT 0;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS cartoes_amarelos_b INTEGER DEFAULT 0;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS cartoes_vermelhos_b INTEGER DEFAULT 0;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS eventos_partida JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS duracao_minutos INTEGER;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS tempo_acrescimo INTEGER DEFAULT 0;

-- Criar função para gerar partidas automaticamente
CREATE OR REPLACE FUNCTION gerar_partidas_evento(
  p_evento_id UUID,
  p_categoria TEXT
)
RETURNS TABLE(
  equipe_a_id UUID,
  equipe_b_id UUID,
  fase TEXT,
  rodada INTEGER
) AS $$
DECLARE
  v_equipes UUID[];
  v_formato JSONB;
  v_tipo_formato TEXT;
  v_ida_volta BOOLEAN;
  i INTEGER;
  j INTEGER;
  rodada_atual INTEGER;
BEGIN
  -- Buscar configurações do evento
  SELECT formato_partidas INTO v_formato
  FROM eventos
  WHERE id = p_evento_id;
  
  v_tipo_formato := v_formato->>'tipo';
  v_ida_volta := COALESCE((v_formato->>'ida_volta')::boolean, false);
  
  -- Buscar equipes da categoria
  SELECT ARRAY_AGG(e.id ORDER BY e.nome)
  INTO v_equipes
  FROM equipes e
  WHERE e.evento_id = p_evento_id
    AND e.categoria = p_categoria
    AND e.ativa = true;
  
  -- Se tipo for "todos_contra_todos"
  IF v_tipo_formato = 'todos_contra_todos' THEN
    rodada_atual := 1;
    
    -- Gerar partidas de ida
    FOR i IN 1..array_length(v_equipes, 1) LOOP
      FOR j IN (i + 1)..array_length(v_equipes, 1) LOOP
        equipe_a_id := v_equipes[i];
        equipe_b_id := v_equipes[j];
        fase := 'Fase de Grupos';
        rodada := rodada_atual;
        
        RETURN NEXT;
        
        rodada_atual := rodada_atual + 1;
      END LOOP;
    END LOOP;
    
    -- Se ida e volta, gerar partidas de volta
    IF v_ida_volta THEN
      FOR i IN 1..array_length(v_equipes, 1) LOOP
        FOR j IN (i + 1)..array_length(v_equipes, 1) LOOP
          equipe_a_id := v_equipes[j];
          equipe_b_id := v_equipes[i];
          fase := 'Fase de Grupos';
          rodada := rodada_atual;
          
          RETURN NEXT;
          
          rodada_atual := rodada_atual + 1;
        END LOOP;
      END LOOP;
    END IF;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
