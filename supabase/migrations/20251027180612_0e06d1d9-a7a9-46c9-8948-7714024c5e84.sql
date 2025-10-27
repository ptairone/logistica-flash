-- Adicionar campos de geolocalização nas viagens
ALTER TABLE public.viagens 
ADD COLUMN IF NOT EXISTS partida_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS partida_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS partida_localizacao_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chegada_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS chegada_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS chegada_localizacao_timestamp TIMESTAMP WITH TIME ZONE;

-- Adicionar campos de geolocalização nas despesas
ALTER TABLE public.despesas
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS localizacao_timestamp TIMESTAMP WITH TIME ZONE;

-- Adicionar campos de geolocalização nas transações de viagem
ALTER TABLE public.transacoes_viagem
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS localizacao_timestamp TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_viagens_partida_location ON public.viagens(partida_latitude, partida_longitude);
CREATE INDEX IF NOT EXISTS idx_viagens_chegada_location ON public.viagens(chegada_latitude, chegada_longitude);
CREATE INDEX IF NOT EXISTS idx_despesas_location ON public.despesas(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_transacoes_location ON public.transacoes_viagem(latitude, longitude);

-- Comentários para documentação
COMMENT ON COLUMN public.viagens.partida_latitude IS 'Latitude GPS da localização de partida';
COMMENT ON COLUMN public.viagens.partida_longitude IS 'Longitude GPS da localização de partida';
COMMENT ON COLUMN public.viagens.partida_localizacao_timestamp IS 'Timestamp de quando a localização de partida foi capturada';
COMMENT ON COLUMN public.viagens.chegada_latitude IS 'Latitude GPS da localização de chegada';
COMMENT ON COLUMN public.viagens.chegada_longitude IS 'Longitude GPS da localização de chegada';
COMMENT ON COLUMN public.viagens.chegada_localizacao_timestamp IS 'Timestamp de quando a localização de chegada foi capturada';
COMMENT ON COLUMN public.despesas.latitude IS 'Latitude GPS onde a despesa foi registrada';
COMMENT ON COLUMN public.despesas.longitude IS 'Longitude GPS onde a despesa foi registrada';
COMMENT ON COLUMN public.despesas.localizacao_timestamp IS 'Timestamp de quando a localização da despesa foi capturada';
COMMENT ON COLUMN public.transacoes_viagem.latitude IS 'Latitude GPS onde a transação foi registrada';
COMMENT ON COLUMN public.transacoes_viagem.longitude IS 'Longitude GPS onde a transação foi registrada';
COMMENT ON COLUMN public.transacoes_viagem.localizacao_timestamp IS 'Timestamp de quando a localização da transação foi capturada';