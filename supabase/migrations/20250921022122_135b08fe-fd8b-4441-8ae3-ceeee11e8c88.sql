-- First, drop policies that reference tipo_usuario enum values
DROP POLICY IF EXISTS "Users can view assigned assistidos" ON assistidos;
DROP POLICY IF EXISTS "Admin users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Users can view questions they have permission for" ON perguntas;
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissoes_pergunta;
DROP POLICY IF EXISTS "Users can view their own permissions" ON permissoes_pergunta;
DROP POLICY IF EXISTS "Users can view responses for their assistidos" ON respostas;
DROP POLICY IF EXISTS "Users can view history of their responses" ON historico_respostas;

-- Drop the admin function that uses the old enum
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