-- Adicionar coluna numero_eixos à tabela fretes
ALTER TABLE fretes 
ADD COLUMN numero_eixos INTEGER;

-- Adicionar comentário descritivo
COMMENT ON COLUMN fretes.numero_eixos IS 'Número de eixos do veículo (2-9) usado para cálculo de pedágios';

-- Adicionar constraint para valores válidos (2 a 9 eixos)
ALTER TABLE fretes 
ADD CONSTRAINT fretes_numero_eixos_check 
CHECK (numero_eixos IS NULL OR (numero_eixos >= 2 AND numero_eixos <= 9));