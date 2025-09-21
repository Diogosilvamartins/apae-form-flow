-- Recreate admin function with new enum
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

-- Re-enable RLS on all tables
ALTER TABLE assistidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_pergunta ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_respostas ENABLE ROW LEVEL SECURITY;

-- Recreate all necessary policies with new enum values

-- Policies for usuarios table
CREATE POLICY "Users can view own profile" 
ON usuarios 
FOR SELECT 
USING (id_usuario = auth.uid());

CREATE POLICY "Users can update own profile" 
ON usuarios 
FOR UPDATE 
USING (id_usuario = auth.uid());

CREATE POLICY "Only authenticated users can insert" 
ON usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Admin can view all users"
ON usuarios
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can manage all users"
ON usuarios
FOR ALL
USING (public.is_admin(auth.uid()));

-- Policies for assistidos table
CREATE POLICY "Users can view assigned assistidos" 
ON assistidos 
FOR SELECT 
USING (
  (responsavel_id = auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = ANY(ARRAY['administrador'::tipo_usuario, 'psicologo'::tipo_usuario, 'assistente_social'::tipo_usuario])
  )
);

-- Policies for categorias table
CREATE POLICY "Authenticated users can view categories" 
ON categorias 
FOR SELECT 
USING (true);

-- Policies for perguntas table
CREATE POLICY "Users can view questions they have permission for" 
ON perguntas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM permissoes_pergunta pp
    WHERE pp.pergunta_id = perguntas.id_pergunta 
    AND pp.usuario_id = auth.uid() 
    AND pp.pode_visualizar = true
  ) OR 
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'administrador'::tipo_usuario
  )
);

-- Policies for permissoes_pergunta table
CREATE POLICY "Admins can manage permissions" 
ON permissoes_pergunta 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'administrador'::tipo_usuario
  )
);

CREATE POLICY "Users can view their own permissions" 
ON permissoes_pergunta 
FOR SELECT 
USING (
  usuario_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'administrador'::tipo_usuario
  )
);

-- Policies for respostas table
CREATE POLICY "Users can insert responses for questions they can answer" 
ON respostas 
FOR INSERT 
WITH CHECK (
  usuario_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM permissoes_pergunta pp
    WHERE pp.pergunta_id = respostas.pergunta_id
    AND pp.usuario_id = auth.uid() 
    AND pp.pode_responder = true
  )
);

CREATE POLICY "Users can view responses for their assistidos" 
ON respostas 
FOR SELECT 
USING (
  usuario_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM assistidos a
    WHERE a.id_assistido = respostas.assistido_id 
    AND a.responsavel_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'administrador'::tipo_usuario
  )
);

-- Policies for historico_respostas table
CREATE POLICY "Users can insert history for their responses" 
ON historico_respostas 
FOR INSERT 
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can view history of their responses" 
ON historico_respostas 
FOR SELECT 
USING (
  usuario_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM respostas r
    JOIN assistidos a ON r.assistido_id = a.id_assistido
    WHERE r.id_resposta = historico_respostas.resposta_id 
    AND a.responsavel_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'administrador'::tipo_usuario
  )
);