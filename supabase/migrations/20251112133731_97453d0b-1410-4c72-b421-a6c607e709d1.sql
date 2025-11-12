-- FASE 2: Adicionar empresa_id em TODAS as tabelas de negócio
-- CRÍTICO para isolamento de dados entre empresas

-- Adicionar coluna empresa_id com foreign key
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE motoristas ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE fretes ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE manutencoes ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE itens_estoque ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE categorias_estoque ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE mecanicos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE acertos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE acertos_clt ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE movimentacoes_estoque ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE;

-- Criar índices para performance (CRÍTICO)
CREATE INDEX IF NOT EXISTS idx_veiculos_empresa ON veiculos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_motoristas_empresa ON motoristas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_fretes_empresa ON fretes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_viagens_empresa ON viagens(empresa_id);
CREATE INDEX IF NOT EXISTS idx_despesas_empresa ON despesas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_empresa ON abastecimentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_empresa ON manutencoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_itens_estoque_empresa ON itens_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_categorias_estoque_empresa ON categorias_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_mecanicos_empresa ON mecanicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_acertos_empresa ON acertos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_acertos_clt_empresa ON acertos_clt(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_estoque_empresa ON movimentacoes_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa ON documentos(empresa_id);

-- FASE 4: Criar helper function para pegar empresa_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id 
  FROM user_roles 
  WHERE user_id = auth.uid()
    AND role != 'super_admin'
  LIMIT 1;
$$;

-- FASE 3: Atualizar RLS Policies para isolamento por empresa_id

-- ============= VEÍCULOS =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar veículos" ON veiculos;
DROP POLICY IF EXISTS "Todos autenticados podem ver veículos" ON veiculos;

-- Super admin vê tudo
CREATE POLICY "Super admin vê todos veículos"
ON veiculos FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin gerencia todos veículos"
ON veiculos FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Admin/Operacional da mesma empresa
CREATE POLICY "Admins veem veículos da empresa"
ON veiculos FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins gerenciam veículos da empresa"
ON veiculos FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= MOTORISTAS =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar motoristas" ON motoristas;
DROP POLICY IF EXISTS "Motoristas veem seus próprios dados" ON motoristas;

CREATE POLICY "Super admin vê todos motoristas"
ON motoristas FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Ver motoristas da empresa"
ON motoristas FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  auth.uid() = user_id OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar motoristas da empresa"
ON motoristas FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= FRETES =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar fretes" ON fretes;
DROP POLICY IF EXISTS "Usuários autorizados podem ver fretes" ON fretes;
DROP POLICY IF EXISTS "Financeiro pode atualizar status de faturamento" ON fretes;

CREATE POLICY "Ver fretes da empresa"
ON fretes FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar fretes da empresa"
ON fretes FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= VIAGENS =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar viagens" ON viagens;
DROP POLICY IF EXISTS "Motoristas podem ver suas viagens" ON viagens;

CREATE POLICY "Ver viagens da empresa"
ON viagens FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  EXISTS (SELECT 1 FROM motoristas m WHERE m.id = viagens.motorista_id AND m.user_id = auth.uid()) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar viagens da empresa"
ON viagens FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= ESTOQUE =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar estoque" ON itens_estoque;
DROP POLICY IF EXISTS "Usuários autorizados podem ver estoque" ON itens_estoque;

CREATE POLICY "Ver itens estoque da empresa"
ON itens_estoque FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar itens estoque da empresa"
ON itens_estoque FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= CATEGORIAS ESTOQUE =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar categorias" ON categorias_estoque;
DROP POLICY IF EXISTS "Usuários autorizados podem ver categorias" ON categorias_estoque;

CREATE POLICY "Ver categorias da empresa"
ON categorias_estoque FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar categorias da empresa"
ON categorias_estoque FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= MANUTENÇÕES =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar manutenções" ON manutencoes;
DROP POLICY IF EXISTS "Todos autenticados podem ver manutenções" ON manutencoes;

CREATE POLICY "Ver manutenções da empresa"
ON manutencoes FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar manutenções da empresa"
ON manutencoes FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= MECÂNICOS =============
DROP POLICY IF EXISTS "Admins e Operacionais podem gerenciar mecânicos" ON mecanicos;
DROP POLICY IF EXISTS "Mecânicos podem ver seus próprios dados" ON mecanicos;

CREATE POLICY "Ver mecânicos da empresa"
ON mecanicos FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  auth.uid() = user_id OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar mecânicos da empresa"
ON mecanicos FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= ACERTOS =============
DROP POLICY IF EXISTS "Admins e Financeiro podem gerenciar acertos" ON acertos;
DROP POLICY IF EXISTS "Motoristas veem seus acertos" ON acertos;

CREATE POLICY "Ver acertos da empresa"
ON acertos FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  EXISTS (SELECT 1 FROM motoristas m WHERE m.id = acertos.motorista_id AND m.user_id = auth.uid()) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar acertos da empresa"
ON acertos FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============= ACERTOS CLT =============
DROP POLICY IF EXISTS "Admins e Financeiro podem gerenciar acertos CLT" ON acertos_clt;
DROP POLICY IF EXISTS "Motoristas podem ver seus acertos CLT" ON acertos_clt;

CREATE POLICY "Ver acertos CLT da empresa"
ON acertos_clt FOR SELECT
TO authenticated
USING (
  empresa_id = get_user_empresa_id() OR
  EXISTS (SELECT 1 FROM motoristas m WHERE m.id = acertos_clt.motorista_id AND m.user_id = auth.uid()) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Gerenciar acertos CLT da empresa"
ON acertos_clt FOR ALL
TO authenticated
USING (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);