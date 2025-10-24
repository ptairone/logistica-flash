import { z } from 'zod';

// Schema para fornecedor
export const fornecedorSchema = z.object({
  razao: z.string(),
  cnpj: z.string(),
  inscricaoEstadual: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
});

// Schema para documento
export const documentoInfoSchema = z.object({
  tipo: z.enum(['NFE', 'DANFE', 'FATURA', 'OUTRO']),
  chaveAcesso: z.string().optional(),
  numero: z.string(),
  serie: z.string().optional(),
  emissao: z.string().optional(),
});

// Schema para totais
export const totaisSchema = z.object({
  valorProdutos: z.number().optional(),
  frete: z.number().optional(),
  descontos: z.number().optional(),
  impostos: z.number().optional(),
  valorTotal: z.number(),
});

// Schema para item
export const itemImportadoSchema = z.object({
  codigoFornecedor: z.string().optional(),
  descricao: z.string(),
  ncm: z.string().optional(),
  unidade: z.string(),
  quantidade: z.number().min(0.01),
  valorUnitario: z.number().optional(),
  valorTotal: z.number().optional(),
});

// Schema completo do documento
export const documentoImportadoSchema = z.object({
  fornecedor: fornecedorSchema,
  documento: documentoInfoSchema,
  totais: totaisSchema,
  itens: z.array(itemImportadoSchema).min(1),
  confidences: z.record(z.number()).optional(),
  moeda: z.literal('BRL'),
  origemArquivo: z.object({
    nome: z.string(),
    tipo: z.enum(['xml', 'pdf']),
  }),
});

export type DocumentoImportado = z.infer<typeof documentoImportadoSchema>;
export type ItemImportado = z.infer<typeof itemImportadoSchema>;

// Interface para item com matching
export interface ItemComMatching extends ItemImportado {
  id_temp: string;
  item_catalogo_id?: string;
  item_catalogo_nome?: string;
  score_matching?: number;
  aceito: boolean;
  criar_novo: boolean;
}

// Função para calcular similaridade entre strings (Levenshtein simplificado)
export function calcularSimilaridade(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
  if (s1 === s2) return 1.0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, ''); // Remove caracteres especiais
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Função para validar CNPJ
export function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
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
  return resultado === parseInt(digitos.charAt(1));
}

// Função para validar chave de acesso NF-e
export function validarChaveAcesso(chave: string): boolean {
  chave = chave.replace(/[^\d]/g, '');
  return chave.length === 44;
}

// Função para validar totais do documento
export function validarTotais(
  itens: ItemImportado[],
  totais: z.infer<typeof totaisSchema>,
  toleranciaPercentual: number = 1
): { valido: boolean; diferenca: number; percentual: number } {
  const somaItens = itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
  const diferenca = Math.abs(somaItens - totais.valorTotal);
  const percentual = (diferenca / totais.valorTotal) * 100;
  
  return {
    valido: percentual <= toleranciaPercentual,
    diferenca,
    percentual,
  };
}

// Função para ratear frete entre itens
export function ratearFrete(
  itens: ItemImportado[],
  valorFrete: number,
  metodo: 'valor' | 'quantidade' = 'valor'
): ItemImportado[] {
  if (valorFrete === 0 || itens.length === 0) return itens;
  
  const totalBase = itens.reduce((acc, item) => {
    if (metodo === 'valor') {
      return acc + (item.valorTotal || 0);
    } else {
      return acc + item.quantidade;
    }
  }, 0);
  
  if (totalBase === 0) return itens;
  
  return itens.map(item => {
    const base = metodo === 'valor' ? (item.valorTotal || 0) : item.quantidade;
    const freteRateado = (base / totalBase) * valorFrete;
    const valorUnitarioComFrete = ((item.valorTotal || 0) + freteRateado) / item.quantidade;
    
    return {
      ...item,
      valorUnitario: valorUnitarioComFrete,
    };
  });
}
