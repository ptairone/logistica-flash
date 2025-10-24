import { z } from 'zod';

export const acertoSchema = z.object({
  motorista_id: z.string().uuid('Selecione um motorista'),
  periodo_inicio: z.string().min(1, 'Data inicial é obrigatória'),
  periodo_fim: z.string().min(1, 'Data final é obrigatória'),
  codigo: z.string().min(1, 'Código é obrigatório').max(50),
  base_comissao: z.number().min(0).optional(),
  percentual_comissao: z.number().min(0).max(100).optional(),
  valor_comissao: z.number().min(0).optional(),
  total_reembolsos: z.number().min(0).optional(),
  total_adiantamentos: z.number().min(0).optional(),
  total_descontos: z.number().min(0).optional(),
  total_pagar: z.number().optional(),
  status: z.enum(['aberto', 'fechado', 'pago']),
  data_pagamento: z.string().optional(),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
}).refine((data) => {
  const inicio = new Date(data.periodo_inicio);
  const fim = new Date(data.periodo_fim);
  return fim >= inicio;
}, {
  message: 'Data final deve ser maior ou igual à data inicial',
  path: ['periodo_fim'],
});

export type AcertoFormData = z.infer<typeof acertoSchema>;

// Interface para viagem selecionável
export interface ViagemAcerto {
  id: string;
  codigo: string;
  origem: string;
  destino: string;
  data_saida: string;
  km_percorrido: number | null;
  frete?: {
    valor_frete: number;
  };
  despesas: Array<{
    valor: number;
    reembolsavel: boolean;
  }>;
}

// Calcular totais do acerto
export interface AcertoCalculos {
  baseComissao: number;
  valorComissao: number;
  totalReembolsos: number;
  totalPagar: number;
  receitaTotal: number;
  despesasNaoReembolsaveis: number;
}

export function calcularAcerto(
  viagens: ViagemAcerto[],
  percentualComissao: number,
  adiantamentos: number,
  descontos: number
): AcertoCalculos {
  let receitaTotal = 0;
  let despesasNaoReembolsaveis = 0;
  let totalReembolsos = 0;

  viagens.forEach((viagem) => {
    // Somar receita dos fretes
    if (viagem.frete?.valor_frete) {
      receitaTotal += viagem.frete.valor_frete;
    }

    // Somar despesas
    viagem.despesas.forEach((despesa) => {
      if (despesa.reembolsavel) {
        totalReembolsos += despesa.valor;
      } else {
        despesasNaoReembolsaveis += despesa.valor;
      }
    });
  });

  // Base de comissão = Receita - despesas não reembolsáveis
  const baseComissao = receitaTotal - despesasNaoReembolsaveis;

  // Valor da comissão = Base × percentual
  const valorComissao = (baseComissao * percentualComissao) / 100;

  // Total a pagar = comissão + reembolsos - adiantamentos - descontos
  const totalPagar = valorComissao + totalReembolsos - adiantamentos - descontos;

  return {
    baseComissao,
    valorComissao,
    totalReembolsos,
    totalPagar,
    receitaTotal,
    despesasNaoReembolsaveis,
  };
}

// Gerar código automático para acerto
export function gerarCodigoAcerto(motoristaNome: string, data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const iniciais = motoristaNome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  
  return `AC${ano}${mes}${iniciais}`;
}
