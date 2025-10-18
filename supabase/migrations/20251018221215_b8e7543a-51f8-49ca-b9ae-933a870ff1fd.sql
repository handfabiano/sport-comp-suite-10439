-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipo ENUM para perfis de usuário
CREATE TYPE user_profile AS ENUM ('organizador', 'atleta', 'arbitro', 'visitante');

-- Tipo ENUM para status de eventos
CREATE TYPE event_status AS ENUM ('inscricoes_abertas', 'em_andamento', 'finalizado', 'cancelado');

-- Tipo ENUM para status de inscrições
CREATE TYPE inscription_status AS ENUM ('pendente', 'aprovada', 'rejeitada');

-- Tipo ENUM para modalidades esportivas
CREATE TYPE sport_modality AS ENUM ('futebol', 'volei', 'basquete', 'futsal', 'handebol', 'tenis', 'natacao', 'atletismo', 'outro');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil user_profile NOT NULL DEFAULT 'visitante',
  telefone TEXT,
  documento TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  local TEXT NOT NULL,
  modalidade sport_modality NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status event_status NOT NULL DEFAULT 'inscricoes_abertas',
  categorias TEXT[] NOT NULL DEFAULT '{}',
  vagas_por_categoria INTEGER DEFAULT 50,
  banner_url TEXT,
  regulamento_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de equipes
CREATE TABLE public.equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tecnico TEXT,
  modalidade sport_modality NOT NULL,
  categoria TEXT NOT NULL,
  uniforme_cor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de atletas
CREATE TABLE public.atletas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  equipe_id UUID REFERENCES public.equipes(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  documento TEXT NOT NULL,
  data_nascimento DATE,
  categoria TEXT NOT NULL,
  foto_url TEXT,
  numero_uniforme INTEGER,
  posicao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(documento)
);

-- Tabela de inscrições
CREATE TABLE public.inscricoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  atleta_id UUID REFERENCES public.atletas(id) ON DELETE CASCADE,
  equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  status inscription_status NOT NULL DEFAULT 'pendente',
  pagamento_confirmado BOOLEAN DEFAULT false,
  valor_pago DECIMAL(10,2),
  data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de partidas
CREATE TABLE public.partidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  equipe_a_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  equipe_b_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  arbitro_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_partida TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT NOT NULL,
  fase TEXT NOT NULL,
  categoria TEXT NOT NULL,
  placar_a INTEGER DEFAULT 0,
  placar_b INTEGER DEFAULT 0,
  finalizada BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de rankings
CREATE TABLE public.rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
  atleta_id UUID REFERENCES public.atletas(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  pontos INTEGER DEFAULT 0,
  vitorias INTEGER DEFAULT 0,
  empates INTEGER DEFAULT 0,
  derrotas INTEGER DEFAULT 0,
  gols_pro INTEGER DEFAULT 0,
  gols_contra INTEGER DEFAULT 0,
  saldo_gols INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para eventos
CREATE POLICY "Todos podem visualizar eventos"
  ON public.eventos FOR SELECT
  USING (true);

CREATE POLICY "Organizadores podem criar eventos"
  ON public.eventos FOR INSERT
  WITH CHECK (auth.uid() = organizador_id);

CREATE POLICY "Organizadores podem atualizar seus eventos"
  ON public.eventos FOR UPDATE
  USING (auth.uid() = organizador_id);

CREATE POLICY "Organizadores podem deletar seus eventos"
  ON public.eventos FOR DELETE
  USING (auth.uid() = organizador_id);

-- Políticas RLS para equipes
CREATE POLICY "Todos podem visualizar equipes"
  ON public.equipes FOR SELECT
  USING (true);

CREATE POLICY "Organizadores podem gerenciar equipes de seus eventos"
  ON public.equipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.eventos
      WHERE eventos.id = equipes.evento_id
      AND eventos.organizador_id = auth.uid()
    )
  );

-- Políticas RLS para atletas
CREATE POLICY "Todos podem visualizar atletas"
  ON public.atletas FOR SELECT
  USING (true);

CREATE POLICY "Organizadores e próprio atleta podem gerenciar"
  ON public.atletas FOR ALL
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.equipes e
      JOIN public.eventos ev ON e.evento_id = ev.id
      WHERE e.id = atletas.equipe_id
      AND ev.organizador_id = auth.uid()
    )
  );

-- Políticas RLS para inscrições
CREATE POLICY "Todos podem visualizar inscrições"
  ON public.inscricoes FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem se inscrever"
  ON public.inscricoes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Organizadores podem gerenciar inscrições de seus eventos"
  ON public.inscricoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.eventos
      WHERE eventos.id = inscricoes.evento_id
      AND eventos.organizador_id = auth.uid()
    )
  );

-- Políticas RLS para partidas
CREATE POLICY "Todos podem visualizar partidas"
  ON public.partidas FOR SELECT
  USING (true);

CREATE POLICY "Organizadores e árbitros podem gerenciar partidas"
  ON public.partidas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.eventos
      WHERE eventos.id = partidas.evento_id
      AND eventos.organizador_id = auth.uid()
    ) OR
    auth.uid() = arbitro_id
  );

-- Políticas RLS para rankings
CREATE POLICY "Todos podem visualizar rankings"
  ON public.rankings FOR SELECT
  USING (true);

CREATE POLICY "Organizadores podem gerenciar rankings"
  ON public.rankings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.eventos
      WHERE eventos.id = rankings.evento_id
      AND eventos.organizador_id = auth.uid()
    )
  );

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, perfil)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    COALESCE((new.raw_user_meta_data->>'perfil')::user_profile, 'visitante')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_eventos
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_equipes
  BEFORE UPDATE ON public.equipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_atletas
  BEFORE UPDATE ON public.atletas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_inscricoes
  BEFORE UPDATE ON public.inscricoes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_partidas
  BEFORE UPDATE ON public.partidas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();