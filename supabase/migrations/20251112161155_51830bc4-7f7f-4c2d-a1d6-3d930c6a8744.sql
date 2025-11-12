-- Atualizar trigger para sincronização bidirecional Estoque ↔ Pneus
DROP TRIGGER IF EXISTS trigger_sincronizar_estoque_pneu ON public.pneus;
DROP FUNCTION IF EXISTS public.sincronizar_estoque_pneu();

CREATE OR REPLACE FUNCTION public.sincronizar_estoque_pneu()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRIAÇÃO DE PNEU com item_estoque_id (dar baixa no estoque)
  IF TG_OP = 'INSERT' AND NEW.item_estoque_id IS NOT NULL AND NEW.status = 'estoque' THEN
    -- Verificar se há estoque suficiente
    DECLARE
      v_estoque_atual numeric;
    BEGIN
      SELECT estoque_atual INTO v_estoque_atual
      FROM public.itens_estoque
      WHERE id = NEW.item_estoque_id;
      
      IF v_estoque_atual < 1 THEN
        RAISE EXCEPTION 'Estoque insuficiente para criar pneu individual';
      END IF;
      
      -- Dar baixa de 1 unidade no estoque
      UPDATE public.itens_estoque 
      SET estoque_atual = estoque_atual - 1
      WHERE id = NEW.item_estoque_id;
      
      -- Registrar movimentação de saída
      INSERT INTO public.movimentacoes_estoque (
        item_id, tipo, quantidade, motivo, usuario_id, empresa_id
      ) VALUES (
        NEW.item_estoque_id, 'saida', 1, 
        'Pneu cadastrado individualmente: ' || NEW.numero_serie,
        auth.uid(), NEW.empresa_id
      );
    END;
  END IF;
  
  -- INSTALAÇÃO: Quando pneu sai do estoque para uso
  IF NEW.veiculo_id IS NOT NULL AND (OLD IS NULL OR OLD.veiculo_id IS NULL OR OLD.veiculo_id != NEW.veiculo_id) 
     AND NEW.status = 'em_uso' AND (OLD IS NULL OR OLD.status = 'estoque') AND NEW.item_estoque_id IS NOT NULL THEN
    -- Esta lógica já existia, mantida para compatibilidade
    NULL; -- Baixa já foi feita na criação
  END IF;
  
  -- REMOÇÃO: Quando pneu volta ao estoque
  IF NEW.veiculo_id IS NULL AND OLD IS NOT NULL AND OLD.veiculo_id IS NOT NULL 
     AND NEW.status = 'estoque' AND OLD.status != 'estoque' AND NEW.item_estoque_id IS NOT NULL THEN
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

-- Recriar trigger
CREATE TRIGGER trigger_sincronizar_estoque_pneu
  BEFORE INSERT OR UPDATE ON public.pneus
  FOR EACH ROW
  EXECUTE FUNCTION public.sincronizar_estoque_pneu();