-- Criar tabela de abastecimentos
CREATE TABLE IF NOT EXISTS public.abastecimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  viagem_id UUID REFERENCES public.viagens(id) ON DELETE SET NULL,
  motorista_id UUID REFERENCES public.motoristas(id),
  
  -- Dados do abastecimento
  km_veiculo NUMERIC NOT NULL,
  litros NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  valor_por_litro NUMERIC GENERATED ALWAYS AS (valor_total / NULLIF(litros, 0)) STORED,
  
  -- Cálculo de consumo (km/l)
  km_anterior NUMERIC,
  km_rodados NUMERIC,
  media_calculada NUMERIC,
  
  -- Informações do posto
  posto_nome TEXT,
  posto_cidade TEXT,
  posto_uf TEXT,
  
  -- Comprovante e validação
  comprovante_url TEXT,
  data_abastecimento TIMESTAMP WITH TIME ZONE NOT NULL,
  validado_em TIMESTAMP WITH TIME ZONE,
  validado_por UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pendente_validacao',
  observacoes TEXT,
  
  -- Localização
  latitude NUMERIC,
  longitude NUMERIC,
  localizacao_timestamp TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_abastecimentos_veiculo ON public.abastecimentos(veiculo_id);
CREATE INDEX idx_abastecimentos_viagem ON public.abastecimentos(viagem_id);
CREATE INDEX idx_abastecimentos_data ON public.abastecimentos(data_abastecimento DESC);

-- Adicionar campos na tabela veículos
ALTER TABLE public.veiculos 
  ADD COLUMN IF NOT EXISTS media_consumo_geral NUMERIC,
  ADD COLUMN IF NOT EXISTS ultimo_abastecimento_km NUMERIC,
  ADD COLUMN IF NOT EXISTS ultimo_abastecimento_data TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS total_abastecimentos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_litros_abastecidos NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_km_rodados NUMERIC DEFAULT 0;

-- Função para calcular média do veículo
CREATE OR REPLACE FUNCTION public.calcular_media_veiculo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Atualizar estatísticas do veículo
  UPDATE public.veiculos SET
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
$$;

-- Trigger para calcular média automaticamente
CREATE TRIGGER trigger_calcular_media
  BEFORE INSERT OR UPDATE ON public.abastecimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_media_veiculo();

-- Trigger para updated_at
CREATE TRIGGER update_abastecimentos_updated_at
  BEFORE UPDATE ON public.abastecimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;

-- Motoristas podem criar abastecimentos em suas viagens
CREATE POLICY "Motoristas podem criar abastecimentos"
  ON public.abastecimentos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.viagens v
      JOIN public.motoristas m ON m.id = v.motorista_id
      WHERE v.id = viagem_id AND m.user_id = auth.uid()
    )
  );

-- Motoristas podem ver abastecimentos de suas viagens
CREATE POLICY "Motoristas podem ver seus abastecimentos"
  ON public.abastecimentos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.motoristas m
      WHERE m.id = motorista_id AND m.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'operacional'::app_role)
  );

-- Admins e Operacionais podem gerenciar todos abastecimentos
CREATE POLICY "Admins podem gerenciar abastecimentos"
  ON public.abastecimentos
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'operacional'::app_role)
  );