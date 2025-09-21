-- Update tipo_usuario enum to new values
ALTER TYPE public.tipo_usuario RENAME TO tipo_usuario_old;

CREATE TYPE public.tipo_usuario AS ENUM (
  'administrador',
  'psicologo', 
  'assistente_social',
  'secretaria'
);

-- Update usuarios table to use new enum
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

-- Update the admin function to use new enum value
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.usuarios
    where id_usuario = _uid and tipo_usuario = 'administrador'::public.tipo_usuario
  );
$$;