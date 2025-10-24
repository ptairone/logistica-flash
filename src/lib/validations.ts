import { z } from 'zod';

// Validação de placa Mercosul (ABC1D23 ou ABC-1D23)
export const placaMercosulRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export const veiculoSchema = z.object({
  codigo_interno: z.string().min(1, 'Código interno é obrigatório').max(50),
  placa: z.string()
    .min(7, 'Placa inválida')
    .max(7, 'Placa inválida')
    .refine((val) => placaMercosulRegex.test(val.replace(/[^A-Z0-9]/g, '')), {
      message: 'Placa deve estar no formato Mercosul (ABC1D23)',
    }),
  renavam: z.string().optional(),
  marca: z.string().min(1, 'Marca é obrigatória').max(100),
  modelo: z.string().min(1, 'Modelo é obrigatório').max(100),
  ano: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  tipo: z.enum(['caminhao', 'carreta', 'utilitario', 'van', 'outros']),
  capacidade_kg: z.number().min(0).optional(),
  capacidade_m3: z.number().min(0).optional(),
  km_atual: z.number().min(0).optional(),
  proxima_manutencao_km: z.number().min(0).optional(),
  proxima_manutencao_data: z.string().optional(),
  vencimento_ipva: z.string().optional(),
  vencimento_licenciamento: z.string().optional(),
  vencimento_seguro: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'manutencao']),
  observacoes: z.string().optional(),
});

export const manutencaoSchema = z.object({
  veiculo_id: z.string().uuid(),
  data: z.string().min(1, 'Data é obrigatória'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  descricao: z.string().optional(),
  km_veiculo: z.number().min(0).optional(),
  custo: z.number().min(0).optional(),
  fornecedor: z.string().optional(),
  observacoes: z.string().optional(),
});

export type VeiculoFormData = z.infer<typeof veiculoSchema>;
export type ManutencaoFormData = z.infer<typeof manutencaoSchema>;

// Função para formatar placa no padrão Mercosul
export function formatPlacaMercosul(value: string): string {
  const cleanValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 4) return cleanValue.slice(0, 3) + cleanValue.slice(3);
  if (cleanValue.length <= 5) return cleanValue.slice(0, 3) + cleanValue.slice(3, 4) + cleanValue.slice(4);
  return cleanValue.slice(0, 3) + cleanValue.slice(3, 4) + cleanValue.slice(4, 5) + cleanValue.slice(5, 7);
}

// Função para formatar data para input
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

// Função para formatar data para exibição (dd/mm/aaaa)
export function formatDateBR(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}

// Função para verificar se uma data está próxima de vencer (30 dias)
export function isDateExpiringSoon(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30 && diffDays >= 0;
}

// Função para verificar se uma data já venceu
export function isDateExpired(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  return date < new Date();
}
