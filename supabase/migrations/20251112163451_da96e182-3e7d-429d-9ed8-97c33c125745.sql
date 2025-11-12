-- Criar tabela de locais de estoque
CREATE TABLE public.locais_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  descricao TEXT,
  capacidade_m3 NUMERIC,
  responsavel TEXT,
  endereco TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, codigo)
);

-- Índices
CREATE INDEX idx_locais_estoque_empresa ON public.locais_estoque(empresa_id);
CREATE INDEX idx_locais_estoque_ativo ON public.locais_estoque(ativo);

-- RLS Policies
ALTER TABLE public.locais_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gerenciar locais da empresa"
  ON public.locais_estoque
  FOR ALL
  USING (
    empresa_id = get_user_empresa_id() AND (
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'operacional'::app_role)
    )
  )
  WITH CHECK (
    empresa_id = get_user_empresa_id() AND (
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'operacional'::app_role)
    )
  );

CREATE POLICY "Ver locais da empresa"
  ON public.locais_estoque
  FOR SELECT
  USING (empresa_id = get_user_empresa_id() OR has_role(auth.uid(), 'super_admin'::app_role));

-- Adicionar coluna de referência em itens_estoque
ALTER TABLE public.itens_estoque 
  ADD COLUMN local_id UUID REFERENCES locais_estoque(id) ON DELETE SET NULL;

CREATE INDEX idx_itens_estoque_local ON public.itens_estoque(local);
CREATE INDEX idx_itens_estoque_local_id ON public.itens_estoque(local_id);

-- Adicionar colunas de local nos pneus
ALTER TABLE public.pneus 
  ADD COLUMN local_estoque TEXT,
  ADD COLUMN local_id UUID REFERENCES locais_estoque(id) ON DELETE SET NULL;

CREATE INDEX idx_pneus_local_id ON public.pneus(local_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_locais_estoque_updated_at
  BEFORE UPDATE ON public.locais_estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();