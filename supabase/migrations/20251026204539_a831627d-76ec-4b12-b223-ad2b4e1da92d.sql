-- Adicionar campos de endereço completo para origem e destino nos fretes
ALTER TABLE fretes
ADD COLUMN origem_logradouro TEXT,
ADD COLUMN origem_numero TEXT,
ADD COLUMN origem_cidade TEXT,
ADD COLUMN origem_uf TEXT,
ADD COLUMN origem_ponto_referencia TEXT,
ADD COLUMN destino_logradouro TEXT,
ADD COLUMN destino_numero TEXT,
ADD COLUMN destino_cidade TEXT,
ADD COLUMN destino_uf TEXT,
ADD COLUMN destino_ponto_referencia TEXT;

-- Migrar dados existentes: extrair cidade do campo origem/destino atual
UPDATE fretes
SET origem_cidade = origem,
    destino_cidade = destino
WHERE origem_cidade IS NULL;