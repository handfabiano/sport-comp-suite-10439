-- Corrigir função has_role com search_path seguro
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Corrigir função is_team_manager com search_path seguro
CREATE OR REPLACE FUNCTION public.is_team_manager(_user_id uuid, _equipe_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'responsavel'
      AND equipe_id = _equipe_id
  )
$$;

-- Corrigir função get_responsavel_equipes com search_path seguro
CREATE OR REPLACE FUNCTION public.get_responsavel_equipes(_user_id uuid)
RETURNS TABLE(equipe_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT equipe_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = 'responsavel'
    AND equipe_id IS NOT NULL
$$;

-- Corrigir função event_has_started com search_path seguro
CREATE OR REPLACE FUNCTION public.event_has_started(_evento_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.eventos
    WHERE id = _evento_id
      AND data_inicio <= CURRENT_DATE
      AND status IN ('em_andamento', 'finalizado')
  )
$$;

-- Adicionar índices para melhorar performance nas queries de RLS
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_equipe_id ON public.user_roles(equipe_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_atletas_user_id ON public.atletas(user_id);
CREATE INDEX IF NOT EXISTS idx_atletas_equipe_id ON public.atletas(equipe_id);
CREATE INDEX IF NOT EXISTS idx_equipes_responsavel_id ON public.equipes(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_eventos_organizador_id ON public.eventos(organizador_id);