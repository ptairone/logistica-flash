-- =====================================================
-- SISTEMA DE GESTÃO DE PNEUS
-- =====================================================

-- 1. TABELA PRINCIPAL DE PNEUS
CREATE TABLE IF NOT EXISTS public.pneus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id),
  
  -- Identificação
  numero_serie TEXT NOT NULL,
  codigo_interno TEXT NOT NULL,
  
  -- Especificações técnicas
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  medida TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dianteiro', 'traseiro', 'estepe')),
  
  -- Compra/Estoque
  item_estoque_id UUID REFERENCES public.itens_estoque(id),
  data_compra DATE,
  fornecedor TEXT,
  valor_compra NUMERIC(10,2),
  
  -- Status e Localização
  status TEXT NOT NULL DEFAULT 'estoque' CHECK (status IN ('estoque', 'em_uso', 'recapagem', 'descartado')),
  veiculo_id UUID REFERENCES public.veiculos(id),
  posicao_veiculo TEXT,
  
  -- Controle de uso
  km_instalacao INTEGER,
  km_atual INTEGER,
  km_rodados INTEGER DEFAULT 0,
  numero_recapagens INTEGER DEFAULT 0,
  profundidade_sulco_mm NUMERIC(4,2),
  profundidade_minima_mm NUMERIC(4,2) DEFAULT 1.6,
  
  -- Datas importantes
  data_instalacao TIMESTAMP WITH TIME ZONE,
  data_remocao TIMESTAMP WITH TIME ZONE,
  proxima_calibragem DATE,
  
  -- Observações
  observacoes TEXT,
  motivo_descarte TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HISTÓRICO DE EVENTOS DOS PNEUS
CREATE TABLE IF NOT EXISTS public.pneus_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pneu_id UUID REFERENCES public.pneus(id) ON DELETE CASCADE,
  
  -- Evento
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('compra', 'instalacao', 'remocao', 'calibragem', 'rodizio', 'recapagem', 'medicao_sulco', 'descarte')),
  data_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados do evento
  veiculo_id UUID REFERENCES public.veiculos(id),
  manutencao_id UUID REFERENCES public.manutencoes(id),
  viagem_id UUID REFERENCES public.viagens(id),
  
  km_veiculo INTEGER,
  posicao_anterior TEXT,
  posicao_nova TEXT,
  
  profundidade_sulco_mm NUMERIC(4,2),
  pressao_psi NUMERIC(5,2),
  
  -- Custos
  custo NUMERIC(10,2),
  
  observacoes TEXT,
  usuario_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEDIÇÕES PERIÓDICAS DOS PNEUS
