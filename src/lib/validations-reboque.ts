import { z } from 'zod';

export const placaMercosulRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export const reboqueSchema = z.object({
  codigo_interno: z.string().min(1, 'Código interno é obrigatório'),
  placa: z.string()
    .min(1, 'Placa é obrigatória')
    .regex(placaMercosulRegex, 'Placa inválida. Use formato Mercosul (ABC1D23)'),
  chassi: z.string().optional(),
  renavam: z.string().optional(),
  tipo: z.enum(['semi_reboque', 'reboque', 'dolly'], {
    required_error: 'Tipo é obrigatório',
  }),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  numero_eixos: z.coerce.number().int().min(1).max(3, 'Máximo de 3 eixos'),
  capacidade_kg: z.coerce.number().positive().optional(),
  capacidade_m3: z.coerce.number().positive().optional(),
  vencimento_licenciamento: z.string().optional(),
  vencimento_seguro: z.string().optional(),
  status: z.enum(['disponivel', 'acoplado', 'manutencao', 'inativo']).default('disponivel'),
  observacoes: z.string().optional(),
});

export type ReboqueFormData = z.infer<typeof reboqueSchema>;

export function formatPlacaMercosul(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 3)}${cleaned.slice(3)}`;
  } else if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4, 5)}${cleaned.slice(5, 7)}`;
  }
}

export function getTipoReboqueLabel(tipo: string): string {
  const labels: Record<string, string> = {
    semi_reboque: 'Semi-reboque',
    reboque: 'Reboque',
    dolly: 'Dolly',
  };
  return labels[tipo] || tipo;
}

export function getStatusReboqueLabel(status: string): string {
  const labels: Record<string, string> = {
    disponivel: 'Disponível',
    acoplado: 'Acoplado',
    manutencao: 'Em Manutenção',
    inativo: 'Inativo',
  };
  return labels[status] || status;
}
