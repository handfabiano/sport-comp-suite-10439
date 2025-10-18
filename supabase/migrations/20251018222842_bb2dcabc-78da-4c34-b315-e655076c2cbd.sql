-- Adicionar campos avançados à tabela equipes
ALTER TABLE public.equipes
ADD COLUMN logo_url TEXT,
ADD COLUMN uniforme_principal JSONB DEFAULT '{"cor_primaria": "", "cor_secundaria": "", "numero": ""}'::jsonb,
ADD COLUMN uniforme_alternativo JSONB DEFAULT '{"cor_primaria": "", "cor_secundaria": "", "numero": ""}'::jsonb,
ADD COLUMN patrocinadores TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN redes_sociais JSONB DEFAULT '{}'::jsonb,
ADD COLUMN contato_tecnico TEXT,
ADD COLUMN contato_responsavel TEXT,
ADD COLUMN ano_fundacao INTEGER,
ADD COLUMN cidade TEXT,
ADD COLUMN estadio_casa TEXT,
ADD COLUMN observacoes TEXT,
ADD COLUMN estatisticas JSONB DEFAULT '{"vitorias": 0, "empates": 0, "derrotas": 0, "gols_pro": 0, "gols_contra": 0}'::jsonb,
ADD COLUMN ativa BOOLEAN DEFAULT true,
ADD COLUMN numero_atletas INTEGER DEFAULT 0,
ADD COLUMN limite_atletas INTEGER,
ADD COLUMN permite_inscricao_aberta BOOLEAN DEFAULT false;

-- Comentários explicativos
COMMENT ON COLUMN public.equipes.uniforme_principal IS 'Cores do uniforme principal: {cor_primaria, cor_secundaria, numero}';
COMMENT ON COLUMN public.equipes.uniforme_alternativo IS 'Cores do uniforme alternativo: {cor_primaria, cor_secundaria, numero}';
COMMENT ON COLUMN public.equipes.redes_sociais IS 'Links das redes sociais: {instagram, facebook, twitter, tiktok}';
COMMENT ON COLUMN public.equipes.estatisticas IS 'Estatísticas da equipe: {vitorias, empates, derrotas, gols_pro, gols_contra}';
COMMENT ON COLUMN public.equipes.permite_inscricao_aberta IS 'Permite que atletas se inscrevam diretamente na equipe';