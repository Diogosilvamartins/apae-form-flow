-- Habilitar realtime para a tabela agendamentos (apenas REPLICA IDENTITY se necessário)
ALTER TABLE public.agendamentos REPLICA IDENTITY FULL;