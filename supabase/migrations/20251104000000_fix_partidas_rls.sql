-- ===========================================
-- FIX: Permitir que responsáveis e admins também possam finalizar partidas
-- ===========================================

-- Remover política antiga restritiva
DROP POLICY IF EXISTS "Organizadores e árbitros podem gerenciar partidas" ON public.partidas;

-- Criar nova política mais permissiva para UPDATE
CREATE POLICY "Admins, organizadores, árbitros e responsáveis podem atualizar partidas"
  ON public.partidas FOR UPDATE
  USING (
    -- Admins podem atualizar qualquer partida
    public.has_role(auth.uid(), 'admin') OR

    -- Organizadores do evento podem atualizar partidas do evento
    EXISTS (
      SELECT 1 FROM public.eventos
      WHERE eventos.id = partidas.evento_id
      AND eventos.organizador_id = auth.uid()
    ) OR

    -- Árbitros podem atualizar suas partidas
    auth.uid() = arbitro_id OR

    -- Responsáveis das equipes envolvidas podem atualizar a partida
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'responsavel'
      AND (
        user_roles.equipe_id = partidas.equipe_a_id OR
        user_roles.equipe_id = partidas.equipe_b_id
      )
    )
  );

-- Criar política para INSERT
CREATE POLICY "Admins e organizadores podem criar partidas"
  ON public.partidas FOR INSERT
  WITH CHECK (
    -- Admins podem criar qualquer partida
    public.has_role(auth.uid(), 'admin') OR

    -- Organizadores do evento podem criar partidas
    EXISTS (
      SELECT 1 FROM public.eventos
      WHERE eventos.id = partidas.evento_id
      AND eventos.organizador_id = auth.uid()
    )
  );

-- Criar política para DELETE
CREATE POLICY "Admins e organizadores podem deletar partidas"
  ON public.partidas FOR DELETE
  USING (
    -- Admins podem deletar qualquer partida
    public.has_role(auth.uid(), 'admin') OR

    -- Organizadores do evento podem deletar partidas
    EXISTS (
      SELECT 1 FROM public.eventos
      WHERE eventos.id = partidas.evento_id
      AND eventos.organizador_id = auth.uid()
    )
  );
