-- Tornar o bucket comprovantes público para permitir acesso às fotos do hodômetro
UPDATE storage.buckets
SET public = true
WHERE id = 'comprovantes';