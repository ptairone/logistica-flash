import { z } from 'zod';

// Validação de CPF
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// Validação de CNPJ
function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

export const freteSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório').max(50),
  cliente_nome: z.string().min(1, 'Nome do cliente é obrigatório').max(255),
  cliente_cnpj_cpf: z.string()
    .min(1, 'CPF/CNPJ é obrigatório')
    .refine((val) => {
      const clean = val.replace(/\D/g, '');
      return clean.length === 11 ? validarCPF(clean) : clean.length === 14 ? validarCNPJ(clean) : false;
    }, {
      message: 'CPF ou CNPJ inválido',
    }),
  cliente_contato: z.string().optional(),
  origem: z.string().optional(),
  origem_cep: z.string().optional(),
  origem_logradouro: z.string().optional(),
  origem_numero: z.string().optional(),
  origem_cidade: z.string().min(1, 'Cidade de origem é obrigatória').max(255),
  origem_uf: z.string().optional(),
  origem_ponto_referencia: z.string().optional(),
  destino: z.string().optional(),
  destino_cep: z.string().optional(),
  destino_logradouro: z.string().optional(),
  destino_numero: z.string().optional(),
  destino_cidade: z.string().min(1, 'Cidade de destino é obrigatória').max(255),
  destino_uf: z.string().optional(),
  destino_ponto_referencia: z.string().optional(),
  data_coleta: z.string().optional(),
  data_entrega: z.string().optional(),
  produto: z.string().optional(),
  tipo_carga: z.string().optional(),
  peso: z.number().min(0).optional(),
  volume: z.number().min(0).optional(),
  valor_frete: z.number().min(0, 'Valor do frete deve ser maior que zero'),
  condicao_pagamento: z.string().optional(),
  status: z.enum(['aberto', 'faturado', 'cancelado']),
  numero_fatura: z.string().optional(),
  observacoes: z.string().optional(),
});

export type FreteFormData = z.infer<typeof freteSchema>;

// Função para formatar CPF/CNPJ
export function formatCPFCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '');
  
  if (clean.length <= 11) {
    // CPF: 000.000.000-00
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return clean
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
}

// Validar se frete pode ser faturado
export function podeFaturarFrete(viagens: any[]): { pode: boolean; motivo?: string } {
  if (!viagens || viagens.length === 0) {
    return { pode: false, motivo: 'Nenhuma viagem vinculada ao frete' };
  }
  
  const viagensNaoConcluidas = viagens.filter(v => v.status !== 'concluida');
  if (viagensNaoConcluidas.length > 0) {
    return { pode: false, motivo: 'Existem viagens não concluídas vinculadas a este frete' };
  }
  
  return { pode: true };
}

// Exportar fretes para CSV
export function exportarFretesCSV(fretes: any[]): void {
  const headers = [
    'Código',
    'Cliente',
    'CPF/CNPJ',
    'Origem',
    'Destino',
    'Data Coleta',
    'Data Entrega',
    'Valor (R$)',
    'Status',
    'Nº Fatura',
  ];
  
  const rows = fretes.map(f => [
    f.codigo,
    f.cliente_nome,
    f.cliente_cnpj_cpf,
    f.origem,
    f.destino,
    f.data_coleta || '',
    f.data_entrega || '',
    f.valor_frete?.toFixed(2) || '0.00',
    f.status,
    f.numero_fatura || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `fretes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
