-- ===========================================
-- PASSO 1: PROTEGER DADOS SENSÍVEIS DE ATLETAS MENORES
-- ===========================================

-- 1.1: Remover política pública de SELECT em atletas
DROP POLICY IF EXISTS "Todos podem visualizar atletas" ON public.atletas;

-- 1.2: Criar nova política restrita para atletas autenticados
CREATE POLICY "Authenticated users can view athletes"
ON public.atletas FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.equipes e
    JOIN public.eventos ev ON e.evento_id = ev.id
    WHERE e.id = atletas.equipe_id
    AND ev.organizador_id = auth.uid()
  )
);

-- 1.3: Criar view pública com apenas dados não-sensíveis
CREATE OR REPLACE VIEW public.atletas_public AS
SELECT 
  id,
  nome,
  equipe_id,
  categoria,
  posicao,
  numero_uniforme,
  foto_url,
  ativo,
  altura,
  peso,
  pe_dominante,
  created_at
FROM public.atletas
WHERE ativo = true;

-- 1.4: Permitir acesso público à view
GRANT SELECT ON public.atletas_public TO anon, authenticated;

-- ===========================================
-- PASSO 1 (continuação): PROTEGER CONTATOS DE EQUIPES
-- ===========================================

-- 1.5: Remover política pública de SELECT em equipes
DROP POLICY IF EXISTS "Todos podem visualizar equipes" ON public.equipes;

-- 1.6: Criar nova política restrita
CREATE POLICY "Authenticated users can view teams"
ON public.equipes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.eventos
    WHERE eventos.id = equipes.evento_id
    AND (
      eventos.organizador_id = auth.uid()
      OR eventos.status IN ('inscricoes_abertas', 'em_andamento', 'finalizado')
    )
  )
);

-- 1.7: Criar view pública para equipes
CREATE OR REPLACE VIEW public.equipes_public AS
SELECT 
  id,
  evento_id,
  nome,
  categoria,
  modalidade,
  cidade,
  estadio_casa,
  logo_url,
  uniforme_cor,
  uniforme_principal,
  uniforme_alternativo,
  ano_fundacao,
  estatisticas,
  ativa,
  numero_atletas,
  redes_sociais,
  created_at
FROM public.equipes
WHERE ativa = true;

GRANT SELECT ON public.equipes_public TO anon, authenticated;