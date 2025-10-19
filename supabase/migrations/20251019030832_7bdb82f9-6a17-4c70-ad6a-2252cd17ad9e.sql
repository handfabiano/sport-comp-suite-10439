-- Criar tabela de responsáveis
CREATE TABLE public.responsaveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  documento TEXT,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;

-- Responsáveis podem ver seu próprio perfil
CREATE POLICY "Responsáveis podem ver seu próprio perfil"
ON public.responsaveis
FOR SELECT
USING (auth.uid() = user_id);

-- Organizadores podem ver todos os responsáveis
CREATE POLICY "Organizadores podem ver responsáveis"
ON public.responsaveis
FOR SELECT
USING (has_role(auth.uid(), 'organizador'));

-- Organizadores podem criar responsáveis
CREATE POLICY "Organizadores podem criar responsáveis"
ON public.responsaveis
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'organizador'));

-- Organizadores e o próprio responsável podem atualizar
CREATE POLICY "Organizadores e responsável podem atualizar"
ON public.responsaveis
FOR UPDATE
USING (has_role(auth.uid(), 'organizador') OR auth.uid() = user_id);

-- Organizadores podem deletar responsáveis
CREATE POLICY "Organizadores podem deletar responsáveis"
ON public.responsaveis
FOR DELETE
USING (has_role(auth.uid(), 'organizador'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_responsaveis_updated_at
BEFORE UPDATE ON public.responsaveis
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Função para obter todas as equipes de um responsável
CREATE OR REPLACE FUNCTION public.get_responsavel_equipes(_user_id uuid)
RETURNS TABLE(equipe_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT equipe_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = 'responsavel'
    AND equipe_id IS NOT NULL
$$;