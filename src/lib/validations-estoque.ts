import { z } from 'zod';

// Schema para Item de Estoque
export const itemEstoqueSchema = z.object({
  codigo: z.string()
    .min(1, 'Código é obrigatório')
    .max(50, 'Código muito longo'),
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição muito longa'),
  categoria: z.enum(['pneu', 'fluido', 'epi', 'peca', 'outros'], {
    errorMap: () => ({ message: 'Categoria inválida' })
  }),
  unidade: z.string()
    .min(1, 'Unidade é obrigatória')
    .max(10, 'Unidade muito longa'),
  estoque_atual: z.number()
    .min(0, 'Estoque não pode ser negativo')
    .default(0),
  estoque_minimo: z.number()
    .min(0, 'Estoque mínimo não pode ser negativo')
    .default(0),
  local: z.string().optional(),
  custo_medio: z.number()
    .min(0, 'Custo não pode ser negativo')
    .default(0),
  fornecedor: z.string().optional(),
  observacoes: z.string().optional(),
});

// Schema para Movimentação
export const movimentacaoEstoqueSchema = z.object({
  item_id: z.string().uuid('Item inválido'),
  tipo: z.enum(['entrada', 'saida', 'ajuste'], {
    errorMap: () => ({ message: 'Tipo de movimentação inválido' })
  }),
  quantidade: z.number()
    .min(0.01, 'Quantidade deve ser maior que zero'),
  custo_unitario: z.number()
    .min(0, 'Custo não pode ser negativo')
    .optional(),
  motivo: z.string().optional(),
  referencia_viagem_id: z.string().uuid().optional(),
});

export type ItemEstoqueFormData = z.infer<typeof itemEstoqueSchema>;
export type MovimentacaoEstoqueFormData = z.infer<typeof movimentacaoEstoqueSchema>;

// Interface para Item com alertas
export interface ItemEstoqueComAlerta extends ItemEstoqueFormData {
  id: string;
  critico: boolean;
  percentual_uso: number;
  created_at: string;
  updated_at: string;
}

// Função para calcular novo custo médio (média móvel ponderada)
export function calcularCustoMedio(
  qtdAnterior: number,
  custoMedioAnterior: number,
  qtdEntrada: number,
  custoUnitarioEntrada: number
): number {
  if (qtdAnterior + qtdEntrada === 0) return 0;
  
  const valorTotal = (qtdAnterior * custoMedioAnterior) + (qtdEntrada * custoUnitarioEntrada);
  return valorTotal / (qtdAnterior + qtdEntrada);
}

// Função para validar se há estoque suficiente
export function validarEstoqueSuficiente(
  estoqueAtual: number,
  quantidadeSaida: number
): boolean {
  return estoqueAtual >= quantidadeSaida;
}

// Função para verificar itens críticos (abaixo do mínimo)
export function isItemCritico(estoqueAtual: number, estoqueMinimo: number): boolean {
  return estoqueAtual <= estoqueMinimo;
}

// Função para calcular percentual de uso do estoque
export function calcularPercentualUso(estoqueAtual: number, estoqueMinimo: number): number {
  if (estoqueMinimo === 0) return 100;
  return (estoqueAtual / estoqueMinimo) * 100;
}

// Função para gerar código automático
export function gerarCodigoItem(categoria: string, sequencia: number): string {
  const prefixos: Record<string, string> = {
    pneu: 'PN',
    fluido: 'FL',
    epi: 'EP',
    peca: 'PC',
    outros: 'OU',
  };
  
  const prefixo = prefixos[categoria] || 'IT';
  return `${prefixo}${String(sequencia).padStart(4, '0')}`;
}

// Função para exportar CSV de itens
export function exportarItensCSV(itens: ItemEstoqueComAlerta[]): string {
  const headers = [
    'Código',
    'Descrição',
    'Categoria',
    'Unidade',
    'Estoque Atual',
    'Estoque Mínimo',
    'Status',
    'Local',
    'Custo Médio',
    'Fornecedor',
    'Observações'
  ];
  
  const rows = itens.map(item => [
    item.codigo,
    item.descricao,
    item.categoria,
    item.unidade,
    item.estoque_atual.toString(),
    item.estoque_minimo.toString(),
    item.critico ? 'CRÍTICO' : 'OK',
    item.local || '',
    item.custo_medio.toFixed(2),
    item.fornecedor || '',
    item.observacoes || ''
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

// Função para exportar CSV de movimentações
export function exportarMovimentacoesCSV(movimentacoes: any[]): string {
  const headers = [
    'Data',
    'Item',
    'Tipo',
    'Quantidade',
    'Custo Unitário',
    'Valor Total',
    'Motivo',
    'Viagem',
    'Usuário'
  ];
  
  const rows = movimentacoes.map(mov => [
    new Date(mov.data).toLocaleDateString('pt-BR'),
    mov.item?.descricao || '-',
    mov.tipo.toUpperCase(),
    mov.quantidade.toString(),
    mov.custo_unitario ? `R$ ${mov.custo_unitario.toFixed(2)}` : '-',
    mov.custo_unitario ? `R$ ${(mov.quantidade * mov.custo_unitario).toFixed(2)}` : '-',
    mov.motivo || '-',
    mov.referencia_viagem_id || '-',
    mov.usuario?.nome || '-'
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

// Labels para exibição
export const categoriaLabels: Record<string, string> = {
  pneu: 'Pneu',
  fluido: 'Fluido',
  epi: 'EPI',
  peca: 'Peça',
  outros: 'Outros',
};

export const tipoMovimentacaoLabels: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  ajuste: 'Ajuste',
};
