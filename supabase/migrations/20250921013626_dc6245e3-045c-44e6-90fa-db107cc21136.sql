-- Remover as políticas RLS problemáticas da tabela usuarios
DROP POLICY IF EXISTS "Users can view their own data" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all users" ON public.usuarios;

-- Criar políticas RLS simples e seguras
CREATE POLICY "Users can view their own profile" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id_usuario);

CREATE POLICY "Authenticated users can view all users for admin operations" 
ON public.usuarios 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated users can insert" 
ON public.usuarios 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Users can update their own profile" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = id_usuario);

-- Permitir que usuários admin possam gerenciar outros usuários
CREATE POLICY "Admin users can manage all users" 
ON public.usuarios 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);

-- Remover o trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user();