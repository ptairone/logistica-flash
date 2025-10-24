-- Adicionar campos de magic link e tracking à tabela viagens
ALTER TABLE public.viagens
ADD COLUMN driver_form_token UUID,
ADD COLUMN driver_form_url TEXT,
ADD COLUMN link_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN link_status TEXT DEFAULT 'inativo' CHECK (link_status IN ('ativo', 'expirado', 'revogado', 'inativo')),
ADD COLUMN ultimo_acesso_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN partida_foto_url TEXT,
ADD COLUMN chegada_foto_url TEXT,
ADD COLUMN km_inicial NUMERIC,
ADD COLUMN km_final NUMERIC;

-- Adicionar campo de controle de viagem aos veículos
ALTER TABLE public.veiculos
ADD COLUMN em_viagem BOOLEAN DEFAULT false;

-- Adicionar origem da despesa (motorista ou operacional)
ALTER TABLE public.despesas
ADD COLUMN origem TEXT DEFAULT 'operacional' CHECK (origem IN ('motorista', 'operacional'));

-- Criar índice para otimizar buscas por token
CREATE INDEX idx_viagens_driver_token ON public.viagens(driver_form_token) WHERE driver_form_token IS NOT NULL;

-- Criar índice para otimizar buscas por status do link
CREATE INDEX idx_viagens_link_status ON public.viagens(link_status) WHERE link_status = 'ativo';