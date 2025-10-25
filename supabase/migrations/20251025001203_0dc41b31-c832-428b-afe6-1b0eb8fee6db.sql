-- Criar tabela de categorias de estoque
CREATE TABLE public.categorias_estoque (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  descricao text,
  cor text DEFAULT '#6366f1',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categorias_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins e Operacionais podem gerenciar categorias"
ON public.categorias_estoque
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Usuários autorizados podem ver categorias"
ON public.categorias_estoque
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_categorias_estoque_updated_at
BEFORE UPDATE ON public.categorias_estoque
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO public.categorias_estoque (nome, descricao, cor) VALUES
('Peças', 'Peças e componentes para veículos', '#3b82f6'),
('Pneus', 'Pneus e câmaras', '#ef4444'),
('Lubrificantes', 'Óleos e lubrificantes', '#f59e0b'),
('Ferramentas', 'Ferramentas e equipamentos', '#8b5cf6'),
('Materiais de Limpeza', 'Produtos de limpeza e higiene', '#10b981'),
('Outros', 'Outros itens', '#6b7280');