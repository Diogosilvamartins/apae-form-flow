-- Fix infinite recursion in usuarios table policies
DROP POLICY IF EXISTS "Admin users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Authenticated users can view all users for admin operations" ON usuarios;
DROP POLICY IF EXISTS "Users can view their own profile" ON usuarios;

-- Create fixed policies without recursion
CREATE POLICY "Admin users can manage all users" 
ON usuarios 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users au 
    JOIN usuarios u ON u.id_usuario = au.id 
    WHERE au.id = auth.uid() 
    AND u.tipo_usuario = 'admin'::tipo_usuario
  )
);

CREATE POLICY "Authenticated users can view all users for admin operations" 
ON usuarios 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own profile" 
ON usuarios 
FOR SELECT 
USING (id_usuario = auth.uid());