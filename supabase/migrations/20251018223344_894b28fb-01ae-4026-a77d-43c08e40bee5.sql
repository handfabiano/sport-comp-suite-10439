-- Adicionar campos avançados à tabela atletas
ALTER TABLE public.atletas
ADD COLUMN email TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN contato_emergencia TEXT,
ADD COLUMN sexo TEXT CHECK (sexo IN ('masculino', 'feminino', 'outro')),
ADD COLUMN nacionalidade TEXT DEFAULT 'Brasileiro',
ADD COLUMN cidade TEXT,
ADD COLUMN estado TEXT,
ADD COLUMN altura DECIMAL(3,2),
ADD COLUMN peso DECIMAL(5,2),
ADD COLUMN pe_dominante TEXT CHECK (pe_dominante IN ('direito', 'esquerdo', 'ambos')),
ADD COLUMN tipo_sanguineo TEXT,
ADD COLUMN alergias TEXT,
ADD COLUMN medicamentos TEXT,
ADD COLUMN necessidades_especiais TEXT,
ADD COLUMN cpf TEXT,
ADD COLUMN rg TEXT,
ADD COLUMN certidao_nascimento TEXT,
ADD COLUMN comprovante_residencia_url TEXT,
ADD COLUMN nome_responsavel TEXT,
ADD COLUMN cpf_responsavel TEXT,
ADD COLUMN contato_responsavel TEXT,
ADD COLUMN parentesco_responsavel TEXT,
ADD COLUMN redes_sociais JSONB DEFAULT '{}'::jsonb,
ADD COLUMN clubes_anteriores TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN observacoes TEXT,
ADD COLUMN ativo BOOLEAN DEFAULT true,
ADD COLUMN transferivel BOOLEAN DEFAULT false,
ADD COLUMN data_ultima_avaliacao DATE,
ADD COLUMN avaliacoes JSONB DEFAULT '[]'::jsonb;

-- Comentários explicativos
COMMENT ON COLUMN public.atletas.altura IS 'Altura em metros (ex: 1.75)';
COMMENT ON COLUMN public.atletas.peso IS 'Peso em quilogramas (ex: 70.5)';
COMMENT ON COLUMN public.atletas.redes_sociais IS 'Links das redes sociais: {instagram, facebook, twitter, tiktok}';
COMMENT ON COLUMN public.atletas.avaliacoes IS 'Histórico de avaliações físicas e técnicas';
COMMENT ON COLUMN public.atletas.transferivel IS 'Indica se o atleta pode ser transferido para outra equipe';

-- Remover constraint de unique no documento e adicionar no CPF
ALTER TABLE public.atletas DROP CONSTRAINT IF EXISTS atletas_documento_key;
CREATE UNIQUE INDEX IF NOT EXISTS atletas_cpf_unique ON public.atletas(cpf) WHERE cpf IS NOT NULL;