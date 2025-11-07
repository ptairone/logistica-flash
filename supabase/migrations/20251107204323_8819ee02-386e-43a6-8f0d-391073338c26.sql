-- Criar tabela para log de comprovantes recebidos via WhatsApp
CREATE TABLE public.comprovantes_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id UUID REFERENCES public.motoristas(id) ON DELETE CASCADE,
  viagem_id UUID REFERENCES public.viagens(id) ON DELETE SET NULL,
  telefone TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  tipo_identificado TEXT,
  confianca TEXT, -- alta, media, baixa
  dados_extraidos JSONB,
  status TEXT DEFAULT 'processando', -- processando, confirmado, erro, rejeitado
  erro_mensagem TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_comprovantes_whatsapp_motorista ON public.comprovantes_whatsapp(motorista_id);
CREATE INDEX idx_comprovantes_whatsapp_viagem ON public.comprovantes_whatsapp(viagem_id);
CREATE INDEX idx_comprovantes_whatsapp_status ON public.comprovantes_whatsapp(status);
CREATE INDEX idx_comprovantes_whatsapp_created ON public.comprovantes_whatsapp(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.comprovantes_whatsapp ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins e Operacionais podem gerenciar comprovantes WhatsApp"
  ON public.comprovantes_whatsapp
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Motoristas podem ver seus próprios comprovantes WhatsApp"
  ON public.comprovantes_whatsapp
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.motoristas m
      WHERE m.id = comprovantes_whatsapp.motorista_id
      AND m.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'operacional'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_comprovantes_whatsapp_updated_at
  BEFORE UPDATE ON public.comprovantes_whatsapp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();