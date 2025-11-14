-- Criar tabela de reboques
CREATE TABLE IF NOT EXISTS public.reboques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  
  -- Identificação
  codigo_interno TEXT NOT NULL,
  placa TEXT NOT NULL,
  chassi TEXT,
  renavam TEXT,
  
  -- Dados técnicos
  tipo TEXT NOT NULL CHECK (tipo IN ('semi_reboque', 'reboque', 'dolly')),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER,
  numero_eixos INTEGER NOT NULL CHECK (numero_eixos >= 1 AND numero_eixos <= 3),
  
  -- Capacidades
  capacidade_kg NUMERIC(10,2),
  capacidade_m3 NUMERIC(10,2),
  
  -- Documentação
  vencimento_licenciamento DATE,
  vencimento_seguro DATE,
  
  -- Status
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'acoplado', 'manutencao', 'inativo')),
  
  -- Observações
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(empresa_id, codigo_interno),
  UNIQUE(empresa_id, placa)
);

-- Criar tabela de composição de veículos (relacionamento veículo-reboque)
CREATE TABLE IF NOT EXISTS public.veiculos_composicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE CASCADE NOT NULL,
  reboque_id UUID REFERENCES reboques(id) ON DELETE CASCADE NOT NULL,
  
  -- Ordem de acoplamento (1 = primeiro reboque, 2 = segundo reboque)
  ordem INTEGER NOT NULL DEFAULT 1 CHECK (ordem >= 1 AND ordem <= 2),
  
  -- Datas de acoplamento/desacoplamento
  data_acoplamento TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_desacoplamento TIMESTAMPTZ,
  
  -- Controle
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(veiculo_id, ordem, ativo)
);

-- Adicionar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_veiculos_composicao_veiculo ON veiculos_composicao(veiculo_id, ativo);
CREATE INDEX IF NOT EXISTS idx_veiculos_composicao_reboque ON veiculos_composicao(reboque_id, ativo);
CREATE INDEX IF NOT EXISTS idx_reboques_empresa ON reboques(empresa_id);
CREATE INDEX IF NOT EXISTS idx_reboques_status ON reboques(status);

-- Adicionar coluna numero_eixos à tabela veiculos
ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS numero_eixos INTEGER CHECK (numero_eixos >= 2 AND numero_eixos <= 6);

COMMENT ON COLUMN veiculos.numero_eixos IS 'Número de eixos do cavalo mecânico (trator)';

-- Trigger para atualizar status do reboque ao acoplar/desacoplar
CREATE OR REPLACE FUNCTION atualizar_status_reboque()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.ativo = true THEN
    -- Acoplar: mudar status para 'acoplado'
    UPDATE reboques 
    SET status = 'acoplado' 
    WHERE id = NEW.reboque_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.ativo = true AND NEW.ativo = false THEN
    -- Desacoplar: mudar status para 'disponivel'
    UPDATE reboques 
    SET status = 'disponivel' 
    WHERE id = NEW.reboque_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_atualizar_status_reboque
AFTER INSERT OR UPDATE ON veiculos_composicao
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_reboque();

-- Trigger para validar limite de reboques acoplados
CREATE OR REPLACE FUNCTION validar_limite_reboques()
RETURNS TRIGGER AS $$
DECLARE
  total_reboques INTEGER;
BEGIN
  -- Contar reboques ativos para este veículo
  SELECT COUNT(*) INTO total_reboques
  FROM veiculos_composicao
  WHERE veiculo_id = NEW.veiculo_id AND ativo = true;
  
  IF total_reboques > 2 THEN
    RAISE EXCEPTION 'Um veículo não pode ter mais de 2 reboques acoplados';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_limite_reboques
BEFORE INSERT OR UPDATE ON veiculos_composicao
FOR EACH ROW
EXECUTE FUNCTION validar_limite_reboques();

-- Trigger para atualizar updated_at em reboques
CREATE TRIGGER update_reboques_updated_at
BEFORE UPDATE ON reboques
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para reboques
ALTER TABLE reboques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gerenciar reboques da empresa"
ON reboques
FOR ALL
USING (
  (empresa_id = get_user_empresa_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional')))
  OR has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional')))
  OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Ver reboques da empresa"
ON reboques
FOR SELECT
USING (
  empresa_id = get_user_empresa_id() 
  OR has_role(auth.uid(), 'super_admin')
);

-- RLS Policies para veiculos_composicao
ALTER TABLE veiculos_composicao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gerenciar composição de veículos da empresa"
ON veiculos_composicao
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM veiculos v
    WHERE v.id = veiculos_composicao.veiculo_id
    AND (
      (v.empresa_id = get_user_empresa_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional')))
      OR has_role(auth.uid(), 'super_admin')
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM veiculos v
    WHERE v.id = veiculos_composicao.veiculo_id
    AND (
      (v.empresa_id = get_user_empresa_id() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional')))
      OR has_role(auth.uid(), 'super_admin')
    )
  )
);

CREATE POLICY "Ver composição de veículos da empresa"
ON veiculos_composicao
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM veiculos v
    WHERE v.id = veiculos_composicao.veiculo_id
    AND (
      v.empresa_id = get_user_empresa_id() 
      OR has_role(auth.uid(), 'super_admin')
    )
  )
);