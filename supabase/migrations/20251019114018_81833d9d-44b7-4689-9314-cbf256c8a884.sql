-- Adicionar coluna sexo na tabela equipes
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS sexo text DEFAULT 'masculino';

-- Adicionar comentário
COMMENT ON COLUMN public.equipes.sexo IS 'Naipe da equipe: masculino, feminino ou misto';