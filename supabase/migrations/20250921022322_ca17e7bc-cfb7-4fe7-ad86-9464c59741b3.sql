-- Disable RLS temporarily and drop all policies to change enum safely
ALTER TABLE assistidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_pergunta DISABLE ROW LEVEL SECURITY;
ALTER TABLE respostas DISABLE ROW LEVEL SECURITY;
ALTER TABLE historico_respostas DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Now update the enum
ALTER TYPE public.tipo_usuario RENAME TO tipo_usuario_old;

CREATE TYPE public.tipo_usuario AS ENUM (
  'administrador',
  'psicologo', 
  'assistente_social',
  'secretaria'
);

-- Update usuarios table
ALTER TABLE public.usuarios 
ALTER COLUMN tipo_usuario DROP DEFAULT;

ALTER TABLE public.usuarios 
ALTER COLUMN tipo_usuario TYPE public.tipo_usuario 
USING CASE 
  WHEN tipo_usuario::text = 'admin' THEN 'administrador'::public.tipo_usuario
  WHEN tipo_usuario::text = 'funcionario' THEN 'psicologo'::public.tipo_usuario
  WHEN tipo_usuario::text = 'responsavel' THEN 'assistente_social'::public.tipo_usuario
  ELSE 'secretaria'::public.tipo_usuario
END;

ALTER TABLE public.usuarios 
ALTER COLUMN tipo_usuario SET DEFAULT 'psicologo'::public.tipo_usuario;

-- Drop old enum
DROP TYPE public.tipo_usuario_old;