CREATE TABLE IF NOT EXISTS public.pneus_medicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pneu_id UUID REFERENCES public.pneus(id) ON DELETE CASCADE,
  veiculo_id UUID REFERENCES public.veiculos(id),
  
  data_medicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  km_veiculo INTEGER,
  
  -- Medições
  profundidade_interna_mm NUMERIC(4,2),
  profundidade_central_mm NUMERIC(4,2),
  profundidade_externa_mm NUMERIC(4,2),
  pressao_psi NUMERIC(5,2),
  temperatura_celsius NUMERIC(4,1),
  
  -- Condição
  desgaste_irregular BOOLEAN DEFAULT FALSE,
  danos_visiveis BOOLEAN DEFAULT FALSE,
  necessita_atencao BOOLEAN DEFAULT FALSE,
  
  observacoes TEXT,
  fotos_urls JSONB,
  
  usuario_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_pneus_empresa ON public.pneus(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pneus_veiculo ON public.pneus(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_pneus_status ON public.pneus(status);
CREATE INDEX IF NOT EXISTS idx_pneus_numero_serie ON public.pneus(numero_serie);
CREATE INDEX IF NOT EXISTS idx_pneus_item_estoque ON public.pneus(item_estoque_id);

CREATE INDEX IF NOT EXISTS idx_pneus_historico_pneu ON public.pneus_historico(pneu_id);
CREATE INDEX IF NOT EXISTS idx_pneus_historico_data ON public.pneus_historico(data_evento DESC);

CREATE INDEX IF NOT EXISTS idx_pneus_medicoes_pneu ON public.pneus_medicoes(pneu_id);
CREATE INDEX IF NOT EXISTS idx_pneus_medicoes_data ON public.pneus_medicoes(data_medicao DESC);

-- Constraint único: número de série por empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_pneus_numero_serie_empresa ON public.pneus(empresa_id, numero_serie);

-- 5. TRIGGER: ATUALIZAR KM RODADOS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.atualizar_km_pneu()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.km_atual IS NOT NULL AND NEW.km_instalacao IS NOT NULL THEN
    NEW.km_rodados := NEW.km_atual - NEW.km_instalacao;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_km_pneu
  BEFORE UPDATE ON public.pneus
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_km_pneu();

-- 6. TRIGGER: REGISTRAR HISTÓRICO EM MUDANÇAS
CREATE OR REPLACE FUNCTION public.registrar_historico_pneu()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando instalado em veículo
  IF NEW.veiculo_id IS NOT NULL AND (OLD.veiculo_id IS NULL OR OLD.veiculo_id != NEW.veiculo_id) THEN
    INSERT INTO public.pneus_historico (
      pneu_id, tipo_evento, veiculo_id, 
      posicao_nova, km_veiculo, usuario_id
    ) VALUES (
      NEW.id, 'instalacao', NEW.veiculo_id,
      NEW.posicao_veiculo, NEW.km_instalacao, auth.uid()
    );
  END IF;
  
  -- Quando removido do veículo
  IF NEW.veiculo_id IS NULL AND OLD.veiculo_id IS NOT NULL THEN
    INSERT INTO public.pneus_historico (
      pneu_id, tipo_evento, veiculo_id,
      posicao_anterior, km_veiculo, usuario_id
    ) VALUES (
      NEW.id, 'remocao', OLD.veiculo_id,
      OLD.posicao_veiculo, NEW.km_atual, auth.uid()
    );
  END IF;
  
  -- Rodízio (mudança de posição no mesmo veículo)
  IF NEW.veiculo_id = OLD.veiculo_id AND NEW.posicao_veiculo != OLD.posicao_veiculo THEN
    INSERT INTO public.pneus_historico (
      pneu_id, tipo_evento, veiculo_id,
      posicao_anterior, posicao_nova, km_veiculo, usuario_id
    ) VALUES (
      NEW.id, 'rodizio', NEW.veiculo_id,
      OLD.posicao_veiculo, NEW.posicao_veiculo, NEW.km_atual, auth.uid()
    );
  END IF;
  
  -- Recapagem
  IF NEW.status = 'recapagem' AND OLD.status != 'recapagem' THEN
    INSERT INTO public.pneus_historico (
      pneu_id, tipo_evento, km_veiculo, usuario_id
    ) VALUES (
      NEW.id, 'recapagem', NEW.km_atual, auth.uid()
    );
  END IF;
  
  -- Descarte
  IF NEW.status = 'descartado' AND OLD.status != 'descartado' THEN
    INSERT INTO public.pneus_historico (
      pneu_id, tipo_evento, km_veiculo, observacoes, usuario_id
    ) VALUES (
      NEW.id, 'descarte', NEW.km_atual, NEW.motivo_descarte, auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_historico_pneu
  AFTER UPDATE ON public.pneus
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_historico_pneu();

-- 7. TRIGGER: SINCRONIZAR COM ESTOQUE
CREATE OR REPLACE FUNCTION public.sincronizar_estoque_pneu()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando pneu entra em uso, dar baixa no estoque
  IF NEW.status = 'em_uso' AND OLD.status = 'estoque' AND NEW.item_estoque_id IS NOT NULL THEN
    UPDATE public.itens_estoque 
    SET estoque_atual = estoque_atual - 1
    WHERE id = NEW.item_estoque_id;
    
    INSERT INTO public.movimentacoes_estoque (
      item_id, tipo, quantidade, motivo, usuario_id, empresa_id
    ) VALUES (
      NEW.item_estoque_id, 'saida', 1, 
      'Instalado no veículo - Pneu: ' || NEW.numero_serie,
      auth.uid(), NEW.empresa_id
    );
  END IF;
  
  -- Quando pneu volta ao estoque
  IF NEW.status = 'estoque' AND OLD.status != 'estoque' AND NEW.item_estoque_id IS NOT NULL THEN
    UPDATE public.itens_estoque 
    SET estoque_atual = estoque_atual + 1
    WHERE id = NEW.item_estoque_id;
    
    INSERT INTO public.movimentacoes_estoque (
      item_id, tipo, quantidade, motivo, usuario_id, empresa_id
    ) VALUES (
      NEW.item_estoque_id, 'entrada', 1,
      'Devolvido ao estoque - Pneu: ' || NEW.numero_serie,
      auth.uid(), NEW.empresa_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sincronizar_estoque_pneu
  AFTER UPDATE ON public.pneus
  FOR EACH ROW
  EXECUTE FUNCTION public.sincronizar_estoque_pneu();

-- 8. RLS POLICIES - PNEUS
ALTER TABLE public.pneus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver pneus da empresa" ON public.pneus
  FOR SELECT USING (
    empresa_id = get_user_empresa_id() OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Gerenciar pneus da empresa" ON public.pneus
  FOR ALL USING (
    (empresa_id = get_user_empresa_id() AND 
     (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role)))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (empresa_id = get_user_empresa_id() AND 
     (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role)))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- 9. RLS POLICIES - HISTÓRICO
ALTER TABLE public.pneus_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver histórico de pneus" ON public.pneus_historico
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pneus 
      WHERE pneus.id = pneus_historico.pneu_id 
        AND (pneus.empresa_id = get_user_empresa_id() OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "Criar histórico" ON public.pneus_historico
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operacional'::app_role)
  );

-- 10. RLS POLICIES - MEDIÇÕES
ALTER TABLE public.pneus_medicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver medições de pneus" ON public.pneus_medicoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pneus 
      WHERE pneus.id = pneus_medicoes.pneu_id 
        AND (pneus.empresa_id = get_user_empresa_id() OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "Criar medições" ON public.pneus_medicoes
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operacional'::app_role)
  );

CREATE POLICY "Atualizar medições" ON public.pneus_medicoes
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operacional'::app_role)
  );

CREATE POLICY "Deletar medições" ON public.pneus_medicoes
  FOR DELETE USING (
    has_role(auth.uid(), 'admin'::app_role)
  );