-- Remove all existing policies that cause recursion
DROP POLICY IF EXISTS "Admin users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Authenticated users can view all users for admin operations" ON usuarios;
DROP POLICY IF EXISTS "Users can view their own profile" ON usuarios;

-- Create security definer function to get current user type safely
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS TEXT AS $$
DECLARE
  user_type TEXT;
BEGIN
  SELECT tipo_usuario INTO user_type 
  FROM public.usuarios 
  WHERE id_usuario = auth.uid();
  
  RETURN user_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Simple policies without recursion
CREATE POLICY "Users can view own profile" 
ON usuarios 
FOR SELECT 
USING (id_usuario = auth.uid());

CREATE POLICY "Users can update own profile" 
ON usuarios 
FOR UPDATE 
USING (id_usuario = auth.uid());

CREATE POLICY "Admin can view all users" 
ON usuarios 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN false
    WHEN EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'tipo_usuario' = 'admin'
    ) THEN true
    ELSE id_usuario = auth.uid()
  END
);

CREATE POLICY "Admin can manage all users" 
ON usuarios 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.raw_user_meta_data->>'tipo_usuario' = 'admin'
  )
);