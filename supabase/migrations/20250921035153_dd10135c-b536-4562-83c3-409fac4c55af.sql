-- Add new columns to assistidos table for complete registration form
ALTER TABLE public.assistidos 
ADD COLUMN cpf VARCHAR(14),
ADD COLUMN rg VARCHAR(20),
ADD COLUMN sexo VARCHAR(20),
ADD COLUMN estado_civil VARCHAR(20),
ADD COLUMN telefone VARCHAR(20),
ADD COLUMN email VARCHAR(255),
ADD COLUMN endereco_completo TEXT,
ADD COLUMN cep VARCHAR(10),
ADD COLUMN cidade VARCHAR(100),
ADD COLUMN estado VARCHAR(2),
ADD COLUMN nome_responsavel TEXT,
ADD COLUMN cpf_responsavel VARCHAR(14),
ADD COLUMN parentesco VARCHAR(50),
ADD COLUMN telefone_responsavel VARCHAR(20),
ADD COLUMN observacoes_gerais TEXT,
ADD COLUMN paciente_ativo BOOLEAN DEFAULT true,
ADD COLUMN foto_url TEXT;

-- Rename existing columns to match new structure
ALTER TABLE public.assistidos 
RENAME COLUMN observacoes TO observacoes_temp;

UPDATE public.assistidos 
SET observacoes_gerais = observacoes_temp
WHERE observacoes_temp IS NOT NULL;

ALTER TABLE public.assistidos 
DROP COLUMN observacoes_temp;

-- Update ativo column to match paciente_ativo
UPDATE public.assistidos 
SET paciente_ativo = ativo;

-- Create enum types for dropdowns
CREATE TYPE sexo_tipo AS ENUM ('masculino', 'feminino', 'outro');
CREATE TYPE estado_civil_tipo AS ENUM ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel', 'outro');
CREATE TYPE parentesco_tipo AS ENUM ('pai', 'mae', 'irmao', 'irma', 'avo', 'avo_materna', 'tio', 'tia', 'primo', 'prima', 'outro');

-- Update columns to use enum types  
ALTER TABLE public.assistidos 
ALTER COLUMN sexo TYPE sexo_tipo USING sexo::sexo_tipo,
ALTER COLUMN estado_civil TYPE estado_civil_tipo USING estado_civil::estado_civil_tipo,
ALTER COLUMN parentesco TYPE parentesco_tipo USING parentesco::parentesco_tipo;