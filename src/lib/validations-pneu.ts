import { z } from 'zod';

export const pneuSchema = z.object({
  numero_serie: z.string().min(1, 'Número de série obrigatório'),
  codigo_interno: z.string().min(1, 'Código interno obrigatório'),
  marca: z.string().min(1, 'Marca obrigatória'),
  modelo: z.string().min(1, 'Modelo obrigatório'),
  medida: z.string().min(1, 'Medida obrigatória (ex: 295/80R22.5)'),
  tipo: z.enum(['dianteiro', 'traseiro', 'estepe'], {
    required_error: 'Tipo obrigatório',
  }),
  item_estoque_id: z.string().uuid().optional(),
  local_id: z.string().uuid().optional(),
  local_estoque: z.string().optional(),
  data_compra: z.string().optional(),
  fornecedor: z.string().optional(),
  valor_compra: z.number().min(0).optional(),
  profundidade_sulco_mm: z.number().min(0).max(30).optional(),
  profundidade_minima_mm: z.number().min(0).max(10).default(1.6),
  observacoes: z.string().optional(),
});

export const instalacaoPneuSchema = z.object({
  pneu_id: z.string().uuid('Selecione um pneu'),
  veiculo_id: z.string().uuid('Selecione um veículo'),
  posicao_veiculo: z.string().min(1, 'Selecione a posição'),
  km_atual: z.number().int().min(0, 'KM atual obrigatório'),
  profundidade_sulco_mm: z.number().min(0).max(30).optional(),
});

export const medicaoPneuSchema = z.object({
  pneu_id: z.string().uuid(),
  veiculo_id: z.string().uuid().optional(),
  km_veiculo: z.number().int().min(0).optional(),
  profundidade_interna_mm: z.number().min(0).max(30, 'Máximo 30mm'),
  profundidade_central_mm: z.number().min(0).max(30, 'Máximo 30mm'),
  profundidade_externa_mm: z.number().min(0).max(30, 'Máximo 30mm'),
  pressao_psi: z.number().min(0).max(200, 'Máximo 200 PSI'),
  temperatura_celsius: z.number().min(-20).max(100).optional(),
  desgaste_irregular: z.boolean().default(false),
  danos_visiveis: z.boolean().default(false),
  necessita_atencao: z.boolean().default(false),
  observacoes: z.string().optional(),
});

export const rodizioPneuSchema = z.object({
  veiculo_id: z.string().uuid('Selecione um veículo'),
  km_atual: z.number().int().min(0, 'KM atual obrigatório'),
  trocas: z.array(z.object({
    pneu_id: z.string().uuid(),
    posicao_anterior: z.string(),
    posicao_nova: z.string(),
  })).min(1, 'Adicione pelo menos uma troca'),
  observacoes: z.string().optional(),
});

export type PneuFormData = z.infer<typeof pneuSchema>;
export type InstalacaoPneuFormData = z.infer<typeof instalacaoPneuSchema>;
export type MedicaoPneuFormData = z.infer<typeof medicaoPneuSchema>;
export type RodizioPneuFormData = z.infer<typeof rodizioPneuSchema>;

// Funções helper
export function calcularDesgastePneu(
  kmRodados: number,
  profundidadeInicial: number,
  profundidadeAtual: number
): number {
  if (kmRodados === 0 || profundidadeInicial === profundidadeAtual) return 0;
  const desgaste = profundidadeInicial - profundidadeAtual;
  return (desgaste / kmRodados) * 1000; // mm/1000km
}

export function calcularProfundidadeMedia(
  interna: number,
  central: number,
  externa: number
): number {
  return (interna + central + externa) / 3;
}

export function verificarPneuCritico(
  profundidade: number,
  minimo: number = 1.6
): boolean {
  return profundidade <= minimo;
}

export function verificarDesgasteIrregular(
  interna: number,
  central: number,
  externa: number,
  tolerancia: number = 1.5
): boolean {
  const max = Math.max(interna, central, externa);
  const min = Math.min(interna, central, externa);
  return (max - min) > tolerancia;
}

export function estimarKmRestante(
  profundidadeAtual: number,
  profundidadeMinima: number,
  taxaDesgaste: number
): number {
  if (taxaDesgaste === 0) return 0;
  const desgasteRestante = profundidadeAtual - profundidadeMinima;
  return (desgasteRestante / taxaDesgaste) * 1000;
}

