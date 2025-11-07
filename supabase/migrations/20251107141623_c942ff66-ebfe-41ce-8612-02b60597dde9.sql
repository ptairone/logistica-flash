-- Seed de dados de teste para manutenções

-- Inserir mecânicos de teste (se não existirem)
INSERT INTO public.mecanicos (nome, cpf, telefone, email, especialidades, status)
SELECT 'João Silva', '12345678901', '(11) 98765-4321', 'joao@mecanica.com', 
       ARRAY['Motor', 'Transmissão', 'Elétrica']::text[], 'ativo'
WHERE NOT EXISTS (SELECT 1 FROM public.mecanicos WHERE cpf = '12345678901');

INSERT INTO public.mecanicos (nome, cpf, telefone, email, especialidades, status)
SELECT 'Maria Santos', '98765432109', '(11) 91234-5678', 'maria@mecanica.com', 
       ARRAY['Freios', 'Suspensão', 'Pneus']::text[], 'ativo'
WHERE NOT EXISTS (SELECT 1 FROM public.mecanicos WHERE cpf = '98765432109');

-- Inserir manutenções de teste usando veículos e mecânicos existentes
DO $$
DECLARE
  v_veiculo_id uuid;
  v_mecanico_id uuid;
  v_count integer;
BEGIN
  -- Verificar se já existem manutenções de teste
  SELECT COUNT(*) INTO v_count FROM public.manutencoes WHERE descricao LIKE '%[TESTE]%';
  
  IF v_count = 0 THEN
    -- Pegar primeiro veículo
    SELECT id INTO v_veiculo_id FROM public.veiculos LIMIT 1;
    
    -- Pegar primeiro mecânico
    SELECT id INTO v_mecanico_id FROM public.mecanicos LIMIT 1;
    
    IF v_veiculo_id IS NOT NULL THEN
      -- Manutenção concluída no mês atual
      INSERT INTO public.manutencoes (veiculo_id, mecanico_id, tipo, descricao, data, data_inicio, data_conclusao, km_veiculo, custo, fornecedor, prioridade, status)
      VALUES (
        v_veiculo_id,
        v_mecanico_id,
        'Preventiva',
        'Troca de óleo e filtros [TESTE]',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE - INTERVAL '4 days',
        50000,
        850.00,
        'Auto Peças Central',
        'media',
        'concluida'
      );

      -- Manutenção em andamento
      INSERT INTO public.manutencoes (veiculo_id, mecanico_id, tipo, descricao, data, data_inicio, km_veiculo, prioridade, status)
      VALUES (
        v_veiculo_id,
        v_mecanico_id,
        'Corretiva',
        'Reparo no sistema de freios [TESTE]',
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE - INTERVAL '2 days',
        51200,
        'alta',
        'em_andamento'
      );

      -- Manutenção agendada para hoje
      INSERT INTO public.manutencoes (veiculo_id, mecanico_id, tipo, descricao, data, km_veiculo, prioridade, status)
      VALUES (
        v_veiculo_id,
        v_mecanico_id,
        'Revisão',
        'Revisão de 60.000 km [TESTE]',
        CURRENT_DATE,
        52000,
        'media',
        'agendada'
      );

      -- Manutenção atrasada
      INSERT INTO public.manutencoes (veiculo_id, tipo, descricao, data, km_veiculo, prioridade, status)
      VALUES (
        v_veiculo_id,
        'Preventiva',
        'Alinhamento e balanceamento [TESTE]',
        CURRENT_DATE - INTERVAL '7 days',
        49500,
        'baixa',
        'agendada'
      );

      -- Manutenção concluída mês passado (custo alto)
      INSERT INTO public.manutencoes (veiculo_id, mecanico_id, tipo, descricao, data, data_inicio, data_conclusao, km_veiculo, custo, fornecedor, prioridade, status)
      VALUES (
        v_veiculo_id,
        v_mecanico_id,
        'Corretiva',
        'Troca de embreagem [TESTE]',
        CURRENT_DATE - INTERVAL '35 days',
        CURRENT_DATE - INTERVAL '35 days',
        CURRENT_DATE - INTERVAL '33 days',
        48000,
        3200.00,
        'Transmissões Premium',
        'urgente',
        'concluida'
      );

      -- Manutenção cancelada
      INSERT INTO public.manutencoes (veiculo_id, tipo, descricao, data, km_veiculo, prioridade, status, observacoes)
      VALUES (
        v_veiculo_id,
        'Preventiva',
        'Troca de pneus [TESTE]',
        CURRENT_DATE - INTERVAL '10 days',
        49000,
        'media',
        'cancelada',
        'Cliente optou por fazer em outra oficina'
      );
    END IF;
  END IF;
