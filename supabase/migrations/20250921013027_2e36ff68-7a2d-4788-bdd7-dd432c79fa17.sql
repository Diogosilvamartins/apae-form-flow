-- Criar usuários no Supabase Auth para corresponder aos usuários da tabela usuarios
-- Nota: Estes serão criados no sistema de auth do Supabase

-- Primeiro, vamos criar uma migração para sincronizar os dados
-- Criar um trigger para quando um usuário fizer login

CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar o usuário na tabela usuarios
  INSERT INTO public.usuarios (id_usuario, nome, email, senha_hash, tipo_usuario, ativo, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)), 
    NEW.email,
    '',  -- senha_hash será vazia pois usamos Supabase Auth
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::tipo_usuario, 'funcionario'),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para novos usuários do auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user();