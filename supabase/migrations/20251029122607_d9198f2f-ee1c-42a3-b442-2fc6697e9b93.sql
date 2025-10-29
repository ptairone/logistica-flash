-- Adicionar campos para cálculo ANTT na tabela fretes
ALTER TABLE fretes
ADD COLUMN IF NOT EXISTS tipo_carga TEXT,
ADD COLUMN IF NOT EXISTS composicao_veicular BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alto_desempenho BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS retorno_vazio BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS piso_minimo_antt NUMERIC(10, 2);

-- Adicionar comentários para documentação
COMMENT ON COLUMN fretes.tipo_carga IS 'Tipo de carga conforme tabela ANTT (granel_solido, geral, neogranel, frigorificada, perigosa)';
COMMENT ON COLUMN fretes.composicao_veicular IS 'Se veículo é composição (caminhão + reboque) - acréscimo de 15%';
COMMENT ON COLUMN fretes.alto_desempenho IS 'Se veículo possui alto desempenho - acréscimo de 10%';
COMMENT ON COLUMN fretes.retorno_vazio IS 'Se viagem de retorno será vazia - acréscimo de 20%';
COMMENT ON COLUMN fretes.piso_minimo_antt IS 'Valor calculado do piso mínimo conforme Resolução ANTT 6.067/2025';