END $$;

-- Inserir alertas de manutenção de teste
DO $$
DECLARE
  v_veiculo_id uuid;
  v_km_atual integer;
  v_count integer;
BEGIN
  -- Verificar se já existem alertas de teste
  SELECT COUNT(*) INTO v_count FROM public.alertas_manutencao WHERE descricao LIKE '%[TESTE]%';
  
  IF v_count = 0 THEN
    -- Pegar primeiro veículo e seu km atual
    SELECT id, km_atual INTO v_veiculo_id, v_km_atual FROM public.veiculos LIMIT 1;
    
    IF v_veiculo_id IS NOT NULL THEN
      -- Alerta por KM (já atingido)
      INSERT INTO public.alertas_manutencao (veiculo_id, tipo, descricao, km_alerta, ativo)
      VALUES (
        v_veiculo_id,
        'km',
        'Revisão de 50.000 km [TESTE]',
        COALESCE(v_km_atual - 500, 50000),
        true
      );

      -- Alerta por data (já vencido)
      INSERT INTO public.alertas_manutencao (veiculo_id, tipo, descricao, data_alerta, ativo)
      VALUES (
        v_veiculo_id,
        'data',
        'Troca de óleo programada [TESTE]',
        CURRENT_DATE - INTERVAL '5 days',
        true
      );

      -- Alerta por ambos (data próxima, km ainda não atingido)
      INSERT INTO public.alertas_manutencao (veiculo_id, tipo, descricao, km_alerta, data_alerta, ativo)
      VALUES (
        v_veiculo_id,
        'ambos',
        'Revisão completa [TESTE]',
        COALESCE(v_km_atual + 5000, 60000),
        CURRENT_DATE + INTERVAL '20 days',
        true
      );

      -- Alerta inativo (para demonstrar filtro)
      INSERT INTO public.alertas_manutencao (veiculo_id, tipo, descricao, km_alerta, ativo)
      VALUES (
        v_veiculo_id,
        'km',
        'Alerta desativado [TESTE]',
        COALESCE(v_km_atual + 10000, 70000),
        false
      );
    END IF;
  END IF;
END $$;

-- Inserir itens de estoque para manutenções (se houver estoque)
DO $$
DECLARE
  v_manutencao_id uuid;
  v_item_id uuid;
  v_count integer;
BEGIN
  -- Verificar se já existem itens de manutenção
  SELECT COUNT(*) INTO v_count FROM public.manutencoes_itens;
  
  IF v_count = 0 THEN
    -- Pegar primeira manutenção concluída
    SELECT id INTO v_manutencao_id FROM public.manutencoes WHERE status = 'concluida' LIMIT 1;
    
    -- Pegar primeiro item de estoque
    SELECT id INTO v_item_id FROM public.itens_estoque LIMIT 1;
    
    IF v_manutencao_id IS NOT NULL AND v_item_id IS NOT NULL THEN
      -- Tentar adicionar item à manutenção (pode falhar se estoque insuficiente)
      BEGIN
        INSERT INTO public.manutencoes_itens (manutencao_id, item_id, quantidade, custo_unitario)
        VALUES (v_manutencao_id, v_item_id, 2, 25.00);
      EXCEPTION WHEN OTHERS THEN
        -- Ignora erro se não houver estoque suficiente
        NULL;
      END;
    END IF;
  END IF;
END $$;