-- Recriar view atletas_public sem SECURITY DEFINER
DROP VIEW IF EXISTS public.atletas_public;

CREATE VIEW public.atletas_public 
WITH (security_invoker = true)
AS
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