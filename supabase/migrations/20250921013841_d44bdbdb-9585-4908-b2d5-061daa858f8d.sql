-- Criar função para inserir usuário no sistema quando fizer signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id_usuario, nome, email, senha_hash, tipo_usuario, ativo, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    '',
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::public.tipo_usuario, 'funcionario'),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id_usuario) DO UPDATE SET
    nome = COALESCE(NEW.raw_user_meta_data->>'nome', EXCLUDED.nome),
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();