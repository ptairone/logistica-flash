-- Adicionar role de mecânico ao enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'mecanico';

-- Criar tabela de mecânicos
CREATE TABLE IF NOT EXISTS public.mecanicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  telefone TEXT,
  email TEXT,
  especialidades TEXT[],
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'ferias')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alterar tabela manutencoes para adicionar colunas necessárias
ALTER TABLE public.manutencoes 
  ADD COLUMN IF NOT EXISTS mecanico_id UUID REFERENCES public.mecanicos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  ADD COLUMN IF NOT EXISTS proxima_manutencao_km INTEGER,
  ADD COLUMN IF NOT EXISTS proxima_manutencao_data DATE,
  ADD COLUMN IF NOT EXISTS notas_mecanico TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Criar tabela de itens utilizados em manutenções
CREATE TABLE IF NOT EXISTS public.manutencoes_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manutencao_id UUID NOT NULL REFERENCES public.manutencoes(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.itens_estoque(id) ON DELETE RESTRICT,
  quantidade NUMERIC NOT NULL CHECK (quantidade > 0),
  custo_unitario NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de alertas de manutenção
CREATE TABLE IF NOT EXISTS public.alertas_manutencao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('km', 'data', 'ambos')),
  descricao TEXT NOT NULL,
  km_alerta INTEGER,
  data_alerta DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.mecanicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_manutencao ENABLE ROW LEVEL SECURITY;

-- Policies para mecanicos
CREATE POLICY "Admins e Operacionais podem gerenciar mecânicos"
  ON public.mecanicos
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional'));

CREATE POLICY "Mecânicos podem ver seus próprios dados"
  ON public.mecanicos
  FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional'));

-- Policies para manutencoes_itens
CREATE POLICY "Admins e Operacionais podem gerenciar itens de manutenção"
  ON public.manutencoes_itens
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional'));

CREATE POLICY "Usuários autorizados podem ver itens de manutenção"
  ON public.manutencoes_itens
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional'));

-- Policies para alertas_manutencao
CREATE POLICY "Admins e Operacionais podem gerenciar alertas"
  ON public.alertas_manutencao
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional'));

CREATE POLICY "Usuários autorizados podem ver alertas"
  ON public.alertas_manutencao
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operacional'));

-- Trigger para atualizar updated_at em mecanicos
CREATE TRIGGER update_mecanicos_updated_at
  BEFORE UPDATE ON public.mecanicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em manutencoes
CREATE TRIGGER update_manutencoes_updated_at
  BEFORE UPDATE ON public.manutencoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em alertas_manutencao
CREATE TRIGGER update_alertas_manutencao_updated_at
  BEFORE UPDATE ON public.alertas_manutencao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para baixar automaticamente itens do estoque ao adicionar item em manutenção
CREATE OR REPLACE FUNCTION public.baixar_item_estoque_manutencao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

-- Trigger para baixar estoque ao adicionar item em manutenção
CREATE TRIGGER trigger_baixar_item_estoque_manutencao
  AFTER INSERT ON public.manutencoes_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.baixar_item_estoque_manutencao();