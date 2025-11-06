-- Atualizar trigger para criar roles para todos os perfis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_perfil user_profile;
BEGIN
  -- Extrair perfil dos metadados
  user_perfil := COALESCE((NEW.raw_user_meta_data->>'perfil')::user_profile, 'visitante');
  
  -- Criar profile
  INSERT INTO public.profiles (id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    user_perfil
  );
  
  -- Criar role correspondente se não for visitante
  IF user_perfil IN ('organizador', 'responsavel', 'atleta') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_perfil::text::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;