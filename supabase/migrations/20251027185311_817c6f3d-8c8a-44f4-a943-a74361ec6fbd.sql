-- Tabela de configuração CLT do motorista
CREATE TABLE IF NOT EXISTS motoristas_config_clt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id uuid NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
  salario_base numeric NOT NULL DEFAULT 2700.00,
  valor_diaria numeric NOT NULL DEFAULT 80.00,
  valor_hora_extra numeric NOT NULL DEFAULT 19.64,
  valor_hora_fds numeric NOT NULL DEFAULT 24.55,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(motorista_id)
);

-- Tabela principal de acertos CLT
CREATE TABLE IF NOT EXISTS acertos_clt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id uuid NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
  codigo text NOT NULL UNIQUE,
  periodo_inicio date NOT NULL,
  periodo_fim date NOT NULL,
  
  -- Valores base
  salario_base numeric NOT NULL DEFAULT 0,
  total_diarias numeric NOT NULL DEFAULT 0,
  dias_trabalhados integer NOT NULL DEFAULT 0,
  
  -- Horas extras
  total_horas_extras numeric NOT NULL DEFAULT 0,
  valor_horas_extras numeric NOT NULL DEFAULT 0,
  
  -- Fim de semana
  total_horas_fds numeric NOT NULL DEFAULT 0,
  valor_horas_fds numeric NOT NULL DEFAULT 0,
  
  -- Feriados
  total_horas_feriados numeric NOT NULL DEFAULT 0,
  valor_horas_feriados numeric NOT NULL DEFAULT 0,
  
  -- Totais
  total_bruto numeric NOT NULL DEFAULT 0,
  total_descontos numeric NOT NULL DEFAULT 0,
  total_liquido numeric NOT NULL DEFAULT 0,
  
  -- Metadados
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'revisao', 'aprovado', 'pago', 'cancelado')),
  tipo_entrada text NOT NULL DEFAULT 'manual' CHECK (tipo_entrada IN ('manual', 'automatico', 'hibrido')),
  observacoes text,
  
  -- Auditoria
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  aprovado_por uuid REFERENCES auth.users(id),
  aprovado_em timestamp with time zone,
  
  CONSTRAINT periodo_valido CHECK (periodo_fim >= periodo_inicio)
);

-- Tabela de detalhamento diário
CREATE TABLE IF NOT EXISTS acertos_clt_dias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acerto_clt_id uuid NOT NULL REFERENCES acertos_clt(id) ON DELETE CASCADE,
  data date NOT NULL,
  
  -- Tipo de dia
  dia_semana integer NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 6=sábado
  eh_feriado boolean NOT NULL DEFAULT false,
  nome_feriado text,
  
  -- Horas trabalhadas (do rastreador)
  horas_em_movimento numeric NOT NULL DEFAULT 0,
  horas_parado_ligado numeric NOT NULL DEFAULT 0,
  horas_totais numeric NOT NULL DEFAULT 0,
  
  -- Cálculo de extras
  horas_normais numeric NOT NULL DEFAULT 0, -- até 8h
  horas_extras numeric NOT NULL DEFAULT 0, -- acima de 8h
  
  -- Valores calculados
  valor_diaria numeric NOT NULL DEFAULT 0,
  valor_horas_extras numeric NOT NULL DEFAULT 0,
  valor_adicional_fds numeric NOT NULL DEFAULT 0,
  valor_adicional_feriado numeric NOT NULL DEFAULT 0,
  valor_total_dia numeric NOT NULL DEFAULT 0,
  
  -- Origem dos dados
  origem text NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'pdf_rastreador', 'ajuste_manual')),
  dados_rastreador jsonb, -- armazena dados brutos do PDF se vier de lá
  
  -- Auditoria
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(acerto_clt_id, data)
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_motoristas_config_clt_updated_at
  BEFORE UPDATE ON motoristas_config_clt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acertos_clt_updated_at
  BEFORE UPDATE ON acertos_clt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acertos_clt_dias_updated_at
  BEFORE UPDATE ON acertos_clt_dias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE motoristas_config_clt ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertos_clt ENABLE ROW LEVEL SECURITY;
ALTER TABLE acertos_clt_dias ENABLE ROW LEVEL SECURITY;

-- Políticas para motoristas_config_clt
CREATE POLICY "Admins e Financeiro podem gerenciar config CLT"
  ON motoristas_config_clt FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Motoristas podem ver sua config CLT"
  ON motoristas_config_clt FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM motoristas m
      WHERE m.id = motoristas_config_clt.motorista_id
      AND m.user_id = auth.uid()
    )
  );

-- Políticas para acertos_clt
CREATE POLICY "Admins e Financeiro podem gerenciar acertos CLT"
  ON acertos_clt FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Motoristas podem ver seus acertos CLT"
  ON acertos_clt FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM motoristas m
      WHERE m.id = acertos_clt.motorista_id
      AND m.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'financeiro'::app_role)
  );

-- Políticas para acertos_clt_dias
CREATE POLICY "Admins e Financeiro podem gerenciar dias de acertos CLT"
  ON acertos_clt_dias FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Motoristas podem ver dias de seus acertos CLT"
  ON acertos_clt_dias FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM acertos_clt ac
      JOIN motoristas m ON m.id = ac.motorista_id
      WHERE ac.id = acertos_clt_dias.acerto_clt_id
      AND (m.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))
    )
  );

-- Índices para performance
CREATE INDEX idx_motoristas_config_clt_motorista ON motoristas_config_clt(motorista_id);
CREATE INDEX idx_acertos_clt_motorista ON acertos_clt(motorista_id);
CREATE INDEX idx_acertos_clt_periodo ON acertos_clt(periodo_inicio, periodo_fim);
CREATE INDEX idx_acertos_clt_status ON acertos_clt(status);
CREATE INDEX idx_acertos_clt_dias_acerto ON acertos_clt_dias(acerto_clt_id);
CREATE INDEX idx_acertos_clt_dias_data ON acertos_clt_dias(data);