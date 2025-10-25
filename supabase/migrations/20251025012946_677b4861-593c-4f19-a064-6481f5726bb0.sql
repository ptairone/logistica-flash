-- Adicionar campos de adiantamento e recebimento de frete na tabela viagens
ALTER TABLE viagens 
ADD COLUMN IF NOT EXISTS adiantamento numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS recebimento_frete numeric DEFAULT 0;