-- Habilitar Realtime na tabela viagens
ALTER TABLE public.viagens REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.viagens;