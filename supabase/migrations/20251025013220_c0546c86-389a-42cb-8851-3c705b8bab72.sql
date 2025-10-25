-- Criar tabela para múltiplas transações financeiras por viagem
CREATE TABLE IF NOT EXISTS transacoes_viagem (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id uuid NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('adiantamento', 'recebimento_frete')),
  valor numeric NOT NULL CHECK (valor >= 0),
  data timestamp with time zone NOT NULL DEFAULT now(),
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE transacoes_viagem ENABLE ROW LEVEL SECURITY;

-- Política: Motoristas podem adicionar transações em suas viagens
CREATE POLICY "Motoristas podem adicionar transações em suas viagens"
ON transacoes_viagem
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM viagens v
    JOIN motoristas m ON m.id = v.motorista_id
    WHERE v.id = transacoes_viagem.viagem_id
    AND m.user_id = auth.uid()
  )
);

-- Política: Ver transações conforme permissão da viagem
CREATE POLICY "Ver transações conforme viagem"
ON transacoes_viagem
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM viagens v
    JOIN motoristas m ON m.id = v.motorista_id
    WHERE v.id = transacoes_viagem.viagem_id
    AND (
      m.user_id = auth.uid() OR
      has_role(auth.uid(), 'admin') OR
      has_role(auth.uid(), 'operacional') OR
      has_role(auth.uid(), 'financeiro')
    )
  )
);

-- Política: Admins e Operacionais podem deletar transações
CREATE POLICY "Admins e Operacionais podem deletar transações"
ON transacoes_viagem
FOR DELETE
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'operacional')
);

-- Remover colunas antigas de adiantamento e recebimento_frete
ALTER TABLE viagens 
DROP COLUMN IF EXISTS adiantamento,
DROP COLUMN IF EXISTS recebimento_frete;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_transacoes_viagem_viagem_id ON transacoes_viagem(viagem_id);