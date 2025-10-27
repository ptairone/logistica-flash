-- Adicionar campo data_criacao na tabela acertos
ALTER TABLE public.acertos 
ADD COLUMN data_criacao timestamp with time zone NOT NULL DEFAULT now();

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.acertos.data_criacao IS 'Data em que o acerto foi registrado no sistema (quando o motorista chegou na empresa)';