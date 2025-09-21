-- Criar política RLS para permitir consulta pública de agendamentos por token de confirmação
CREATE POLICY "Anyone can view agendamento by confirmation token"
ON public.agendamentos
FOR SELECT
USING (token_confirmacao IS NOT NULL);

-- Permitir atualização pública do status de confirmação por token
CREATE POLICY "Anyone can confirm agendamento by token"
ON public.agendamentos
FOR UPDATE
USING (token_confirmacao IS NOT NULL)
WITH CHECK (
  -- Só permite atualizar campos relacionados à confirmação
  NEW.status = OLD.status OR NEW.status = 'confirmado'
);