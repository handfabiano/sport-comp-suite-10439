-- Adicionar campos avançados à tabela eventos
ALTER TABLE public.eventos
ADD COLUMN tipo_competicao TEXT DEFAULT 'eliminatorio' CHECK (tipo_competicao IN ('eliminatorio', 'grupos', 'pontos_corridos', 'mata_mata', 'hibrido')),
ADD COLUMN aceita_inscricoes_individuais BOOLEAN DEFAULT true,
ADD COLUMN aceita_inscricoes_equipes BOOLEAN DEFAULT true,
ADD COLUMN valor_inscricao DECIMAL(10,2),
ADD COLUMN limite_atletas_por_equipe INTEGER DEFAULT 20,
ADD COLUMN limite_equipes_por_categoria INTEGER,
ADD COLUMN permite_transferencia BOOLEAN DEFAULT false,
ADD COLUMN exige_documento BOOLEAN DEFAULT true,
ADD COLUMN exige_comprovante_pagamento BOOLEAN DEFAULT false,
ADD COLUMN campos_personalizados JSONB DEFAULT '[]'::jsonb,
ADD COLUMN configuracoes_partida JSONB DEFAULT '{}'::jsonb,
ADD COLUMN premiacao JSONB DEFAULT '[]'::jsonb,
ADD COLUMN patrocinadores TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN contato_organizador TEXT,
ADD COLUMN redes_sociais JSONB DEFAULT '{}'::jsonb,
ADD COLUMN regras_especificas TEXT,
ADD COLUMN observacoes TEXT,
ADD COLUMN numero_fases INTEGER DEFAULT 1,
ADD COLUMN pontos_vitoria INTEGER DEFAULT 3,
ADD COLUMN pontos_empate INTEGER DEFAULT 1,
ADD COLUMN pontos_derrota INTEGER DEFAULT 0,
ADD COLUMN criterios_desempate TEXT[] DEFAULT ARRAY['saldo_gols', 'gols_pro', 'confronto_direto']::TEXT[];

-- Comentários explicativos
COMMENT ON COLUMN public.eventos.tipo_competicao IS 'Formato da competição: eliminatório direto, fase de grupos, pontos corridos, mata-mata ou híbrido';
COMMENT ON COLUMN public.eventos.aceita_inscricoes_individuais IS 'Permite inscrição de atletas individuais sem equipe';
COMMENT ON COLUMN public.eventos.aceita_inscricoes_equipes IS 'Permite inscrição de equipes completas';
COMMENT ON COLUMN public.eventos.campos_personalizados IS 'Array de objetos com campos extras do formulário: [{name, label, type, required, options}]';
COMMENT ON COLUMN public.eventos.configuracoes_partida IS 'Configurações específicas das partidas: {tempo_jogo, intervalo, prorrogacao, penaltis}';
COMMENT ON COLUMN public.eventos.premiacao IS 'Array com premiação por colocação: [{posicao, premio, valor}]';
COMMENT ON COLUMN public.eventos.redes_sociais IS 'Links das redes sociais do evento: {instagram, facebook, twitter, youtube}';
COMMENT ON COLUMN public.eventos.criterios_desempate IS 'Ordem dos critérios para desempate na classificação';