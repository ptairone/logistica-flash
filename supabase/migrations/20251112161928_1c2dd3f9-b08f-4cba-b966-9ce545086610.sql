-- Corrigir empresa_id NULL em categorias_estoque
UPDATE categorias_estoque 
SET empresa_id = (SELECT id FROM empresas LIMIT 1)
WHERE empresa_id IS NULL;

-- Corrigir empresa_id NULL em itens_estoque  
UPDATE itens_estoque
SET empresa_id = (SELECT id FROM empresas LIMIT 1)
WHERE empresa_id IS NULL;

-- Tornar empresa_id obrigatório em categorias_estoque
ALTER TABLE categorias_estoque 
  ALTER COLUMN empresa_id SET NOT NULL;
  
-- Tornar empresa_id obrigatório em itens_estoque
ALTER TABLE itens_estoque
  ALTER COLUMN empresa_id SET NOT NULL;