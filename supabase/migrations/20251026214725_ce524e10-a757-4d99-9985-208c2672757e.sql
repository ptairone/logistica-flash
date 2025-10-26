-- Adicionar coluna forma_pagamento na tabela transacoes_viagem
ALTER TABLE public.transacoes_viagem 
ADD COLUMN forma_pagamento text;

COMMENT ON COLUMN public.transacoes_viagem.forma_pagamento IS 'Forma de pagamento: dinheiro, pix, cheque, carta_frete';