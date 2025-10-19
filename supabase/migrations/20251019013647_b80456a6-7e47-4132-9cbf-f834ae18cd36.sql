-- ===========================================
-- PASSO 12: SISTEMA DE RANKINGS AUTOMÁTICO
-- ===========================================

-- Habilitar realtime para a tabela partidas
ALTER PUBLICATION supabase_realtime ADD TABLE public.partidas;

-- Função para atualizar rankings automaticamente após finalizar partida
CREATE OR REPLACE FUNCTION public.atualizar_rankings_apos_partida()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evento_id uuid;
  v_categoria text;
  v_pontos_vitoria int;
  v_pontos_empate int;
  v_pontos_derrota int;
BEGIN
  -- Só processa se a partida foi finalizada
  IF NEW.finalizada = true AND (OLD.finalizada = false OR OLD.finalizada IS NULL) THEN
    
    v_evento_id := NEW.evento_id;
    v_categoria := NEW.categoria;
    
    -- Buscar configurações de pontos do evento
    SELECT 
      COALESCE(pontos_vitoria, 3),
      COALESCE(pontos_empate, 1),
      COALESCE(pontos_derrota, 0)
    INTO v_pontos_vitoria, v_pontos_empate, v_pontos_derrota
    FROM eventos
    WHERE id = v_evento_id;
    
    -- Garantir que existem registros no ranking para ambas as equipes
    INSERT INTO rankings (evento_id, equipe_id, categoria, pontos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo_gols)
    VALUES (v_evento_id, NEW.equipe_a_id, v_categoria, 0, 0, 0, 0, 0, 0, 0)
    ON CONFLICT (evento_id, equipe_id, categoria) DO NOTHING;
    
    INSERT INTO rankings (evento_id, equipe_id, categoria, pontos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo_gols)
    VALUES (v_evento_id, NEW.equipe_b_id, v_categoria, 0, 0, 0, 0, 0, 0, 0)
    ON CONFLICT (evento_id, equipe_id, categoria) DO NOTHING;
    
    -- Atualizar ranking da equipe A
    IF NEW.placar_a > NEW.placar_b THEN
      -- Equipe A venceu
      UPDATE rankings SET
        pontos = pontos + v_pontos_vitoria,
        vitorias = vitorias + 1,
        gols_pro = gols_pro + NEW.placar_a,
        gols_contra = gols_contra + NEW.placar_b,
        saldo_gols = (gols_pro + NEW.placar_a) - (gols_contra + NEW.placar_b),
        updated_at = now()
      WHERE evento_id = v_evento_id 
        AND equipe_id = NEW.equipe_a_id 
        AND categoria = v_categoria;
      
      -- Equipe B perdeu
      UPDATE rankings SET
        pontos = pontos + v_pontos_derrota,
        derrotas = derrotas + 1,
        gols_pro = gols_pro + NEW.placar_b,
        gols_contra = gols_contra + NEW.placar_a,
        saldo_gols = (gols_pro + NEW.placar_b) - (gols_contra + NEW.placar_a),
        updated_at = now()
      WHERE evento_id = v_evento_id 
        AND equipe_id = NEW.equipe_b_id 
        AND categoria = v_categoria;
        
    ELSIF NEW.placar_a < NEW.placar_b THEN
      -- Equipe B venceu
      UPDATE rankings SET
        pontos = pontos + v_pontos_vitoria,
        vitorias = vitorias + 1,
        gols_pro = gols_pro + NEW.placar_b,
        gols_contra = gols_contra + NEW.placar_a,
        saldo_gols = (gols_pro + NEW.placar_b) - (gols_contra + NEW.placar_a),
        updated_at = now()
      WHERE evento_id = v_evento_id 
        AND equipe_id = NEW.equipe_b_id 
        AND categoria = v_categoria;
      
      -- Equipe A perdeu
      UPDATE rankings SET
        pontos = pontos + v_pontos_derrota,
        derrotas = derrotas + 1,
        gols_pro = gols_pro + NEW.placar_a,
        gols_contra = gols_contra + NEW.placar_b,
        saldo_gols = (gols_pro + NEW.placar_a) - (gols_contra + NEW.placar_b),
        updated_at = now()
      WHERE evento_id = v_evento_id 
        AND equipe_id = NEW.equipe_a_id 
        AND categoria = v_categoria;
        
    ELSE
      -- Empate
      UPDATE rankings SET
        pontos = pontos + v_pontos_empate,
        empates = empates + 1,
        gols_pro = gols_pro + NEW.placar_a,
        gols_contra = gols_contra + NEW.placar_b,
        saldo_gols = (gols_pro + NEW.placar_a) - (gols_contra + NEW.placar_b),
        updated_at = now()
      WHERE evento_id = v_evento_id 
        AND equipe_id = NEW.equipe_a_id 
        AND categoria = v_categoria;
      
      UPDATE rankings SET
        pontos = pontos + v_pontos_empate,
        empates = empates + 1,
        gols_pro = gols_pro + NEW.placar_b,
        gols_contra = gols_contra + NEW.placar_a,
        saldo_gols = (gols_pro + NEW.placar_b) - (gols_contra + NEW.placar_a),
        updated_at = now()
      WHERE evento_id = v_evento_id 
        AND equipe_id = NEW.equipe_b_id 
        AND categoria = v_categoria;
    END IF;
    
    -- Atualizar estatísticas nas equipes
    UPDATE equipes SET
      estatisticas = jsonb_build_object(
        'vitorias', (SELECT vitorias FROM rankings WHERE equipe_id = NEW.equipe_a_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'empates', (SELECT empates FROM rankings WHERE equipe_id = NEW.equipe_a_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'derrotas', (SELECT derrotas FROM rankings WHERE equipe_id = NEW.equipe_a_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'gols_pro', (SELECT gols_pro FROM rankings WHERE equipe_id = NEW.equipe_a_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'gols_contra', (SELECT gols_contra FROM rankings WHERE equipe_id = NEW.equipe_a_id AND evento_id = v_evento_id AND categoria = v_categoria)
      )
    WHERE id = NEW.equipe_a_id;
    
    UPDATE equipes SET
      estatisticas = jsonb_build_object(
        'vitorias', (SELECT vitorias FROM rankings WHERE equipe_id = NEW.equipe_b_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'empates', (SELECT empates FROM rankings WHERE equipe_id = NEW.equipe_b_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'derrotas', (SELECT derrotas FROM rankings WHERE equipe_id = NEW.equipe_b_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'gols_pro', (SELECT gols_pro FROM rankings WHERE equipe_id = NEW.equipe_b_id AND evento_id = v_evento_id AND categoria = v_categoria),
        'gols_contra', (SELECT gols_contra FROM rankings WHERE equipe_id = NEW.equipe_b_id AND evento_id = v_evento_id AND categoria = v_categoria)
      )
    WHERE id = NEW.equipe_b_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar rankings automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_rankings ON public.partidas;

CREATE TRIGGER trigger_atualizar_rankings
AFTER UPDATE OF finalizada, placar_a, placar_b ON public.partidas
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_rankings_apos_partida();

-- Adicionar constraint único no rankings para evitar duplicatas
ALTER TABLE public.rankings 
DROP CONSTRAINT IF EXISTS rankings_evento_equipe_categoria_key;

ALTER TABLE public.rankings 
ADD CONSTRAINT rankings_evento_equipe_categoria_key 
UNIQUE (evento_id, equipe_id, categoria);