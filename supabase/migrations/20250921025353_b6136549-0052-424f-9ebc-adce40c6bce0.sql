-- Create enum for professional specialties
CREATE TYPE especialidade_profissional AS ENUM (
  'psicologo',
  'assistente_social', 
  'fonoaudiologo',
  'fisioterapeuta',
  'terapeuta_ocupacional',
  'pedagogo',
  'nutricionista',
  'medico',
  'outro'
);

-- Create enum for appointment status
CREATE TYPE status_agendamento AS ENUM (
  'agendado',
  'confirmado',
  'em_andamento',
  'concluido',
  'cancelado',
  'reagendado'
);

-- Create professionals table
CREATE TABLE public.profissionais (
  id_profissional UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  especialidade especialidade_profissional NOT NULL,
  registro_profissional TEXT,
  celular VARCHAR(20),
  email TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.agendamentos (
  id_agendamento UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id_assistido) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id_profissional) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 60,
  status status_agendamento NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  criado_por UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- RLS policies for profissionais
CREATE POLICY "Authenticated users can view professionals" 
ON public.profissionais 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and professionals can manage professionals" 
ON public.profissionais 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario IN ('administrador', 'psicologo', 'assistente_social')
  )
);

-- RLS policies for agendamentos
CREATE POLICY "Users can view appointments they have access to" 
ON public.agendamentos 
FOR SELECT 
USING (
  -- User is the one who created the appointment
  criado_por = auth.uid() OR
  -- User is responsible for the assistido
  EXISTS (
    SELECT 1 FROM assistidos a 
    WHERE a.id_assistido = agendamentos.assistido_id 
    AND a.responsavel_id = auth.uid()
  ) OR
  -- User is the professional assigned
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id_usuario = auth.uid() 
    AND (
      -- Admin can see all
      u.tipo_usuario = 'administrador' OR
      -- Professional can see their own appointments
      profissional_id IN (
        SELECT p.id_profissional FROM profissionais p 
        WHERE p.email = u.email OR p.nome = u.nome
      )
    )
  )
);

CREATE POLICY "Users can create appointments" 
ON public.agendamentos 
FOR INSERT 
WITH CHECK (
  criado_por = auth.uid() AND
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario IN ('administrador', 'psicologo', 'assistente_social', 'secretaria')
  )
);

CREATE POLICY "Users can update appointments they have access to" 
ON public.agendamentos 
FOR UPDATE 
USING (
  criado_por = auth.uid() OR
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id_usuario = auth.uid() 
    AND (
      u.tipo_usuario = 'administrador' OR
      profissional_id IN (
        SELECT p.id_profissional FROM profissionais p 
        WHERE p.email = u.email OR p.nome = u.nome
      )
    )
  )
);

CREATE POLICY "Admins can delete appointments" 
ON public.agendamentos 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id_usuario = auth.uid() 
    AND tipo_usuario = 'administrador'
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_profissionais_updated_at
BEFORE UPDATE ON public.profissionais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial professionals
INSERT INTO public.profissionais (nome, especialidade, registro_profissional, celular, email) VALUES
('Dra. Maria Silva', 'psicologo', 'CRP 12345', '33984043348', 'maria.silva@apae.com'),
('Ana Santos', 'assistente_social', 'CRESS 67890', '33987654321', 'ana.santos@apae.com'),
('Carlos Oliveira', 'fonoaudiologo', 'CRFa 11111', '33999888777', 'carlos.oliveira@apae.com');