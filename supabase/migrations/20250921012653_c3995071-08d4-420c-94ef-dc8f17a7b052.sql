-- Inserir usuários de teste (senhas são "123456" com hash bcrypt)
-- Hash gerado com bcrypt para senha "123456": $2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm

INSERT INTO public.usuarios (nome, email, senha_hash, tipo_usuario, ativo) VALUES
('Administrador Sistema', 'admin@apae.com', '$2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm', 'admin', true),
('Maria Silva Santos', 'secretaria@apae.com', '$2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm', 'secretaria', true),
('Dra. Ana Paula Costa', 'psicologa@apae.com', '$2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm', 'psicologa', true),
('João Funcionário', 'funcionario@apae.com', '$2b$10$rOiMixtOy3PQyBiRmZJVa.LV9VK.8FpN6xD.6zOdYHK5VPd9Y8JHm', 'funcionario', true);

-- Inserir categorias de exemplo
INSERT INTO public.categorias (nome, descricao, ativo, ordem_exibicao) VALUES
('Dados Pessoais', 'Informações pessoais básicas do assistido', true, 1),
('Histórico Médico', 'Informações sobre saúde e histórico médico', true, 2),
('Avaliação Psicológica', 'Dados da avaliação psicológica', true, 3),
('Desenvolvimento', 'Informações sobre desenvolvimento motor e cognitivo', true, 4);

-- Inserir algumas perguntas de exemplo
INSERT INTO public.perguntas (categoria_id, titulo, descricao, tipo_pergunta, obrigatoria, ordem, ativo) VALUES
((SELECT id_categoria FROM public.categorias WHERE nome = 'Dados Pessoais'), 'Nome completo', 'Nome completo do assistido', 'texto_livre', true, 1, true),
((SELECT id_categoria FROM public.categorias WHERE nome = 'Dados Pessoais'), 'Data de nascimento', 'Data de nascimento do assistido', 'texto_livre', true, 2, true),
((SELECT id_categoria FROM public.categorias WHERE nome = 'Dados Pessoais'), 'Possui deficiência?', 'O assistido possui algum tipo de deficiência?', 'sim_nao', true, 3, true),
((SELECT id_categoria FROM public.categorias WHERE nome = 'Histórico Médico'), 'Toma medicamentos?', 'O assistido faz uso de algum medicamento?', 'sim_nao', false, 1, true),
((SELECT id_categoria FROM public.categorias WHERE nome = 'Histórico Médico'), 'Quais medicamentos?', 'Liste os medicamentos utilizados', 'texto_livre', false, 2, true),
((SELECT id_categoria FROM public.categorias WHERE nome = 'Avaliação Psicológica'), 'Nível de independência', 'Avalie o nível de independência de 1 a 5', 'escala', true, 1, true);

-- Inserir assistidos de exemplo
INSERT INTO public.assistidos (nome, data_nascimento, responsavel_id, observacoes, ativo) VALUES
('João Pedro Silva', '2010-05-15', (SELECT id_usuario FROM public.usuarios WHERE email = 'secretaria@apae.com'), 'Assistido com síndrome de Down, muito colaborativo', true),
('Maria Eduarda Santos', '2008-03-22', (SELECT id_usuario FROM public.usuarios WHERE email = 'secretaria@apae.com'), 'Deficiência intelectual leve, gosta de atividades artísticas', true),
('Carlos Alberto Lima', '2012-11-08', (SELECT id_usuario FROM public.usuarios WHERE email = 'funcionario@apae.com'), 'Paralisia cerebral, usa cadeira de rodas', true);