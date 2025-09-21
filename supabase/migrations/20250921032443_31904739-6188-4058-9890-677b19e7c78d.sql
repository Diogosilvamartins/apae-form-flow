-- Adicionar campo para token de confirmação na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN token_confirmacao UUID DEFAULT gen_random_uuid(),
ADD COLUMN confirmado_em TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN confirmado_por_telefone VARCHAR(20) DEFAULT NULL;

-- Criar índice para busca rápida por token
CREATE INDEX idx_agendamentos_token_confirmacao ON public.agendamentos(token_confirmacao);

-- Função para gerar novo token de confirmação
CREATE OR REPLACE FUNCTION public.gerar_token_confirmacao(agendamento_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    novo_token UUID;
BEGIN
    novo_token := gen_random_uuid();
    
    UPDATE public.agendamentos 
    SET token_confirmacao = novo_token,
        confirmado_em = NULL,
        confirmado_por_telefone = NULL
    WHERE id_agendamento = agendamento_id;
    
    RETURN novo_token;
END;
$$;