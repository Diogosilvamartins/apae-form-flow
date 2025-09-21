-- Clean up previous helper and policies
DROP POLICY IF EXISTS "Admin can view all users" ON usuarios;
DROP POLICY IF EXISTS "Admin can manage all users" ON usuarios;
DROP FUNCTION IF EXISTS public.get_current_user_type();

-- Create a secure helper to check admin using public.usuarios
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.usuarios
    where id_usuario = _uid and tipo_usuario = 'admin'::public.tipo_usuario
  );
$$;

-- Recreate admin policies using the helper
CREATE POLICY "Admin can view all users"
ON usuarios
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can manage all users"
ON usuarios
FOR ALL
USING (public.is_admin(auth.uid()));