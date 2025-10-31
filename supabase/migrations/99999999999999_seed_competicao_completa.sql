-- =====================================================
-- SCRIPT DE POVOAMENTO: Copa Regional de Futebol 2025
-- =====================================================
-- Cria: 1 Organizador, 8 Responsáveis, 8 Equipes, 48 Atletas
-- =====================================================

-- Limpar dados anteriores (opcional - comentar se não quiser limpar)
-- DELETE FROM equipe_atletas;
-- DELETE FROM atletas;
-- DELETE FROM inscricoes;
-- DELETE FROM equipes;
-- DELETE FROM eventos;
-- DELETE FROM user_roles WHERE role IN ('organizador', 'responsavel', 'atleta');

-- =====================================================
-- 1. CRIAR ORGANIZADOR
-- =====================================================

-- Organizador: Carlos Mendes
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'carlos.mendes@eventos.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  '{"nome": "Carlos Mendes"}',
  NOW(),
  NOW(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Carlos Mendes', 'carlos.mendes@eventos.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'organizador')
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- 2. CRIAR EVENTO/COMPETIÇÃO
-- =====================================================

INSERT INTO public.eventos (
  id,
  nome,
  descricao,
  local,
  data_inicio,
  data_fim,
  status,
  organizador_id,
  modalidade,
  tipo_competicao
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Copa Regional de Futebol 2025',
  'Campeonato regional de futebol com participação de equipes de diversas cidades. Categorias sub-17 e sub-19.',
  'Estádio Municipal de São Paulo',
  '2025-03-15',
  '2025-04-30',
  'inscricoes_abertas',
  '00000000-0000-0000-0000-000000000001',
  'Futebol',
  'Eliminação Simples'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CRIAR 8 RESPONSÁVEIS
-- =====================================================

-- Responsável 1: Ana Silva
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'ana.silva@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Ana Silva"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000001', 'Ana Silva', 'ana.silva@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000001', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000001', 'Ana Silva', 'ana.silva@equipes.com', '(11) 98765-4321') ON CONFLICT (user_id) DO NOTHING;

-- Responsável 2: Bruno Santos
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'bruno.santos@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Bruno Santos"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000002', 'Bruno Santos', 'bruno.santos@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000002', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000002', 'Bruno Santos', 'bruno.santos@equipes.com', '(11) 98765-4322') ON CONFLICT (user_id) DO NOTHING;

-- Responsável 3: Carla Oliveira
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'carla.oliveira@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Carla Oliveira"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000003', 'Carla Oliveira', 'carla.oliveira@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000003', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000003', 'Carla Oliveira', 'carla.oliveira@equipes.com', '(21) 98765-4323') ON CONFLICT (user_id) DO NOTHING;

-- Responsável 4: Diego Costa
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'diego.costa@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Diego Costa"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000004', 'Diego Costa', 'diego.costa@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000004', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000004', 'Diego Costa', 'diego.costa@equipes.com', '(19) 98765-4324') ON CONFLICT (user_id) DO NOTHING;

-- Responsável 5: Eduardo Lima
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'eduardo.lima@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Eduardo Lima"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000005', 'Eduardo Lima', 'eduardo.lima@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000005', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000005', 'Eduardo Lima', 'eduardo.lima@equipes.com', '(11) 98765-4325') ON CONFLICT (user_id) DO NOTHING;

-- Responsável 6: Fernanda Rocha
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'fernanda.rocha@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Fernanda Rocha"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000006', 'Fernanda Rocha', 'fernanda.rocha@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000006', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000006', 'Fernanda Rocha', 'fernanda.rocha@equipes.com', '(11) 98765-4326') ON CONFLICT (user_id) DO NOTHING;

-- Responsável 7: Gabriel Martins
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'gabriel.martins@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Gabriel Martins"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000007', 'Gabriel Martins', 'gabriel.martins@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000007', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000007', 'Gabriel Martins', 'gabriel.martins@equipes.com', '(21) 98765-4327') ON CONFLICT (user_id) DO NOTHING;

-- Responsável 8: Helena Alves
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
'helena.alves@equipes.com', crypt('senha123', gen_salt('bf')), NOW(), '{"nome": "Helena Alves"}', NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nome, email) VALUES ('20000000-0000-0000-0000-000000000008', 'Helena Alves', 'helena.alves@equipes.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('20000000-0000-0000-0000-000000000008', 'responsavel') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.responsaveis (user_id, nome, email, telefone) VALUES ('20000000-0000-0000-0000-000000000008', 'Helena Alves', 'helena.alves@equipes.com', '(19) 98765-4328') ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- 4. CRIAR 8 EQUIPES
-- =====================================================

-- Equipe 1: Tigres FC
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Tigres FC', 'São Paulo', 'SP',
   'Equipe tradicional de São Paulo com foco em formação de base',
   '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Equipe 2: Águias United
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000002', 'Águias United', 'Rio de Janeiro', 'RJ',
   'Time carioca conhecido pela garra e determinação',
   '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Equipe 3: Leões do Sul
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000003', 'Leões do Sul', 'Curitiba', 'PR',
   'Representantes do sul com tradição vitoriosa',
   '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Equipe 4: Falcões FC
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000004', 'Falcões FC', 'Campinas', 'SP',
   'Equipe jovem e promissora do interior paulista',
   '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Equipe 5: Panteras Negras
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000005', 'Panteras Negras', 'Santos', 'SP',
   'Time da baixada santista com estilo ofensivo',
   '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Equipe 6: Tubarões Azuis
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000006', 'Tubarões Azuis', 'Niterói', 'RJ',
   'Equipe fluminense com tradição em categorias de base',
   '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Equipe 7: Lobos da Serra
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000007', 'Lobos da Serra', 'Petrópolis', 'RJ',
   'Time serrano conhecido pela resistência física',
   '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Equipe 8: Dragões Vermelhos
INSERT INTO public.equipes (id, nome, cidade, estado, descricao, responsavel_id, evento_id) VALUES
  ('30000000-0000-0000-0000-000000000008', 'Dragões Vermelhos', 'Sorocaba', 'SP',
   'Equipe combativa do interior com grande torcida',
   '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CRIAR 48 ATLETAS (6 por equipe)
-- =====================================================

-- Vou criar uma função helper para gerar IDs únicos
-- Equipe 1: Tigres FC - 6 atletas

-- Atleta 1.1: João Silva (Tigres FC)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0001-000000000001', 'João Pedro Silva', '2007-03-15', 'masculino', 'Sub-19', '123.456.789-01', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000001') ON CONFLICT DO NOTHING;

-- Atleta 1.2: Gabriel Santos (Tigres FC)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0001-000000000002', 'Gabriel dos Santos', '2008-07-22', 'masculino', 'Sub-17', '123.456.789-02', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000002') ON CONFLICT DO NOTHING;

