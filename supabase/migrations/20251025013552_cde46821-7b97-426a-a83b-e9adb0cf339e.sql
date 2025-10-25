-- Corrigir política de INSERT para permitir admins e operacionais
DROP POLICY IF EXISTS "Motoristas podem adicionar transações em suas viagens" ON transacoes_viagem;

-- Política: Admins e Operacionais podem adicionar transações
CREATE POLICY "Admins e Operacionais podem adicionar transações"
ON transacoes_viagem
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'operacional')
);

-- Política: Motoristas podem adicionar transações em suas viagens
CREATE POLICY "Motoristas podem adicionar suas transações"
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