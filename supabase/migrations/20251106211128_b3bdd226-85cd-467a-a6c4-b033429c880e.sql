-- Ajustar política de INSERT na tabela responsaveis para permitir que usuários criem seu próprio registro
DROP POLICY IF EXISTS "Organizadores podem criar responsáveis" ON public.responsaveis;

-- Nova política: Organizadores podem criar qualquer responsável OU usuários podem criar seu próprio registro
CREATE POLICY "Criar responsáveis"
ON public.responsaveis
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'organizador'::app_role) 
  OR auth.uid() = user_id
);

-- Também precisamos ajustar a política para permitir que responsáveis criem suas próprias equipes
DROP POLICY IF EXISTS "Criar equipes" ON public.equipes;

CREATE POLICY "Criar equipes"
ON public.equipes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = responsavel_id 
  OR has_role(auth.uid(), 'organizador'::app_role)
  OR (EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = equipes.evento_id 
    AND eventos.organizador_id = auth.uid()
  ))
);