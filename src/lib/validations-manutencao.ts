import { z } from 'zod';

export const mecanicoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  especialidades: z.array(z.string()).optional(),
  status: z.enum(['ativo', 'inativo', 'ferias']).default('ativo'),
  observacoes: z.string().optional(),
});

export const manutencaoSchema = z.object({
  veiculo_id: z.string().uuid(),
  mecanico_id: z.string().uuid().optional(),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  descricao: z.string().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  data_conclusao: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  km_veiculo: z.number().min(0).optional(),
  custo: z.number().min(0).optional(),
  fornecedor: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  status: z.enum(['agendada', 'em_andamento', 'concluida', 'cancelada']).default('agendada'),
  proxima_manutencao_km: z.number().min(0).optional(),
  proxima_manutencao_data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  notas_mecanico: z.string().optional(),
  observacoes: z.string().optional(),
});

export const alertaManutencaoSchema = z.object({
  veiculo_id: z.string().uuid(),
  tipo: z.enum(['km', 'data', 'ambos']),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  km_alerta: z.number().min(0).optional(),
  data_alerta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
}).refine(
  (data) => {
    if (data.tipo === 'km' || data.tipo === 'ambos') {
      return data.km_alerta !== undefined && data.km_alerta > 0;
    }
    return true;
  },
  { message: 'KM de alerta é obrigatório para alertas do tipo "km" ou "ambos"', path: ['km_alerta'] }
).refine(
  (data) => {
    if (data.tipo === 'data' || data.tipo === 'ambos') {
      return data.data_alerta !== undefined && data.data_alerta.length > 0;
    }
    return true;
  },
  { message: 'Data de alerta é obrigatória para alertas do tipo "data" ou "ambos"', path: ['data_alerta'] }
);

export const manutencaoItemSchema = z.object({
  manutencao_id: z.string().uuid(),
  item_id: z.string().uuid(),
  quantidade: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  custo_unitario: z.number().min(0),
});

export type MecanicoFormData = z.infer<typeof mecanicoSchema>;
export type ManutencaoFormData = z.infer<typeof manutencaoSchema>;
export type AlertaManutencaoFormData = z.infer<typeof alertaManutencaoSchema>;
export type ManutencaoItemFormData = z.infer<typeof manutencaoItemSchema>;

export const prioridadeLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const statusManutencaoLabels: Record<string, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const statusMecanicoLabels: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  ferias: 'Férias',
};

export const especialidadesOptions = [
  'Motor',
  'Transmissão',
  'Freios',
  'Suspensão',
  'Elétrica',
  'Ar Condicionado',
  'Hidráulica',
  'Pneus',
  'Funilaria',
  'Pintura',
];

export const tiposManutencao = [
  'Preventiva',
  'Corretiva',
  'Preditiva',
  'Revisão',
  'Troca de Óleo',
  'Alinhamento',
  'Balanceamento',
  'Freios',
  'Suspensão',
  'Motor',
  'Transmissão',
  'Elétrica',
  'Ar Condicionado',
  'Outros',
];
