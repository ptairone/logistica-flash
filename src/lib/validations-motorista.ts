import { z } from 'zod';

// Validação de telefone
export function formatTelefone(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 2) return clean;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

export const motoristaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  cpf: z.string().optional(),
  cnh: z.string().min(1, 'CNH é obrigatória').max(20),
  validade_cnh: z.string().min(1, 'Validade da CNH é obrigatória'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  comissao_padrao: z.number().min(0).max(100).optional(),
  status: z.enum(['ativo', 'inativo']),
  observacoes: z.string().optional(),
});

export type MotoristaFormData = z.infer<typeof motoristaSchema>;

// Verificar se CNH está vencida ou vence em breve
export function verificarValidadeCNH(dataValidade: string): {
  vencida: boolean;
  venceEmBreve: boolean;
  diasRestantes: number;
} {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const validade = new Date(dataValidade);
  validade.setHours(0, 0, 0, 0);
  
  const diffTime = validade.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    vencida: diffDays < 0,
    venceEmBreve: diffDays >= 0 && diffDays <= 7,
    diasRestantes: diffDays,
  };
}

// Calcular KPIs do motorista
export interface MotoristaKPIs {
  totalViagens: number;
  totalKm: number;
  totalDespesas: number;
  totalReceita: number;
  custoKm: number;
  receitaKm: number;
  margemTotal: number;
  pontualidade: number;
}

export function calcularKPIsMotorista(viagens: any[]): MotoristaKPIs {
  let totalViagens = viagens.length;
  let totalKm = 0;
  let totalDespesas = 0;
  let totalReceita = 0;
  let viagensNoPrazo = 0;

  viagens.forEach((viagem) => {
    if (viagem.km_percorrido) {
      totalKm += viagem.km_percorrido;
    }

    if (viagem.frete?.valor_frete) {
      totalReceita += viagem.frete.valor_frete;
    }

    if (viagem.despesas) {
      viagem.despesas.forEach((d: any) => {
        totalDespesas += d.valor || 0;
      });
    }

    // Verificar pontualidade
    if (viagem.status === 'concluida' && viagem.data_chegada && viagem.frete?.data_entrega) {
      const chegada = new Date(viagem.data_chegada);
      const previsao = new Date(viagem.frete.data_entrega);
      if (chegada <= previsao) {
        viagensNoPrazo++;
      }
    }
  });

  const custoKm = totalKm > 0 ? totalDespesas / totalKm : 0;
  const receitaKm = totalKm > 0 ? totalReceita / totalKm : 0;
  const margemTotal = totalReceita - totalDespesas;
  const pontualidade = totalViagens > 0 ? (viagensNoPrazo / totalViagens) * 100 : 0;

  return {
    totalViagens,
    totalKm,
    totalDespesas,
    totalReceita,
    custoKm,
    receitaKm,
    margemTotal,
    pontualidade,
  };
}

// Exportar motoristas para CSV
export function exportarMotoristasCSV(motoristas: any[]): void {
  const headers = [
    'Nome',
    'CPF',
    'CNH',
    'Validade CNH',
    'Telefone',
    'E-mail',
    'Comissão Padrão (%)',
    'Status',
  ];
  
  const rows = motoristas.map(m => [
    m.nome,
    m.cpf || '',
    m.cnh,
    m.validade_cnh || '',
    m.telefone,
    m.email || '',
    m.comissao_padrao?.toString() || '0',
    m.status,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `motoristas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
