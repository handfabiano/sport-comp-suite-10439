-- Criar tabela de tokens de convite para responsáveis
CREATE TABLE IF NOT EXISTS public.manager_invite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  email text NOT NULL,
  nome_responsavel text,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.manager_invite_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Organizadores podem criar tokens"
  ON public.manager_invite_tokens
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'organizador'));

CREATE POLICY "Organizadores podem ver tokens"
  ON public.manager_invite_tokens
  FOR SELECT
  USING (public.has_role(auth.uid(), 'organizador'));

CREATE POLICY "Tokens podem ser usados via token"
  ON public.manager_invite_tokens
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Criar índice
CREATE INDEX idx_manager_invite_tokens_token ON public.manager_invite_tokens(token);
CREATE INDEX idx_manager_invite_tokens_email ON public.manager_invite_tokens(email);