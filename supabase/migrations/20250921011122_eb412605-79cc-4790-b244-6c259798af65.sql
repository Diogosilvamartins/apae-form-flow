-- Add missing RLS policies for historico_respostas
CREATE POLICY "Users can view history of their responses" ON public.historico_respostas
  FOR SELECT USING (
    usuario_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.respostas r
      JOIN public.assistidos a ON r.assistido_id = a.id_assistido
      WHERE r.id_resposta = resposta_id
      AND a.responsavel_id::text = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Users can insert history for their responses" ON public.historico_respostas
  FOR INSERT WITH CHECK (
    usuario_id::text = auth.uid()::text
  );

-- Add missing RLS policies for permissoes_pergunta
CREATE POLICY "Users can view their own permissions" ON public.permissoes_pergunta
  FOR SELECT USING (
    usuario_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Admins can manage permissions" ON public.permissoes_pergunta
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );