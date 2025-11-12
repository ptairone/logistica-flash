-- Atualizar política RLS para permitir super_admin criar fretes sem empresa_id
DROP POLICY IF EXISTS "Gerenciar fretes da empresa" ON fretes;

CREATE POLICY "Gerenciar fretes da empresa"
ON fretes FOR ALL
TO authenticated
USING (
  -- Super admin pode fazer tudo
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Usuários normais só veem/editam da própria empresa
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operacional'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role)))
)
WITH CHECK (
  -- Super admin pode criar sem empresa_id
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Usuários normais devem ter empresa_id válido
  (empresa_id = get_user_empresa_id() AND 
   (has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operacional'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role)))
);