-- Atleta 1.3: Lucas Oliveira (Tigres FC)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0001-000000000003', 'Lucas Oliveira', '2007-11-08', 'masculino', 'Sub-19', '123.456.789-03', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000003') ON CONFLICT DO NOTHING;

-- Atleta 1.4: Rafael Costa (Tigres FC)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0001-000000000004', 'Rafael Costa', '2008-01-30', 'masculino', 'Sub-17', '123.456.789-04', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000004') ON CONFLICT DO NOTHING;

-- Atleta 1.5: Matheus Lima (Tigres FC)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0001-000000000005', 'Matheus Lima', '2007-05-17', 'masculino', 'Sub-19', '123.456.789-05', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000005') ON CONFLICT DO NOTHING;

-- Atleta 1.6: Pedro Henrique (Tigres FC)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0001-000000000006', 'Pedro Henrique', '2008-09-12', 'masculino', 'Sub-17', '123.456.789-06', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000006') ON CONFLICT DO NOTHING;

-- Equipe 2: Águias United - 6 atletas

-- Atleta 2.1: Vinicius Souza (Águias United)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0002-000000000001', 'Vinicius Souza', '2007-04-20', 'masculino', 'Sub-19', '234.567.890-01', '20000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000001') ON CONFLICT DO NOTHING;

-- Atleta 2.2: Bruno Fernandes (Águias United)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0002-000000000002', 'Bruno Fernandes', '2008-06-15', 'masculino', 'Sub-17', '234.567.890-02', '20000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000002') ON CONFLICT DO NOTHING;

-- Atleta 2.3: Rodrigo Alves (Águias United)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0002-000000000003', 'Rodrigo Alves', '2007-12-03', 'masculino', 'Sub-19', '234.567.890-03', '20000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000003') ON CONFLICT DO NOTHING;

-- Atleta 2.4: Felipe Ribeiro (Águias United)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0002-000000000004', 'Felipe Ribeiro', '2008-02-28', 'masculino', 'Sub-17', '234.567.890-04', '20000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000004') ON CONFLICT DO NOTHING;

-- Atleta 2.5: André Mendes (Águias United)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0002-000000000005', 'André Mendes', '2007-08-09', 'masculino', 'Sub-19', '234.567.890-05', '20000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000005') ON CONFLICT DO NOTHING;

-- Atleta 2.6: Thiago Martins (Águias United)
INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0002-000000000006', 'Thiago Martins', '2008-10-25', 'masculino', 'Sub-17', '234.567.890-06', '20000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000006') ON CONFLICT DO NOTHING;

-- Equipe 3: Leões do Sul - 6 atletas

INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0003-000000000001', 'Diego Rocha', '2007-01-14', 'masculino', 'Sub-19', '345.678.901-01', '20000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0003-000000000002', 'Gustavo Pinto', '2008-05-19', 'masculino', 'Sub-17', '345.678.901-02', '20000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0003-000000000003', 'Marcelo Silva', '2007-09-27', 'masculino', 'Sub-19', '345.678.901-03', '20000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0003-000000000004', 'Eduardo Santos', '2008-03-11', 'masculino', 'Sub-17', '345.678.901-04', '20000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0003-000000000005', 'Fernando Costa', '2007-07-06', 'masculino', 'Sub-19', '345.678.901-05', '20000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0003-000000000006', 'Leonardo Lima', '2008-11-22', 'masculino', 'Sub-17', '345.678.901-06', '20000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000001'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000002'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000003'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000004'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000005'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000006')
ON CONFLICT DO NOTHING;

-- Equipe 4: Falcões FC - 6 atletas

INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0004-000000000001', 'Julio César', '2007-02-18', 'masculino', 'Sub-19', '456.789.012-01', '20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0004-000000000002', 'Igor Souza', '2008-06-23', 'masculino', 'Sub-17', '456.789.012-02', '20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0004-000000000003', 'Daniel Oliveira', '2007-10-30', 'masculino', 'Sub-19', '456.789.012-03', '20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0004-000000000004', 'Carlos Eduardo', '2008-04-14', 'masculino', 'Sub-17', '456.789.012-04', '20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0004-000000000005', 'Renato Alves', '2007-08-08', 'masculino', 'Sub-19', '456.789.012-05', '20000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0004-000000000006', 'Paulo Henrique', '2008-12-19', 'masculino', 'Sub-17', '456.789.012-06', '20000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000001'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000002'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000003'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000004'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000005'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000006')
ON CONFLICT DO NOTHING;

-- Equipe 5: Panteras Negras - 6 atletas

INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0005-000000000001', 'Alexandre Silva', '2007-03-22', 'masculino', 'Sub-19', '567.890.123-01', '20000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0005-000000000002', 'Renan Costa', '2008-07-27', 'masculino', 'Sub-17', '567.890.123-02', '20000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0005-000000000003', 'Fabio Santos', '2007-11-05', 'masculino', 'Sub-19', '567.890.123-03', '20000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0005-000000000004', 'Henrique Lima', '2008-05-16', 'masculino', 'Sub-17', '567.890.123-04', '20000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0005-000000000005', 'Ricardo Alves', '2007-09-10', 'masculino', 'Sub-19', '567.890.123-05', '20000000-0000-0000-0000-000000000005'),
  ('40000000-0000-0000-0005-000000000006', 'Sergio Oliveira', '2008-01-24', 'masculino', 'Sub-17', '567.890.123-06', '20000000-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0005-000000000001'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0005-000000000002'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0005-000000000003'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0005-000000000004'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0005-000000000005'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0005-000000000006')
ON CONFLICT DO NOTHING;

-- Equipe 6: Tubarões Azuis - 6 atletas

INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0006-000000000001', 'Márcio Rocha', '2007-04-26', 'masculino', 'Sub-19', '678.901.234-01', '20000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0006-000000000002', 'Wesley Pinto', '2008-08-31', 'masculino', 'Sub-17', '678.901.234-02', '20000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0006-000000000003', 'Hugo Silva', '2007-12-09', 'masculino', 'Sub-19', '678.901.234-03', '20000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0006-000000000004', 'Caio Santos', '2008-06-20', 'masculino', 'Sub-17', '678.901.234-04', '20000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0006-000000000005', 'Vitor Costa', '2007-10-14', 'masculino', 'Sub-19', '678.901.234-05', '20000000-0000-0000-0000-000000000006'),
  ('40000000-0000-0000-0006-000000000006', 'Samuel Lima', '2008-02-28', 'masculino', 'Sub-17', '678.901.234-06', '20000000-0000-0000-0000-000000000006')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0006-000000000001'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0006-000000000002'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0006-000000000003'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0006-000000000004'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0006-000000000005'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0006-000000000006')
ON CONFLICT DO NOTHING;

-- Equipe 7: Lobos da Serra - 6 atletas

INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0007-000000000001', 'Arthur Mendes', '2007-05-30', 'masculino', 'Sub-19', '789.012.345-01', '20000000-0000-0000-0000-000000000007'),
  ('40000000-0000-0000-0007-000000000002', 'Nicolas Alves', '2008-09-05', 'masculino', 'Sub-17', '789.012.345-02', '20000000-0000-0000-0000-000000000007'),
  ('40000000-0000-0000-0007-000000000003', 'Bernardo Oliveira', '2007-01-13', 'masculino', 'Sub-19', '789.012.345-03', '20000000-0000-0000-0000-000000000007'),
  ('40000000-0000-0000-0007-000000000004', 'Miguel Santos', '2008-07-24', 'masculino', 'Sub-17', '789.012.345-04', '20000000-0000-0000-0000-000000000007'),
  ('40000000-0000-0000-0007-000000000005', 'Davi Costa', '2007-11-18', 'masculino', 'Sub-19', '789.012.345-05', '20000000-0000-0000-0000-000000000007'),
  ('40000000-0000-0000-0007-000000000006', 'Enzo Lima', '2008-03-02', 'masculino', 'Sub-17', '789.012.345-06', '20000000-0000-0000-0000-000000000007')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES
  ('30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0007-000000000001'),
  ('30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0007-000000000002'),
  ('30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0007-000000000003'),
  ('30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0007-000000000004'),
  ('30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0007-000000000005'),
  ('30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0007-000000000006')
ON CONFLICT DO NOTHING;

-- Equipe 8: Dragões Vermelhos - 6 atletas

INSERT INTO public.atletas (id, nome, data_nascimento, sexo, categoria, documento, user_id) VALUES
  ('40000000-0000-0000-0008-000000000001', 'Lorenzo Rocha', '2007-06-03', 'masculino', 'Sub-19', '890.123.456-01', '20000000-0000-0000-0000-000000000008'),
  ('40000000-0000-0000-0008-000000000002', 'Heitor Pinto', '2008-10-09', 'masculino', 'Sub-17', '890.123.456-02', '20000000-0000-0000-0000-000000000008'),
  ('40000000-0000-0000-0008-000000000003', 'Theo Silva', '2007-02-17', 'masculino', 'Sub-19', '890.123.456-03', '20000000-0000-0000-0000-000000000008'),
  ('40000000-0000-0000-0008-000000000004', 'Murilo Santos', '2008-08-28', 'masculino', 'Sub-17', '890.123.456-04', '20000000-0000-0000-0000-000000000008'),
  ('40000000-0000-0000-0008-000000000005', 'Pietro Costa', '2007-12-22', 'masculino', 'Sub-19', '890.123.456-05', '20000000-0000-0000-0000-000000000008'),
  ('40000000-0000-0000-0008-000000000006', 'Benicio Lima', '2008-04-06', 'masculino', 'Sub-17', '890.123.456-06', '20000000-0000-0000-0000-000000000008')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.equipe_atletas (equipe_id, atleta_id) VALUES
  ('30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0008-000000000001'),
  ('30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0008-000000000002'),
  ('30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0008-000000000003'),
  ('30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0008-000000000004'),
  ('30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0008-000000000005'),
  ('30000000-0000-0000-0000-000000000008', '40000000-0000-0000-0008-000000000006')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CRIAR INSCRIÇÕES (OPCIONAL - todas pendentes)
-- =====================================================

INSERT INTO public.inscricoes (equipe_id, evento_id, status) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'pendente'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'pendente'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'pendente'),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'pendente'),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'pendente'),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'pendente'),
  ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'pendente'),
  ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'pendente')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. RESUMO DO POVOAMENTO
-- =====================================================

-- Verificar dados criados
SELECT
  'ORGANIZADOR' as tipo,
  COUNT(*) as total
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'organizador'

UNION ALL

SELECT
  'RESPONSÁVEIS' as tipo,
  COUNT(*) as total
FROM public.responsaveis

UNION ALL

SELECT
  'EVENTOS' as tipo,
  COUNT(*) as total
FROM public.eventos

UNION ALL

SELECT
  'EQUIPES' as tipo,
  COUNT(*) as total
FROM public.equipes

UNION ALL

SELECT
  'ATLETAS' as tipo,
  COUNT(*) as total
FROM public.atletas

UNION ALL

SELECT
  'VÍNCULOS EQUIPE-ATLETA' as tipo,
  COUNT(*) as total
FROM public.equipe_atletas

UNION ALL

SELECT
  'INSCRIÇÕES' as tipo,
  COUNT(*) as total
FROM public.inscricoes;

-- =====================================================
-- FIM DO SCRIPT DE POVOAMENTO
-- =====================================================
-- CREDENCIAIS DE ACESSO:
--
-- ORGANIZADOR:
--   Email: carlos.mendes@eventos.com
--   Senha: senha123
--
-- RESPONSÁVEIS (todos com senha: senha123):
--   ana.silva@equipes.com
--   bruno.santos@equipes.com
--   carla.oliveira@equipes.com
--   diego.costa@equipes.com
--   eduardo.lima@equipes.com
--   fernanda.rocha@equipes.com
--   gabriel.martins@equipes.com
--   helena.alves@equipes.com
-- =====================================================
