-- Corrigir a função para ter search_path seguro
CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar o usuário na tabela usuarios
  INSERT INTO public.usuarios (id_usuario, nome, email, senha_hash, tipo_usuario, ativo, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)), 
    NEW.email,
    '',  -- senha_hash será vazia pois usamos Supabase Auth
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::public.tipo_usuario, 'funcionario'),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id_usuario) 
  DO UPDATE SET
    nome = COALESCE(NEW.raw_user_meta_data->>'nome', EXCLUDED.nome),
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;