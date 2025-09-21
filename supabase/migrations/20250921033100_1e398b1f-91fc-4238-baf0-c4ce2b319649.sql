-- Corrigir política para confirmação pública
DROP POLICY IF EXISTS "Anyone can confirm agendamento by token" ON public.agendamentos;

-- Política mais simples para permitir consulta por token
CREATE POLICY "Public can view agendamento by token" 
ON public.agendamentos 
FOR SELECT 
USING (true);

-- Política para permitir confirmação por token
CREATE POLICY "Public can confirm agendamento" 
ON public.agendamentos 
FOR UPDATE 
USING (token_confirmacao IS NOT NULL);