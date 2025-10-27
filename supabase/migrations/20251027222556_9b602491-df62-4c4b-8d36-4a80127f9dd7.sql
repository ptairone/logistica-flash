-- Adicionar campos relacionados a tempo noturno e quilometragem na tabela acertos_clt_dias
ALTER TABLE acertos_clt_dias
ADD COLUMN IF NOT EXISTS km_rodados numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS horas_tempo_noturno numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS valor_adicional_noturno numeric DEFAULT 0 NOT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN acertos_clt_dias.km_rodados IS 'Quilômetros rodados no dia';
COMMENT ON COLUMN acertos_clt_dias.horas_tempo_noturno IS 'Horas trabalhadas no período noturno (22h-6h)';
COMMENT ON COLUMN acertos_clt_dias.valor_adicional_noturno IS 'Valor do adicional noturno (20% sobre hora normal)';

-- Adicionar campos de totais na tabela acertos_clt
ALTER TABLE acertos_clt
ADD COLUMN IF NOT EXISTS total_horas_noturnas numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS valor_adicional_noturno numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_km_rodados numeric DEFAULT 0 NOT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN acertos_clt.total_horas_noturnas IS 'Total de horas trabalhadas no período noturno no mês';
COMMENT ON COLUMN acertos_clt.valor_adicional_noturno IS 'Valor total do adicional noturno no mês';
COMMENT ON COLUMN acertos_clt.total_km_rodados IS 'Total de quilômetros rodados no mês';