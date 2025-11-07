-- ============================================
-- FASE 1: Foreign Keys, Constraints e Índices
-- ============================================

-- 1. Adicionar Foreign Keys em manutencoes
ALTER TABLE public.manutencoes
  ADD CONSTRAINT fk_manutencoes_veiculo 
    FOREIGN KEY (veiculo_id) 
    REFERENCES public.veiculos(id) 
    ON DELETE RESTRICT,
  ADD CONSTRAINT fk_manutencoes_mecanico 
    FOREIGN KEY (mecanico_id) 
    REFERENCES public.mecanicos(id) 
    ON DELETE SET NULL;

-- 2. Adicionar Foreign Keys em manutencoes_itens
ALTER TABLE public.manutencoes_itens
  ADD CONSTRAINT fk_manutencoes_itens_manutencao 
    FOREIGN KEY (manutencao_id) 
    REFERENCES public.manutencoes(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT fk_manutencoes_itens_item 
    FOREIGN KEY (item_id) 
    REFERENCES public.itens_estoque(id) 
    ON DELETE RESTRICT;

-- 3. Adicionar Foreign Keys em alertas_manutencao
ALTER TABLE public.alertas_manutencao
  ADD CONSTRAINT fk_alertas_manutencao_veiculo 
    FOREIGN KEY (veiculo_id) 
    REFERENCES public.veiculos(id) 
    ON DELETE CASCADE;

-- 4. Criar índices de performance
CREATE INDEX IF NOT EXISTS idx_manutencoes_veiculo_id ON public.manutencoes(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_mecanico_id ON public.manutencoes(mecanico_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_status ON public.manutencoes(status);
CREATE INDEX IF NOT EXISTS idx_manutencoes_data ON public.manutencoes(data);
CREATE INDEX IF NOT EXISTS idx_manutencoes_prioridade ON public.manutencoes(prioridade);

CREATE INDEX IF NOT EXISTS idx_manutencoes_itens_manutencao_id ON public.manutencoes_itens(manutencao_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_itens_item_id ON public.manutencoes_itens(item_id);

CREATE INDEX IF NOT EXISTS idx_alertas_manutencao_veiculo_id ON public.alertas_manutencao(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_alertas_manutencao_ativo ON public.alertas_manutencao(ativo) WHERE ativo = true;

-- ============================================
-- FASE 2: Atualizar Trigger de Estoque
-- ============================================

-- Substituir trigger de estoque com validação
CREATE OR REPLACE FUNCTION public.baixar_item_estoque_manutencao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_estoque_atual numeric;
  v_item_descricao text;
BEGIN
  -- Verificar estoque disponível
  SELECT estoque_atual, descricao 
  INTO v_estoque_atual, v_item_descricao
  FROM public.itens_estoque
  WHERE id = NEW.item_id;
  
  -- Validar se há estoque suficiente
  IF v_estoque_atual < NEW.quantidade THEN
    RAISE EXCEPTION 'Estoque insuficiente para o item "%". Disponível: %, Solicitado: %', 
      v_item_descricao, v_estoque_atual, NEW.quantidade;
  END IF;
  
  -- Criar movimentação de saída no estoque
  INSERT INTO public.movimentacoes_estoque (
    item_id,
    tipo,
    quantidade,
    custo_unitario,
    motivo,
    usuario_id
  ) VALUES (
    NEW.item_id,
    'saida',
    NEW.quantidade,
    NEW.custo_unitario,
    'Utilizado em manutenção ID: ' || NEW.manutencao_id,
    auth.uid()
  );
  
  -- Atualizar estoque do item
  UPDATE public.itens_estoque
  SET estoque_atual = estoque_atual - NEW.quantidade
  WHERE id = NEW.item_id;
  
  RETURN NEW;
END;
$function$;

-- ============================================
-- FASE 3: Triggers de Status do Veículo
-- ============================================

-- Trigger para atualizar status do veículo quando manutenção muda
CREATE OR REPLACE FUNCTION public.atualizar_status_veiculo_manutencao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Quando manutenção inicia (status muda para em_andamento)
  IF NEW.status = 'em_andamento' AND (OLD.status IS NULL OR OLD.status != 'em_andamento') THEN
    UPDATE public.veiculos
    SET status = 'manutencao'::status_veiculo
    WHERE id = NEW.veiculo_id;
  END IF;
  
  -- Quando manutenção conclui
  IF NEW.status = 'concluida' AND (OLD.status IS NULL OR OLD.status != 'concluida') THEN
    -- Atualizar km_atual se foi informado
    IF NEW.km_veiculo IS NOT NULL THEN
      UPDATE public.veiculos
      SET 
        km_atual = GREATEST(COALESCE(km_atual, 0), NEW.km_veiculo),
        proxima_manutencao_km = NEW.proxima_manutencao_km,
        proxima_manutencao_data = NEW.proxima_manutencao_data,
        status = 'ativo'::status_veiculo
      WHERE id = NEW.veiculo_id;
    ELSE
      UPDATE public.veiculos
      SET 
        proxima_manutencao_km = NEW.proxima_manutencao_km,
        proxima_manutencao_data = NEW.proxima_manutencao_data,
        status = 'ativo'::status_veiculo
      WHERE id = NEW.veiculo_id;
    END IF;
  END IF;
  
  -- Quando manutenção é cancelada, retornar veículo ao status ativo
  IF NEW.status = 'cancelada' AND (OLD.status IS NULL OR OLD.status != 'cancelada') THEN
    UPDATE public.veiculos
    SET status = 'ativo'::status_veiculo
    WHERE id = NEW.veiculo_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_atualizar_status_veiculo_manutencao ON public.manutencoes;
CREATE TRIGGER trigger_atualizar_status_veiculo_manutencao
  AFTER INSERT OR UPDATE OF status ON public.manutencoes
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_status_veiculo_manutencao();