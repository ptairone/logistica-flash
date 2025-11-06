-- Criar função para atualizar km_atual do veículo quando viagem é registrada
CREATE OR REPLACE FUNCTION public.atualizar_km_veiculo_viagem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar km_atual com km_inicial quando viagem inicia (km_inicial é preenchido)
  IF NEW.km_inicial IS NOT NULL AND (OLD.km_inicial IS NULL OR NEW.km_inicial != OLD.km_inicial) THEN
    UPDATE public.veiculos
    SET km_atual = GREATEST(COALESCE(km_atual, 0), NEW.km_inicial)
    WHERE id = NEW.veiculo_id;
  END IF;
  
  -- Atualizar km_atual com km_final quando viagem termina (km_final é preenchido)
  IF NEW.km_final IS NOT NULL AND (OLD.km_final IS NULL OR NEW.km_final != OLD.km_final) THEN
    UPDATE public.veiculos
    SET km_atual = GREATEST(COALESCE(km_atual, 0), NEW.km_final)
    WHERE id = NEW.veiculo_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar km do veículo quando viagem é atualizada
DROP TRIGGER IF EXISTS trigger_atualizar_km_veiculo ON public.viagens;
CREATE TRIGGER trigger_atualizar_km_veiculo
  AFTER INSERT OR UPDATE OF km_inicial, km_final ON public.viagens
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_km_veiculo_viagem();

-- Modificar função calcular_media_veiculo para também atualizar km_atual
CREATE OR REPLACE FUNCTION public.calcular_media_veiculo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Buscar KM do último abastecimento deste veículo
  SELECT km_veiculo INTO NEW.km_anterior
  FROM public.abastecimentos
  WHERE veiculo_id = NEW.veiculo_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ORDER BY data_abastecimento DESC, created_at DESC
  LIMIT 1;
  
  -- Calcular KM rodados e média deste abastecimento
  IF NEW.km_anterior IS NOT NULL AND NEW.km_veiculo > NEW.km_anterior THEN
    NEW.km_rodados := NEW.km_veiculo - NEW.km_anterior;
    IF NEW.litros > 0 THEN
      NEW.media_calculada := NEW.km_rodados / NEW.litros;
    END IF;
  END IF;
  
  -- Atualizar estatísticas do veículo incluindo km_atual
  UPDATE public.veiculos SET
    km_atual = GREATEST(COALESCE(km_atual, 0), NEW.km_veiculo),
    media_consumo_geral = (
      SELECT AVG(media_calculada)
      FROM public.abastecimentos
      WHERE veiculo_id = NEW.veiculo_id
        AND media_calculada IS NOT NULL
        AND status = 'validado'
    ),
    ultimo_abastecimento_km = NEW.km_veiculo,
    ultimo_abastecimento_data = NEW.data_abastecimento,
    total_abastecimentos = (
      SELECT COUNT(*) FROM public.abastecimentos WHERE veiculo_id = NEW.veiculo_id
    ),
    total_litros_abastecidos = (
      SELECT COALESCE(SUM(litros), 0) FROM public.abastecimentos WHERE veiculo_id = NEW.veiculo_id
    ),
    total_km_rodados = (
      SELECT COALESCE(MAX(km_veiculo) - MIN(km_veiculo), 0)
      FROM public.abastecimentos
      WHERE veiculo_id = NEW.veiculo_id
    )
  WHERE id = NEW.veiculo_id;
  
  RETURN NEW;
END;
$function$;