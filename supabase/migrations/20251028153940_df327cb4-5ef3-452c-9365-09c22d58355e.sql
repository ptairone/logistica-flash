-- Adicionar campos de estimativas na tabela fretes
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS distancia_estimada_km NUMERIC;
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS pedagios_estimados NUMERIC DEFAULT 0;
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS numero_pracas_pedagio INTEGER;
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS pracas_pedagio JSONB;
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS combustivel_estimado_litros NUMERIC;
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS combustivel_estimado_valor NUMERIC;
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS tempo_estimado_horas NUMERIC;

-- Adicionar campos calculados automaticamente
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS custo_total_estimado NUMERIC GENERATED ALWAYS AS (
  COALESCE(pedagios_estimados, 0) + COALESCE(combustivel_estimado_valor, 0)
) STORED;

ALTER TABLE fretes ADD COLUMN IF NOT EXISTS margem_estimada NUMERIC GENERATED ALWAYS AS (
  valor_frete - COALESCE(pedagios_estimados, 0) - COALESCE(combustivel_estimado_valor, 0)
) STORED;

ALTER TABLE fretes ADD COLUMN IF NOT EXISTS percentual_margem NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN valor_frete > 0 THEN ((valor_frete - COALESCE(pedagios_estimados, 0) - COALESCE(combustivel_estimado_valor, 0)) / valor_frete * 100)
    ELSE 0
  END
) STORED;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fretes_margem ON fretes(margem_estimada);
CREATE INDEX IF NOT EXISTS idx_fretes_custos ON fretes(custo_total_estimado);