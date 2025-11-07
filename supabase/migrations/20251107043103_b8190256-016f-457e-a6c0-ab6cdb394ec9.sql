-- Adicionar coluna pracas_pedagio para armazenar detalhes das praças
COMMENT ON COLUMN fretes.pracas_pedagio IS 'Array com detalhes de cada praça de pedágio: [{nome, valor, cidade, uf, rodovia}]';

-- A coluna pracas_pedagio já existe como jsonb, apenas adicionar o comentário