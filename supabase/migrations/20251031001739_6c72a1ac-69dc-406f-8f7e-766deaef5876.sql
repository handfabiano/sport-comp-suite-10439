-- Adicionar colunas de regras em eventos
ALTER TABLE public.eventos 
ADD COLUMN IF NOT EXISTS idade_minima INTEGER,
ADD COLUMN IF NOT EXISTS idade_maxima INTEGER,
ADD COLUMN IF NOT EXISTS sexo_competicao TEXT CHECK (sexo_competicao IN ('masculino', 'feminino', 'misto')),
ADD COLUMN IF NOT EXISTS limite_atletas_masculino INTEGER,
ADD COLUMN IF NOT EXISTS limite_atletas_feminino INTEGER;

-- Adicionar coluna sexo em atletas
ALTER TABLE public.atletas
ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('masculino', 'feminino'));

-- Criar tabela equipe_atletas para relação N:N
CREATE TABLE IF NOT EXISTS public.equipe_atletas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  atleta_id UUID NOT NULL REFERENCES public.atletas(id) ON DELETE CASCADE,
  data_entrada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipe_id, atleta_id)
);

-- Migrar dados existentes de atletas para equipe_atletas
INSERT INTO public.equipe_atletas (equipe_id, atleta_id, ativo)
SELECT equipe_id, id, ativo
FROM public.atletas
WHERE equipe_id IS NOT NULL
ON CONFLICT (equipe_id, atleta_id) DO NOTHING;

-- Habilitar RLS na tabela equipe_atletas
ALTER TABLE public.equipe_atletas ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver atletas de equipes
CREATE POLICY "Ver atletas de equipes"
ON public.equipe_atletas
FOR SELECT
TO authenticated
USING (true);

-- Política: Responsáveis e organizadores podem adicionar atletas
CREATE POLICY "Adicionar atletas a equipes"
ON public.equipe_atletas
FOR INSERT
TO authenticated
WITH CHECK (
  is_team_manager(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = equipe_atletas.equipe_id 
    AND ev.organizador_id = auth.uid()
  )
);

-- Política: Responsáveis e organizadores podem atualizar (ativar/desativar)
CREATE POLICY "Atualizar atletas de equipes"
ON public.equipe_atletas
FOR UPDATE
TO authenticated
USING (
  is_team_manager(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = equipe_atletas.equipe_id 
    AND ev.organizador_id = auth.uid()
  )
);

-- Política: Responsáveis e organizadores podem remover atletas
CREATE POLICY "Remover atletas de equipes"
ON public.equipe_atletas
FOR DELETE
TO authenticated
USING (
  is_team_manager(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM equipes e
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE e.id = equipe_atletas.equipe_id 
    AND ev.organizador_id = auth.uid()
  )
);

-- Remover políticas antigas de atletas que dependem de equipe_id
DROP POLICY IF EXISTS "Todos podem ver atletas" ON public.atletas;
DROP POLICY IF EXISTS "Adicionar atletas com restrições" ON public.atletas;
DROP POLICY IF EXISTS "Remover atletas com restrições" ON public.atletas;
DROP POLICY IF EXISTS "Atualizar atletas" ON public.atletas;

-- Remover políticas de storage que dependem de equipe_id
DROP POLICY IF EXISTS "Organizadores podem fazer upload de fotos de atletas" ON storage.objects;
DROP POLICY IF EXISTS "Organizadores podem atualizar fotos de atletas" ON storage.objects;
DROP POLICY IF EXISTS "Organizadores podem deletar fotos de atletas" ON storage.objects;

-- Remover view que depende de equipe_id
DROP VIEW IF EXISTS public.atletas_public;

-- Agora podemos remover a coluna equipe_id
ALTER TABLE public.atletas DROP COLUMN IF EXISTS equipe_id;

-- Recriar view atletas_public sem equipe_id
CREATE OR REPLACE VIEW public.atletas_public AS
SELECT 
  id,
  nome,
  categoria,
  posicao,
  foto_url,
  pe_dominante,
  numero_uniforme,
  altura,
  peso,
  ativo,
  created_at
FROM public.atletas
WHERE ativo = true;

-- Recriar políticas RLS para atletas (sem dependência de equipe_id)
CREATE POLICY "Todos podem ver atletas"
ON public.atletas
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM equipe_atletas ea
    JOIN equipes e ON ea.equipe_id = e.id
    JOIN eventos ev ON e.evento_id = ev.id
    WHERE ea.atleta_id = atletas.id
    AND (ev.organizador_id = auth.uid() OR is_team_manager(auth.uid(), e.id))
  )
);

CREATE POLICY "Adicionar atletas com restrições"
ON public.atletas
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'organizador')
);

CREATE POLICY "Remover atletas com restrições"
ON public.atletas
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'organizador')
);

CREATE POLICY "Atualizar atletas"
ON public.atletas
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'organizador')
  OR EXISTS (
    SELECT 1 FROM equipe_atletas ea
    JOIN equipes e ON ea.equipe_id = e.id
    WHERE ea.atleta_id = atletas.id
    AND is_team_manager(auth.uid(), e.id)
  )
);

-- Recriar políticas de storage sem dependência de equipe_id
CREATE POLICY "Organizadores podem fazer upload de fotos de atletas"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'atletas'
  AND has_role(auth.uid(), 'organizador')
);

CREATE POLICY "Organizadores podem atualizar fotos de atletas"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'atletas'
  AND has_role(auth.uid(), 'organizador')
);

CREATE POLICY "Organizadores podem deletar fotos de atletas"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'atletas'
  AND has_role(auth.uid(), 'organizador')
);