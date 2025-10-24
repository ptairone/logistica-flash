import { z } from 'zod';

export const viagemSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório').max(50),
  veiculo_id: z.string().uuid('Selecione um veículo'),
  motorista_id: z.string().uuid('Selecione um motorista'),
  frete_id: z.string().uuid().optional(),
  origem: z.string().min(1, 'Origem é obrigatória').max(255),
  origem_cep: z.string().optional(),
  destino: z.string().min(1, 'Destino é obrigatório').max(255),
  destino_cep: z.string().optional(),
  data_saida: z.string().optional(),
  data_chegada: z.string().optional(),
  km_estimado: z.number().min(0).optional(),
  km_percorrido: z.number().min(0).optional(),
  status: z.enum(['planejada', 'em_andamento', 'concluida', 'cancelada']),
  notas: z.string().optional(),
}).refine((data) => {
  // Se status é concluída, deve ter data de chegada
  if (data.status === 'concluida' && !data.data_chegada) {
    return false;
  }
  return true;
}, {
  message: 'Viagem concluída deve ter data/hora de chegada',
  path: ['data_chegada'],
});

export const despesaSchema = z.object({
  viagem_id: z.string().uuid(),
  tipo: z.enum(['combustivel', 'pedagio', 'alimentacao', 'hospedagem', 'manutencao', 'outros']),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  data: z.string().min(1, 'Data é obrigatória'),
  descricao: z.string().optional(),
  reembolsavel: z.boolean().optional(),
});

export type ViagemFormData = z.infer<typeof viagemSchema>;
export type DespesaFormData = z.infer<typeof despesaSchema>;

// Função para formatar CEP
export function formatCEP(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 5) return cleanValue;
  return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
}

// Calcular totais da viagem
export interface ViagemCalculos {
  totalDespesas: number;
  custoKm: number;
  margem: number;
  receita: number;
}

export function calcularTotaisViagem(
  despesas: Array<{ valor: number }>,
  kmPercorrido: number | null | undefined,
  valorFrete: number | null | undefined
): ViagemCalculos {
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const km = kmPercorrido || 0;
  const receita = valorFrete || 0;
  const custoKm = km > 0 ? totalDespesas / km : 0;
  const margem = receita - totalDespesas;

  return {
    totalDespesas,
    custoKm,
    margem,
    receita,
  };
}
