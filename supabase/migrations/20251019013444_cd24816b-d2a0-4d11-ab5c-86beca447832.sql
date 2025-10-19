-- Corrigir views para usar SECURITY INVOKER ao invés de SECURITY DEFINER

-- Recriar view de atletas públicos com SECURITY INVOKER
CREATE OR REPLACE VIEW public.atletas_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  nome,
  equipe_id,
  categoria,
  posicao,
  numero_uniforme,
  foto_url,
  ativo,
  altura,
  peso,
  pe_dominante,
  created_at
FROM public.atletas
WHERE ativo = true;

-- Recriar view de equipes públicas com SECURITY INVOKER
CREATE OR REPLACE VIEW public.equipes_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  evento_id,
  nome,
  categoria,
  modalidade,
  cidade,
  estadio_casa,
  logo_url,
  uniforme_cor,
  uniforme_principal,
  uniforme_alternativo,
  ano_fundacao,
  estatisticas,
  ativa,
  numero_atletas,
  redes_sociais,
  created_at
FROM public.equipes
WHERE ativa = true;