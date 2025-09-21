-- Popular tokens para agendamentos existentes que não possuem
UPDATE public.agendamentos 
SET token_confirmacao = gen_random_uuid() 
WHERE token_confirmacao IS NULL;

-- Função para corrigir search_path (resolver warning de segurança)
CREATE OR REPLACE FUNCTION public.gerar_token_confirmacao(agendamento_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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