-- Tornar evento_id nullable em equipes (equipes existem independente de eventos)
ALTER TABLE public.equipes ALTER COLUMN evento_id DROP NOT NULL;

-- Atualizar RLS policies de equipes para não depender tanto de evento
DROP POLICY IF EXISTS "Todos podem ver equipes" ON public.equipes;
DROP POLICY IF EXISTS "Organizadores podem criar equipes" ON public.equipes;
DROP POLICY IF EXISTS "Organizadores e responsáveis podem atualizar equipes" ON public.equipes;
DROP POLICY IF EXISTS "Organizadores podem deletar equipes" ON public.equipes;

-- Nova policy: Todos podem ver equipes ativas
CREATE POLICY "Todos podem ver equipes ativas"
ON public.equipes
FOR SELECT
USING (ativa = true OR is_team_manager(auth.uid(), id));

-- Responsáveis podem criar suas próprias equipes
CREATE POLICY "Responsáveis podem criar equipes"
ON public.equipes
FOR INSERT
WITH CHECK (auth.uid() = responsavel_id OR has_role(auth.uid(), 'organizador'));

-- Responsáveis podem atualizar suas equipes
CREATE POLICY "Responsáveis podem atualizar suas equipes"
ON public.equipes
FOR UPDATE
USING (is_team_manager(auth.uid(), id) OR has_role(auth.uid(), 'organizador'));

-- Apenas organizadores podem deletar equipes
CREATE POLICY "Organizadores podem deletar equipes"
ON public.equipes
FOR DELETE
USING (has_role(auth.uid(), 'organizador'));

-- Atualizar policies de inscrições para permitir que responsáveis inscrevam suas equipes
DROP POLICY IF EXISTS "Usuários autenticados podem se inscrever" ON public.inscricoes;

CREATE POLICY "Responsáveis podem inscrever suas equipes"
ON public.inscricoes
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Responsável da equipe pode inscrever
    (equipe_id IS NOT NULL AND is_team_manager(auth.uid(), equipe_id)) OR
    -- Organizador pode inscrever qualquer equipe
    has_role(auth.uid(), 'organizador') OR
    -- Atleta pode se inscrever individualmente
    (atleta_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM atletas WHERE id = inscricoes.atleta_id AND user_id = auth.uid()
    ))
  )
);