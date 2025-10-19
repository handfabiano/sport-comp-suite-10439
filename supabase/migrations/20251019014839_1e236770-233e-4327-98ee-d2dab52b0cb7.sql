-- Tabela de convites para equipes
CREATE TABLE IF NOT EXISTS public.convites_equipe (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  atleta_id uuid REFERENCES public.atletas(id) ON DELETE CASCADE,
  email_atleta text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'recusado')),
  mensagem text,
  enviado_por uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT convite_email_ou_atleta CHECK (
    (atleta_id IS NOT NULL AND email_atleta IS NULL) OR 
    (atleta_id IS NULL AND email_atleta IS NOT NULL)
  )
);

-- Índices para convites
CREATE INDEX idx_convites_equipe_id ON public.convites_equipe(equipe_id);
CREATE INDEX idx_convites_atleta_id ON public.convites_equipe(atleta_id);
CREATE INDEX idx_convites_email ON public.convites_equipe(email_atleta);
CREATE INDEX idx_convites_status ON public.convites_equipe(status);

-- RLS para convites
ALTER TABLE public.convites_equipe ENABLE ROW LEVEL SECURITY;

-- Política: Organizadores e técnicos podem ver convites de suas equipes
CREATE POLICY "Ver convites da equipe" ON public.convites_equipe
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM equipes e
      JOIN eventos ev ON e.evento_id = ev.id
      WHERE e.id = convites_equipe.equipe_id
      AND ev.organizador_id = auth.uid()
    )
    OR enviado_por = auth.uid()
    OR atleta_id IN (
      SELECT id FROM atletas WHERE user_id = auth.uid()
    )
  );

-- Política: Técnicos e organizadores podem criar convites
CREATE POLICY "Criar convites" ON public.convites_equipe
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipes e
      JOIN eventos ev ON e.evento_id = ev.id
      WHERE e.id = convites_equipe.equipe_id
      AND ev.organizador_id = auth.uid()
    )
  );

-- Política: Atletas podem atualizar seus próprios convites (aceitar/recusar)
CREATE POLICY "Atualizar próprio convite" ON public.convites_equipe
  FOR UPDATE
  USING (
    atleta_id IN (
      SELECT id FROM atletas WHERE user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_convites_equipe_updated_at
  BEFORE UPDATE ON public.convites_equipe
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Tabela de comentários em partidas
CREATE TABLE IF NOT EXISTS public.comentarios_partidas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partida_id uuid NOT NULL REFERENCES public.partidas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comentario text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para comentários
CREATE INDEX idx_comentarios_partida_id ON public.comentarios_partidas(partida_id);
CREATE INDEX idx_comentarios_user_id ON public.comentarios_partidas(user_id);
CREATE INDEX idx_comentarios_created_at ON public.comentarios_partidas(created_at DESC);

-- RLS para comentários
ALTER TABLE public.comentarios_partidas ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver comentários
CREATE POLICY "Ver comentários" ON public.comentarios_partidas
  FOR SELECT
  USING (true);

-- Política: Usuários autenticados podem criar comentários
CREATE POLICY "Criar comentários" ON public.comentarios_partidas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem editar seus próprios comentários
CREATE POLICY "Editar próprio comentário" ON public.comentarios_partidas
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios comentários
CREATE POLICY "Deletar próprio comentário" ON public.comentarios_partidas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_comentarios_partidas_updated_at
  BEFORE UPDATE ON public.comentarios_partidas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar realtime para comentários
ALTER PUBLICATION supabase_realtime ADD TABLE public.comentarios_partidas;