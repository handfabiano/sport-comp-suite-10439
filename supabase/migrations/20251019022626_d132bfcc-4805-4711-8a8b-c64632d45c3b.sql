-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'organizador', 'responsavel', 'atleta');

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role, equipe_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se usuário é responsável de uma equipe
CREATE OR REPLACE FUNCTION public.is_team_manager(_user_id UUID, _equipe_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'responsavel'
      AND equipe_id = _equipe_id
  )
$$;

-- Função para verificar se evento já começou
CREATE OR REPLACE FUNCTION public.event_has_started(_evento_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.eventos
    WHERE id = _evento_id
      AND data_inicio <= CURRENT_DATE
      AND status IN ('em_andamento', 'finalizado')
  )
$$;

-- Adicionar coluna responsavel_id na tabela equipes
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES auth.users(id);

-- RLS Policies para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Organizadores podem gerenciar roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'organizador')
);

-- Atualizar RLS para equipes - responsáveis podem editar sua equipe
DROP POLICY IF EXISTS "Authenticated users can view teams" ON public.equipes;
DROP POLICY IF EXISTS "Organizadores podem gerenciar equipes de seus eventos" ON public.equipes;

CREATE POLICY "Todos podem ver equipes"
ON public.equipes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = equipes.evento_id
      AND (eventos.organizador_id = auth.uid() 
        OR eventos.status IN ('inscricoes_abertas', 'em_andamento', 'finalizado'))
  )
  OR public.is_team_manager(auth.uid(), equipes.id)
);

CREATE POLICY "Organizadores e responsáveis podem atualizar equipes"
ON public.equipes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = equipes.evento_id
      AND eventos.organizador_id = auth.uid()
  )
  OR public.is_team_manager(auth.uid(), equipes.id)
);

CREATE POLICY "Organizadores podem criar e deletar equipes"
ON public.equipes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = equipes.evento_id
      AND eventos.organizador_id = auth.uid()
  )
);

CREATE POLICY "Organizadores podem deletar equipes"
ON public.equipes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = equipes.evento_id
      AND eventos.organizador_id = auth.uid()
  )
);

-- Atualizar RLS para atletas
DROP POLICY IF EXISTS "Authenticated users can view athletes" ON public.atletas;
DROP POLICY IF EXISTS "Organizadores e próprio atleta podem gerenciar" ON public.atletas;

CREATE POLICY "Todos podem ver atletas"
ON public.atletas FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = atletas.equipe_id
      AND (ev.organizador_id = auth.uid() OR public.is_team_manager(auth.uid(), e.id))
  )
);

-- Responsáveis podem adicionar atletas apenas se evento não começou
CREATE POLICY "Adicionar atletas com restrições"
ON public.atletas FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR (
    EXISTS (
      SELECT 1 FROM equipes e
      JOIN eventos ev ON e.evento_id = ev.id
      WHERE e.id = atletas.equipe_id
        AND (
          ev.organizador_id = auth.uid()
          OR (
            public.is_team_manager(auth.uid(), e.id)
            AND NOT public.event_has_started(ev.id)
          )
        )
    )
  )
);

-- Responsáveis podem remover atletas apenas se evento não começou
CREATE POLICY "Remover atletas com restrições"
ON public.atletas FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = atletas.equipe_id
      AND (
        ev.organizador_id = auth.uid()
        OR (
          public.is_team_manager(auth.uid(), e.id)
          AND NOT public.event_has_started(ev.id)
        )
      )
  )
);

-- Responsáveis e organizadores podem atualizar dados dos atletas
CREATE POLICY "Atualizar atletas"
ON public.atletas FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = atletas.equipe_id
      AND (ev.organizador_id = auth.uid() OR public.is_team_manager(auth.uid(), e.id))
  )
);

-- Criar tabela para tokens de convite de atletas
CREATE TABLE public.athlete_invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.athlete_invite_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responsáveis podem criar tokens"
ON public.athlete_invite_tokens FOR INSERT
TO authenticated
WITH CHECK (
  public.is_team_manager(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = equipe_id AND ev.organizador_id = auth.uid()
  )
);

CREATE POLICY "Responsáveis podem ver tokens de sua equipe"
ON public.athlete_invite_tokens FOR SELECT
TO authenticated
USING (
  public.is_team_manager(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = equipe_id AND ev.organizador_id = auth.uid()
  )
);

-- Atualizar trigger para registrar organizadores como admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, perfil)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    COALESCE((new.raw_user_meta_data->>'perfil')::user_profile, 'visitante')
  );
  
  -- Se perfil é organizador, adicionar role de organizador
  IF COALESCE((new.raw_user_meta_data->>'perfil')::user_profile, 'visitante') = 'organizador' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'organizador');
  END IF;
  
  RETURN new;
END;
$$;