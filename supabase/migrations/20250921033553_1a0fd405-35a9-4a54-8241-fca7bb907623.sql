-- Habilitar realtime para a tabela agendamentos
ALTER TABLE public.agendamentos REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;