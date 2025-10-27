import { z } from "zod";

export const configCLTSchema = z.object({
  motorista_id: z.string().uuid("ID do motorista inválido"),
  salario_base: z.number().min(0, "Salário deve ser maior que zero"),
  valor_diaria: z.number().min(0, "Valor da diária inválido"),
  valor_hora_extra: z.number().min(0, "Valor da hora extra inválido"),
  valor_hora_fds: z.number().min(0, "Valor da hora de fim de semana inválido"),
  valor_hora_feriado: z.number().min(0, "Valor da hora de feriado inválido"),
  ativo: z.boolean().optional(),
});

export const diaTrabalhadoCLTSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (formato: YYYY-MM-DD)"),
  dia_semana: z.number().min(0).max(6, "Dia da semana inválido (0-6)"),
  horas_totais: z.number().min(0, "Horas totais inválidas"),
  horas_normais: z.number().min(0, "Horas normais inválidas"),
  horas_extras: z.number().min(0, "Horas extras inválidas"),
  km_rodados: z.number().min(0).optional(),
  horas_em_movimento: z.number().min(0).optional(),
  horas_parado_ligado: z.number().min(0).optional(),
  horas_tempo_noturno: z.number().min(0).optional(),
  valor_diaria: z.number().min(0, "Valor da diária inválido"),
  valor_horas_extras: z.number().min(0, "Valor de horas extras inválido"),
  valor_adicional_fds: z.number().min(0).optional(),
  valor_adicional_feriado: z.number().min(0).optional(),
  valor_adicional_noturno: z.number().min(0).optional(),
  valor_total_dia: z.number().min(0, "Valor total do dia inválido"),
  eh_feriado: z.boolean().optional(),
  nome_feriado: z.string().optional(),
  origem: z.enum(['manual', 'pdf', 'rastreador']).optional(),
  dados_rastreador: z.any().optional(),
});

export const acertoCLTSchema = z.object({
  motorista_id: z.string().uuid("Selecione um motorista"),
  periodo_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início inválida"),
  periodo_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de fim inválida"),
  codigo: z.string(),
  salario_base: z.number().min(0, "Salário base inválido"),
  total_diarias: z.number().min(0).optional(),
  total_horas_extras: z.number().min(0).optional(),
  total_horas_fds: z.number().min(0).optional(),
  valor_horas_fds: z.number().min(0).optional(),
  total_horas_feriados: z.number().min(0).optional(),
  valor_horas_feriados: z.number().min(0).optional(),
  total_descontos: z.number().min(0).optional(),
  total_bruto: z.number().min(0).optional(),
  total_liquido: z.number().min(0).optional(),
  dias_trabalhados: z.number().int().min(0).optional(),
  observacoes: z.string().optional(),
  status: z.enum(['aberto', 'revisao', 'aprovado', 'pago', 'cancelado']).optional(),
  tipo_entrada: z.enum(['manual', 'automatico', 'hibrido']).optional(),
});

export type ConfigCLT = z.infer<typeof configCLTSchema>;
export type DiaTrabalhadoCLT = z.infer<typeof diaTrabalhadoCLTSchema>;
export type AcertoCLT = z.infer<typeof acertoCLTSchema>;
