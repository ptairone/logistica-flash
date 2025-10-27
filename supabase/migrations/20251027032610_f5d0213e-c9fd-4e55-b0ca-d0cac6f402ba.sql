-- Criar tabela de ajustes administrativos no acerto
CREATE TABLE public.acerto_ajustes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acerto_id UUID NOT NULL REFERENCES public.acertos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('bonificacao', 'penalidade', 'correcao', 'outros')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  justificativa TEXT,
  comprovante_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de débitos do motorista
CREATE TABLE public.acerto_debitos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  motorista_id UUID NOT NULL REFERENCES public.motoristas(id) ON DELETE CASCADE,
  acerto_id UUID REFERENCES public.acertos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('vale_combustivel', 'emprestimo', 'dano', 'multa', 'outros')),
  descricao TEXT NOT NULL,
  valor_original NUMERIC NOT NULL,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  saldo NUMERIC NOT NULL,
  parcelas INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'quitado', 'cancelado')),
  data_vencimento DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de validação de despesas
CREATE TABLE public.despesas_validacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  despesa_id UUID NOT NULL REFERENCES public.despesas(id) ON DELETE CASCADE,
  acerto_id UUID NOT NULL REFERENCES public.acertos(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'reprovada', 'ajustada')),
  valor_original NUMERIC NOT NULL,
  valor_aprovado NUMERIC,
  justificativa TEXT,
  validado_por UUID REFERENCES auth.users(id),
  validado_em TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar novas colunas à tabela acertos
ALTER TABLE public.acertos 
ADD COLUMN total_bonificacoes NUMERIC DEFAULT 0,
ADD COLUMN total_penalidades NUMERIC DEFAULT 0,
ADD COLUMN total_debitos_descontados NUMERIC DEFAULT 0,
ADD COLUMN total_ajustes_admin NUMERIC DEFAULT 0,
ADD COLUMN comprovantes_validados BOOLEAN DEFAULT false,
ADD COLUMN revisado_por UUID REFERENCES auth.users(id),
ADD COLUMN data_revisao TIMESTAMP WITH TIME ZONE,
ADD COLUMN historico_alteracoes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN etapa_atual TEXT DEFAULT 'viagens' CHECK (etapa_atual IN ('viagens', 'despesas', 'ajustes', 'debitos', 'calculo', 'preview', 'concluido'));

-- Índices para performance
CREATE INDEX idx_acerto_ajustes_acerto ON public.acerto_ajustes(acerto_id);
CREATE INDEX idx_acerto_debitos_motorista ON public.acerto_debitos(motorista_id);
CREATE INDEX idx_acerto_debitos_status ON public.acerto_debitos(status);
CREATE INDEX idx_despesas_validacao_acerto ON public.despesas_validacao(acerto_id);
CREATE INDEX idx_despesas_validacao_despesa ON public.despesas_validacao(despesa_id);

-- RLS policies para acerto_ajustes
ALTER TABLE public.acerto_ajustes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e Financeiro podem gerenciar ajustes"
ON public.acerto_ajustes
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Motoristas podem ver ajustes de seus acertos"
ON public.acerto_ajustes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.acertos a
    JOIN public.motoristas m ON m.id = a.motorista_id
    WHERE a.id = acerto_ajustes.acerto_id 
    AND m.user_id = auth.uid()
  )
);

-- RLS policies para acerto_debitos
ALTER TABLE public.acerto_debitos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e Financeiro podem gerenciar débitos"
ON public.acerto_debitos
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Motoristas podem ver seus débitos"
ON public.acerto_debitos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.motoristas m
    WHERE m.id = acerto_debitos.motorista_id 
    AND m.user_id = auth.uid()
  )
);

-- RLS policies para despesas_validacao
ALTER TABLE public.despesas_validacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e Financeiro podem gerenciar validações"
ON public.despesas_validacao
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Motoristas podem ver validações de seus acertos"
ON public.despesas_validacao
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.acertos a
    JOIN public.motoristas m ON m.id = a.motorista_id
    WHERE a.id = despesas_validacao.acerto_id 
    AND m.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at em acerto_debitos
CREATE TRIGGER update_acerto_debitos_updated_at
BEFORE UPDATE ON public.acerto_debitos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar saldo do débito
CREATE OR REPLACE FUNCTION public.atualizar_saldo_debito()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.saldo = NEW.valor_original - NEW.valor_pago;
  
  IF NEW.saldo <= 0 THEN
    NEW.status = 'quitado';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_saldo_debito
BEFORE INSERT OR UPDATE ON public.acerto_debitos
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_saldo_debito();