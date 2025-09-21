-- Add missing RLS policies for assistidos table
CREATE POLICY "Users can insert assistidos they are responsible for" 
ON public.assistidos 
FOR INSERT 
WITH CHECK (
  responsavel_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario IN ('administrador', 'psicologo', 'assistente_social')
  )
);

CREATE POLICY "Users can update assistidos they are responsible for" 
ON public.assistidos 
FOR UPDATE 
USING (
  responsavel_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario IN ('administrador', 'psicologo', 'assistente_social')
  )
);

CREATE POLICY "Users can delete assistidos they are responsible for" 
ON public.assistidos 
FOR DELETE 
USING (
  responsavel_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'administrador'
  )
);