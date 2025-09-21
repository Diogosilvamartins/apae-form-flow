-- Create enum for user types
CREATE TYPE public.tipo_usuario AS ENUM ('admin', 'funcionario', 'responsavel');

-- Create enum for question types  
CREATE TYPE public.tipo_pergunta AS ENUM ('multipla_escolha', 'texto_livre', 'escala', 'sim_nao');

-- Create usuarios table
CREATE TABLE public.usuarios (
  id_usuario UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  tipo_usuario public.tipo_usuario NOT NULL DEFAULT 'funcionario',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assistidos table
CREATE TABLE public.assistidos (
  id_assistido UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  responsavel_id UUID REFERENCES public.usuarios(id_usuario),
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categorias table
CREATE TABLE public.categorias (
  id_categoria UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create perguntas table
CREATE TABLE public.perguntas (
  id_pergunta UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id_categoria),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_pergunta public.tipo_pergunta NOT NULL,
  opcoes_resposta JSONB,
  obrigatoria BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create respostas table
CREATE TABLE public.respostas (
  id_resposta UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pergunta_id UUID NOT NULL REFERENCES public.perguntas(id_pergunta),
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id_assistido),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  resposta JSONB NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create historico_respostas table
CREATE TABLE public.historico_respostas (
  id_historico UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resposta_id UUID NOT NULL REFERENCES public.respostas(id_resposta),
  resposta_anterior JSONB,
  resposta_nova JSONB NOT NULL,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  motivo_alteracao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permissoes_pergunta table
CREATE TABLE public.permissoes_pergunta (
  id_permissao UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pergunta_id UUID NOT NULL REFERENCES public.perguntas(id_pergunta),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  pode_visualizar BOOLEAN NOT NULL DEFAULT true,
  pode_responder BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pergunta_id, usuario_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_pergunta ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usuarios
CREATE POLICY "Users can view their own data" ON public.usuarios
  FOR SELECT USING (auth.uid()::text = id_usuario::text);

CREATE POLICY "Admins can view all users" ON public.usuarios  
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );

-- Create RLS policies for assistidos
CREATE POLICY "Users can view assigned assistidos" ON public.assistidos
  FOR SELECT USING (
    responsavel_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario::text = auth.uid()::text 
      AND tipo_usuario IN ('admin', 'funcionario')
    )
  );

-- Create RLS policies for categorias (readable by all authenticated users)
CREATE POLICY "Authenticated users can view categories" ON public.categorias
  FOR SELECT TO authenticated USING (true);

-- Create RLS policies for perguntas
CREATE POLICY "Users can view questions they have permission for" ON public.perguntas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.permissoes_pergunta pp
      WHERE pp.pergunta_id = id_pergunta
      AND pp.usuario_id::text = auth.uid()::text
      AND pp.pode_visualizar = true
    ) OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );

-- Create RLS policies for respostas
CREATE POLICY "Users can view responses for their assistidos" ON public.respostas
  FOR SELECT USING (
    usuario_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.assistidos a
      WHERE a.id_assistido = assistido_id
      AND a.responsavel_id::text = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id_usuario::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Users can insert responses for questions they can answer" ON public.respostas
  FOR INSERT WITH CHECK (
    usuario_id::text = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM public.permissoes_pergunta pp
      WHERE pp.pergunta_id = pergunta_id
      AND pp.usuario_id::text = auth.uid()::text
      AND pp.pode_responder = true
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assistidos_updated_at
  BEFORE UPDATE ON public.assistidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_tipo ON public.usuarios(tipo_usuario);
CREATE INDEX idx_assistidos_responsavel ON public.assistidos(responsavel_id);
CREATE INDEX idx_perguntas_categoria ON public.perguntas(categoria_id);
CREATE INDEX idx_respostas_pergunta ON public.respostas(pergunta_id);
CREATE INDEX idx_respostas_assistido ON public.respostas(assistido_id);
CREATE INDEX idx_permissoes_usuario ON public.permissoes_pergunta(usuario_id);