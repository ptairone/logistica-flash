-- Adicionar campos para sistema de fotos organizado na tabela documentos
ALTER TABLE documentos
  ADD COLUMN IF NOT EXISTS categoria TEXT CHECK (categoria IN (
    'partida_painel',
    'chegada_painel',
    'despesa',
    'adiantamento',
    'recebimento_frete',
    'checkpoint',
    'outro'
  )),
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS localizacao_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Índice para busca rápida por categoria
CREATE INDEX IF NOT EXISTS idx_documentos_categoria 
  ON documentos(categoria) WHERE categoria IS NOT NULL;

-- Índice para busca por viagem + categoria
CREATE INDEX IF NOT EXISTS idx_documentos_viagem_categoria 
  ON documentos(entidade_id, categoria) 
  WHERE tipo_entidade = 'viagem';

-- Índice para busca por timestamp de localização
CREATE INDEX IF NOT EXISTS idx_documentos_localizacao_timestamp
  ON documentos(localizacao_timestamp) 
  WHERE localizacao_timestamp IS NOT NULL;