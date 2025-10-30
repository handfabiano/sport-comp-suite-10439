-- Melhorar políticas de inscricoes para permitir que responsáveis inscrevam suas equipes
DROP POLICY IF EXISTS "Responsáveis podem inscrever suas equipes" ON public.inscricoes;
DROP POLICY IF EXISTS "Organizadores podem gerenciar inscrições de seus eventos" ON public.inscricoes;
DROP POLICY IF EXISTS "Todos podem visualizar inscrições" ON public.inscricoes;

-- Política para visualizar inscrições (todos podem ver)
CREATE POLICY "Todos podem visualizar inscrições"
ON public.inscricoes
FOR SELECT
TO authenticated
USING (true);

-- Política para responsáveis inscriverem suas equipes
CREATE POLICY "Responsáveis podem inscrever suas equipes"
ON public.inscricoes
FOR INSERT
TO authenticated
WITH CHECK (
  (equipe_id IS NOT NULL AND is_team_manager(auth.uid(), equipe_id))
  OR
  (atleta_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM atletas WHERE id = inscricoes.atleta_id AND user_id = auth.uid()
  ))
  OR
  has_role(auth.uid(), 'organizador')
);

-- Política para organizadores gerenciarem inscrições de seus eventos
CREATE POLICY "Organizadores podem gerenciar inscrições"
ON public.inscricoes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos 
    WHERE id = inscricoes.evento_id 
    AND organizador_id = auth.uid()
  )
);

-- Melhorar políticas de equipes para permitir que responsáveis vejam suas equipes
DROP POLICY IF EXISTS "Todos podem ver equipes ativas" ON public.equipes;
DROP POLICY IF EXISTS "Responsáveis podem criar equipes" ON public.equipes;
DROP POLICY IF EXISTS "Responsáveis podem atualizar suas equipes" ON public.equipes;

-- Todos podem ver equipes ativas OU responsáveis podem ver suas próprias equipes
CREATE POLICY "Ver equipes"
ON public.equipes
FOR SELECT
TO authenticated
USING (
  ativa = true 
  OR is_team_manager(auth.uid(), id)
  OR EXISTS (
    SELECT 1 FROM eventos 
    WHERE id = equipes.evento_id 
    AND organizador_id = auth.uid()
  )
);

-- Responsáveis e organizadores podem criar equipes
CREATE POLICY "Criar equipes"
ON public.equipes
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = responsavel_id)
  OR has_role(auth.uid(), 'organizador')
  OR EXISTS (
    SELECT 1 FROM eventos 
    WHERE id = equipes.evento_id 
    AND organizador_id = auth.uid()
  )
);

-- Responsáveis podem atualizar suas equipes
CREATE POLICY "Atualizar equipes"
ON public.equipes
FOR UPDATE
TO authenticated
USING (
  is_team_manager(auth.uid(), id)
  OR has_role(auth.uid(), 'organizador')
  OR EXISTS (
    SELECT 1 FROM eventos 
    WHERE id = equipes.evento_id 
    AND organizador_id = auth.uid()
  )
);

-- Melhorar políticas de convites para equipes
DROP POLICY IF EXISTS "Criar convites" ON public.convites_equipe;

CREATE POLICY "Criar convites para equipe"
ON public.convites_equipe
FOR INSERT
TO authenticated
WITH CHECK (
  is_team_manager(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = convites_equipe.equipe_id 
    AND ev.organizador_id = auth.uid()
  )
);