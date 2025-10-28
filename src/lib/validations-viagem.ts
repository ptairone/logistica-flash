import { z } from 'zod';

export const viagemSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório').max(50),
  veiculo_id: z.string().uuid('Selecione um veículo'),
  motorista_id: z.string().uuid('Selecione um motorista'),
  frete_id: z.string().uuid().optional(),
  origem: z.string().optional(),
  origem_cep: z.string().optional(),
  destino: z.string().optional(),
  destino_cep: z.string().optional(),
  data_saida: z.string().optional(),
  data_chegada: z.string().optional(),
  km_estimado: z.number().min(0).optional(),
  km_inicial: z.number().min(0).optional(),
  km_final: z.number().min(0).optional(),
  status: z.enum(['planejada', 'em_andamento', 'concluida', 'cancelada']),
  notas: z.string().optional(),
}).refine((data) => {
  // Se não tem frete, origem e destino são obrigatórios
  if (!data.frete_id) {
    if (!data.origem || data.origem.trim() === '') {
      return false;
    }
    if (!data.destino || data.destino.trim() === '') {
      return false;
    }
  }
  return true;
}, {
  message: 'Origem e destino são obrigatórios quando não há frete vinculado',
  path: ['origem'],
}).refine((data) => {
  // km_final deve ser maior que km_inicial quando ambos existirem
  if (data.km_inicial !== undefined && data.km_final !== undefined && 
      data.km_inicial !== null && data.km_final !== null) {
    if (data.km_final <= data.km_inicial) {
      return false;
    }
  }
  return true;
}, {
  message: 'KM final deve ser maior que KM inicial',
  path: ['km_final'],
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

// Função para gerar código de viagem
export function gerarCodigoViagem(sequencia: number): string {
  return `V-${String(sequencia).padStart(6, '0')}`;
}

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
  receitaKm: number;
  margem: number;
  receita: number;
  tempoTotal: number; // em horas
}

export function calcularTotaisViagem(
  despesas: Array<{ valor: number }>,
  kmPercorrido: number | null | undefined,
  valorFrete: number | null | undefined,
  dataSaida?: string | null,
  dataChegada?: string | null
): ViagemCalculos {
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const km = kmPercorrido || 0;
  const receita = valorFrete || 0;
  const custoKm = km > 0 ? totalDespesas / km : 0;
  const receitaKm = km > 0 ? receita / km : 0;
  const margem = receita - totalDespesas;
  
  let tempoTotal = 0;
  if (dataSaida && dataChegada) {
    const saida = new Date(dataSaida);
    const chegada = new Date(dataChegada);
    tempoTotal = (chegada.getTime() - saida.getTime()) / (1000 * 60 * 60); // em horas
  }

  return {
    totalDespesas,
    custoKm,
    receitaKm,
    margem,
    receita,
    tempoTotal,
  };
}

// Labels para tipos de despesa
export const tiposDespesaLabels: Record<string, string> = {
  combustivel: 'Combustível',
  pedagio: 'Pedágio',
  alimentacao: 'Alimentação',
  hospedagem: 'Hospedagem',
  manutencao: 'Manutenção',
  outros: 'Outros',
};

// Labels para status de viagem
export const statusViagemLabels: Record<string, string> = {
  planejada: 'Planejada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

// Função para exportar CSV de viagens
export function exportarViagensCSV(viagens: any[]): string {
  const headers = [
    'Código',
    'Motorista',
    'Veículo',
    'Origem',
    'Destino',
    'Status',
    'Saída',
    'Chegada',
    'KM Percorrido',
    'Custo Total',
    'Receita',
    'Margem',
  ];
  
  const rows = viagens.map(viagem => [
    viagem.codigo,
    viagem.motorista?.nome || '-',
    viagem.veiculo?.placa || '-',
    viagem.origem,
    viagem.destino,
    statusViagemLabels[viagem.status] || viagem.status,
    viagem.data_saida ? new Date(viagem.data_saida).toLocaleDateString('pt-BR') : '-',
    viagem.data_chegada ? new Date(viagem.data_chegada).toLocaleDateString('pt-BR') : '-',
    viagem.km_percorrido || '0',
    viagem.totalDespesas?.toFixed(2) || '0.00',
    viagem.frete?.valor_frete?.toFixed(2) || '0.00',
    viagem.margem?.toFixed(2) || '0.00',
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}
