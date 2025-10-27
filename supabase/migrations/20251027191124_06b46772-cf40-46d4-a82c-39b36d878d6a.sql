-- Adicionar coluna valor_hora_feriado na tabela motoristas_config_clt
ALTER TABLE motoristas_config_clt 
ADD COLUMN IF NOT EXISTS valor_hora_feriado numeric NOT NULL DEFAULT 24.55;