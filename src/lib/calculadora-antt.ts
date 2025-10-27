// Calculadora de Piso Mínimo ANTT - Resolução 6.067/2025
// Fonte: https://www.gov.br/antt/pt-br/assuntos/cargas/piso-minimo-de-frete

// Tipos de carga conforme tabela ANTT
export const TIPOS_CARGA = [
  { value: 'granel_solido', label: 'Granel Sólido' },
  { value: 'granel_liquido', label: 'Granel Líquido - Carga Química e Derivados de Petróleo (exceto combustível)' },
  { value: 'frigorificada', label: 'Frigorificada' },
  { value: 'conteinerizada', label: 'Conteinerizada' },
  { value: 'geral', label: 'Carga Geral' },
  { value: 'neogranel', label: 'Neogranel' },
  { value: 'perigosa_1', label: 'Perigosa - Granel Sólido' },
  { value: 'perigosa_2', label: 'Perigosa - Granel Líquido Combustível' },
  { value: 'perigosa_3', label: 'Perigosa - Granel Líquido Inflamável' },
  { value: 'perigosa_4', label: 'Perigosa - Frigorificada' },
  { value: 'perigosa_5', label: 'Perigosa - Carga Geral e Neogranel' },
  { value: 'viva', label: 'Viva' },
];

// Tabela de coeficientes por tipo de carga e número de eixos
// Valores baseados na Resolução ANTT 6.067/2025
export const COEFICIENTES_ANTT: Record<string, Record<number, number>> = {
  granel_solido: {
    2: 1.8215,
    3: 2.0893,
    4: 2.2232,
    5: 2.3571,
    6: 2.4910,
    7: 2.6249,
    9: 2.8927,
  },
  granel_liquido: {
    2: 2.0893,
    3: 2.3571,
    4: 2.4910,
    5: 2.6249,
    6: 2.7588,
    7: 2.8927,
    9: 3.1605,
  },
  frigorificada: {
    2: 2.4910,
    3: 2.7588,
    4: 2.8927,
    5: 3.0266,
    6: 3.1605,
    7: 3.2944,
    9: 3.5622,
  },
  conteinerizada: {
    2: 1.9554,
    3: 2.2232,
    4: 2.3571,
    5: 2.4910,
    6: 2.6249,
    7: 2.7588,
    9: 3.0266,
  },
  geral: {
    2: 2.0893,
    3: 2.3571,
    4: 2.4910,
    5: 2.6249,
    6: 2.7588,
    7: 2.8927,
    9: 3.1605,
  },
  neogranel: {
    2: 2.0893,
    3: 2.3571,
    4: 2.4910,
    5: 2.6249,
    6: 2.7588,
    7: 2.8927,
    9: 3.1605,
  },
  perigosa_1: {
    2: 2.3571,
    3: 2.6249,
    4: 2.7588,
    5: 2.8927,
    6: 3.0266,
    7: 3.1605,
    9: 3.4283,
  },
  perigosa_2: {
    2: 2.6249,
    3: 2.8927,
    4: 3.0266,
    5: 3.1605,
    6: 3.2944,
    7: 3.4283,
    9: 3.6961,
  },
  perigosa_3: {
    2: 2.8927,
    3: 3.1605,
    4: 3.2944,
    5: 3.4283,
    6: 3.5622,
    7: 3.6961,
    9: 3.9639,
  },
  perigosa_4: {
    2: 3.0266,
    3: 3.2944,
    4: 3.4283,
    5: 3.5622,
    6: 3.6961,
    7: 3.8300,
    9: 4.0978,
  },
  perigosa_5: {
    2: 2.6249,
    3: 2.8927,
    4: 3.0266,
    5: 3.1605,
    6: 3.2944,
    7: 3.4283,
    9: 3.6961,
  },
  viva: {
    2: 2.3571,
    3: 2.6249,
    4: 2.7588,
    5: 2.8927,
    6: 3.0266,
    7: 3.1605,
    9: 3.4283,
  },
};

// Acréscimos conforme características do veículo
export const ACRESCIMOS = {
  composicao_veicular: 1.15, // +15%
  alto_desempenho: 1.10, // +10%
  retorno_vazio: 1.20, // +20%
};

// Valor base por quilômetro (R$/km) - atualizado conforme ANTT
export const VALOR_BASE_KM = 2.01;

export interface ParametrosCalculoANTT {
  tipo_carga: string;
  numero_eixos: number;
  distancia_km: number;
  composicao_veicular: boolean;
  alto_desempenho: boolean;
  retorno_vazio: boolean;
}

export interface ResultadoCalculoANTT {
  valor_base: number;
  valor_com_acrescimos: number;
  detalhamento: {
    tipo_carga_label: string;
    coeficiente: number;
    distancia_km: number;
    valor_km: number;
    acrescimos_aplicados: {
      composicao_veicular: boolean;
      alto_desempenho: boolean;
      retorno_vazio: boolean;
    };
    percentual_acrescimo: number;
  };
}

/**
 * Calcula o piso mínimo de frete conforme tabela ANTT
 */
export function calcularPisoMinimoANTT(params: ParametrosCalculoANTT): ResultadoCalculoANTT {
  const {
    tipo_carga,
    numero_eixos,
    distancia_km,
    composicao_veicular,
    alto_desempenho,
    retorno_vazio,
  } = params;

  // Obter coeficiente da tabela
  const coeficiente = COEFICIENTES_ANTT[tipo_carga]?.[numero_eixos];
  
  if (!coeficiente) {
    throw new Error('Tipo de carga ou número de eixos inválido');
  }

  // Cálculo base: Coeficiente × Valor Base/km × Distância
  const valor_base = coeficiente * VALOR_BASE_KM * distancia_km;

  // Aplicar acréscimos
  let multiplicador_total = 1;
  
  if (composicao_veicular) {
    multiplicador_total *= ACRESCIMOS.composicao_veicular;
  }
  
  if (alto_desempenho) {
    multiplicador_total *= ACRESCIMOS.alto_desempenho;
  }
  
  if (retorno_vazio) {
    multiplicador_total *= ACRESCIMOS.retorno_vazio;
  }

  const valor_com_acrescimos = valor_base * multiplicador_total;

  // Obter label do tipo de carga
  const tipo_carga_obj = TIPOS_CARGA.find(tc => tc.value === tipo_carga);

  return {
    valor_base,
    valor_com_acrescimos,
    detalhamento: {
      tipo_carga_label: tipo_carga_obj?.label || tipo_carga,
      coeficiente,
      distancia_km,
      valor_km: VALOR_BASE_KM,
      acrescimos_aplicados: {
        composicao_veicular,
        alto_desempenho,
        retorno_vazio,
      },
      percentual_acrescimo: ((multiplicador_total - 1) * 100),
    },
  };
}

/**
 * Formata valor monetário para exibição
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}
