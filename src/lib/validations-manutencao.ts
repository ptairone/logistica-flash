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
  data: z.string().min(1, 'Data é obrigatória'),
  data_inicio: z.string().optional(),
  data_conclusao: z.string().optional(),
  km_veiculo: z.number().min(0).optional(),
  custo: z.number().min(0).optional(),
  fornecedor: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  status: z.enum(['agendada', 'em_andamento', 'concluida', 'cancelada']).default('agendada'),
  proxima_manutencao_km: z.number().min(0).optional(),
  proxima_manutencao_data: z.string().optional(),
  notas_mecanico: z.string().optional(),
  observacoes: z.string().optional(),
});

export const alertaManutencaoSchema = z.object({
  veiculo_id: z.string().uuid(),
  tipo: z.enum(['km', 'data', 'ambos']),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  km_alerta: z.number().min(0).optional(),
  data_alerta: z.string().optional(),
});

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
