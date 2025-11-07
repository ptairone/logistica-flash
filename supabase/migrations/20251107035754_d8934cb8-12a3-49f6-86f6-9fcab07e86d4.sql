-- Adicionar campo descricao_carga para descrição textual livre da carga
ALTER TABLE fretes 
ADD COLUMN IF NOT EXISTS descricao_carga TEXT;

-- Comentários explicativos
COMMENT ON COLUMN fretes.descricao_carga IS 'Descrição livre da carga (ex: "Produtos alimentícios", "Eletrônicos")';
COMMENT ON COLUMN fretes.tipo_carga IS 'Tipo de carga ANTT para cálculo do piso mínimo (ex: "granel_solido", "frigorificada")';