// Funções para Posições Dinâmicas por Número de Eixos
// Gerar posições dinamicamente baseado no número de eixos e tipo de veículo
export function gerarPosicoesPneu(numeroEixos: number, tipo: 'cavalo' | 'reboque' = 'cavalo'): { value: string; label: string }[] {
  const posicoes = [];
  
  for (let eixo = 1; eixo <= numeroEixos; eixo++) {
    // Para reboques, TODOS os eixos têm pneus duplos (2 de cada lado)
    // Para cavalos, apenas o eixo 1 é simples (direção)
    if (tipo === 'cavalo' && eixo === 1) {
      // Eixo dianteiro do cavalo: 1 pneu por lado (direção)
      posicoes.push(
        { value: `eixo_${eixo}_esquerda`, label: `Eixo ${eixo} - Esquerda` },
        { value: `eixo_${eixo}_direita`, label: `Eixo ${eixo} - Direita` }
      );
    } else {
      // Todos os eixos de reboque OU eixos 2+ do cavalo: 2 pneus por lado (interno/externo)
      posicoes.push(
        { value: `eixo_${eixo}_esquerda_externa`, label: `Eixo ${eixo} - Esquerda Externa` },
        { value: `eixo_${eixo}_esquerda_interna`, label: `Eixo ${eixo} - Esquerda Interna` },
        { value: `eixo_${eixo}_direita_interna`, label: `Eixo ${eixo} - Direita Interna` },
        { value: `eixo_${eixo}_direita_externa`, label: `Eixo ${eixo} - Direita Externa` }
      );
    }
  }
  
  posicoes.push({ value: 'estepe', label: 'Estepe' });
  
  return posicoes;
}

// Calcular total de posições de pneus baseado no número de eixos e tipo
export function calcularTotalPneus(numeroEixos: number, tipo: 'cavalo' | 'reboque' = 'cavalo'): number {
  if (numeroEixos === 0) return 0;
  
  if (tipo === 'reboque') {
    // Reboques: todos os eixos têm 4 pneus (duplo)
    return numeroEixos * 4;
  } else {
    // Cavalo: eixo 1 tem 2 pneus (simples), eixos 2+ têm 4 pneus cada (duplo)
    return 2 + ((numeroEixos - 1) * 4);
  }
}

// Labels e Opções
export const statusPneuLabels: Record<string, string> = {
  estoque: 'Em Estoque',
  em_uso: 'Em Uso',
  recapagem: 'Em Recapagem',
  descartado: 'Descartado',
};

export const statusPneuColors: Record<string, string> = {
  estoque: 'bg-blue-500',
  em_uso: 'bg-green-500',
  recapagem: 'bg-yellow-500',
  descartado: 'bg-gray-500',
};

export const tipoPneuLabels: Record<string, string> = {
  dianteiro: 'Dianteiro',
  traseiro: 'Traseiro',
  estepe: 'Estepe',
};

export const posicoesPneu = [
  { value: 'eixo_1_esquerda', label: 'Eixo 1 - Esquerda' },
  { value: 'eixo_1_direita', label: 'Eixo 1 - Direita' },
  { value: 'eixo_2_esquerda_externa', label: 'Eixo 2 - Esquerda Externa' },
  { value: 'eixo_2_esquerda_interna', label: 'Eixo 2 - Esquerda Interna' },
  { value: 'eixo_2_direita_externa', label: 'Eixo 2 - Direita Externa' },
  { value: 'eixo_2_direita_interna', label: 'Eixo 2 - Direita Interna' },
  { value: 'eixo_3_esquerda_externa', label: 'Eixo 3 - Esquerda Externa' },
  { value: 'eixo_3_esquerda_interna', label: 'Eixo 3 - Esquerda Interna' },
  { value: 'eixo_3_direita_externa', label: 'Eixo 3 - Direita Externa' },
  { value: 'eixo_3_direita_interna', label: 'Eixo 3 - Direita Interna' },
  { value: 'estepe', label: 'Estepe' },
];

export const tiposPneu = [
  { value: 'dianteiro', label: 'Dianteiro' },
  { value: 'traseiro', label: 'Traseiro' },
  { value: 'estepe', label: 'Estepe' },
];

export const statusPneuOptions = [
  { value: 'estoque', label: 'Em Estoque' },
  { value: 'em_uso', label: 'Em Uso' },
  { value: 'recapagem', label: 'Em Recapagem' },
  { value: 'descartado', label: 'Descartado' },
];

export function getPosicaoLabel(posicao: string): string {
  const pos = posicoesPneu.find(p => p.value === posicao);
  return pos?.label || posicao;
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    estoque: 'bg-blue-500',
    em_uso: 'bg-green-500',
    recapagem: 'bg-yellow-500',
    descartado: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function getProfundidadeColor(profundidade: number, minimo: number = 1.6): string {
  if (profundidade <= minimo) return 'text-red-500';
  if (profundidade <= minimo + 1) return 'text-yellow-500';
  return 'text-green-500';
}
