-- Inserir usuários de teste usando apenas os valores válidos do enum
-- Hash para senha "123456": $2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm

INSERT INTO public.usuarios (nome, email, senha_hash, tipo_usuario, ativo) VALUES
('Administrador Sistema', 'admin@apae.com', '$2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm', 'admin', true),
('Maria Silva Santos', 'funcionario@apae.com', '$2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm', 'funcionario', true),
('João Responsável', 'responsavel@apae.com', '$2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm', 'responsavel', true);

-- Inserir categorias de exemplo
INSERT INTO public.categorias (nome, descricao, ativo) VALUES
('Dados Pessoais', 'Informações pessoais básicas do assistido', true),
('Histórico Médico', 'Informações sobre saúde e histórico médico', true),
('Avaliação Psicológica', 'Dados da avaliação psicológica', true),
('Desenvolvimento', 'Informações sobre desenvolvimento motor e cognitivo', true);

-- Inserir assistidos de exemplo
INSERT INTO public.assistidos (nome, data_nascimento, responsavel_id, observacoes, ativo) VALUES
('João Pedro Silva', '2010-05-15', (SELECT id_usuario FROM public.usuarios WHERE email = 'funcionario@apae.com'), 'Assistido com síndrome de Down, muito colaborativo', true),
('Maria Eduarda Santos', '2008-03-22', (SELECT id_usuario FROM public.usuarios WHERE email = 'funcionario@apae.com'), 'Deficiência intelectual leve, gosta de atividades artísticas', true),
('Carlos Alberto Lima', '2012-11-08', (SELECT id_usuario FROM public.usuarios WHERE email = 'responsavel@apae.com'), 'Paralisia cerebral, usa cadeira de rodas', true);