-- Criar tabela de configurações do sistema
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave VARCHAR(50) NOT NULL UNIQUE,
  valor TEXT,
  descricao TEXT,
  tipo VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor, descricao, tipo) VALUES
('numero_whatsapp_padrao', '33999799138', 'Número de celular padrão para envio de mensagens WhatsApp', 'string'),
('nome_instituicao', 'APAE Governador Valadares', 'Nome da instituição', 'string'),
('endereco_instituicao', 'APAE Governador Valadares', 'Endereço da instituição', 'string');

-- RLS policies
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem visualizar e modificar configurações
CREATE POLICY "Admins can manage configurations"
ON public.configuracoes
FOR ALL
USING (is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_configuracoes_updated_at
BEFORE UPDATE ON public.configuracoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();