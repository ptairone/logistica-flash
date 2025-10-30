export interface DadosConsumoEixos {
  numero_eixos: number;
  tipo_veiculo: string;
  pbtc_toneladas: number;
  consumo_carregado_km_l: number;
  consumo_vazio_km_l: number;
}

export const TABELA_CONSUMO_EIXOS: DadosConsumoEixos[] = [
  { numero_eixos: 2, tipo_veiculo: 'Toco 4x2', pbtc_toneladas: 16, consumo_carregado_km_l: 3.5, consumo_vazio_km_l: 4.5 },
  { numero_eixos: 3, tipo_veiculo: 'Truck 6x2', pbtc_toneladas: 23, consumo_carregado_km_l: 2.8, consumo_vazio_km_l: 3.8 },
  { numero_eixos: 4, tipo_veiculo: 'Cavalo simples + carreta 2 eixos', pbtc_toneladas: 35, consumo_carregado_km_l: 2.3, consumo_vazio_km_l: 3.0 },
  { numero_eixos: 5, tipo_veiculo: 'Cavalo simples + carreta LS (3 eixos)', pbtc_toneladas: 45, consumo_carregado_km_l: 2.0, consumo_vazio_km_l: 2.8 },
  { numero_eixos: 6, tipo_veiculo: 'Cavalo trucado + carreta LS reforçada', pbtc_toneladas: 53, consumo_carregado_km_l: 1.8, consumo_vazio_km_l: 2.6 },
  { numero_eixos: 7, tipo_veiculo: 'Bitrem (6x4 + 2 semis)', pbtc_toneladas: 57, consumo_carregado_km_l: 1.5, consumo_vazio_km_l: 2.2 },
  { numero_eixos: 9, tipo_veiculo: 'Rodotrem (6x4 + dolly + 2 semis)', pbtc_toneladas: 74, consumo_carregado_km_l: 1.3, consumo_vazio_km_l: 1.9 },
];

export function obterConsumoVeiculo(numero_eixos: number, retorno_vazio: boolean = false): number {
  const dados = TABELA_CONSUMO_EIXOS.find(d => d.numero_eixos === numero_eixos);
  
  if (!dados) {
    // Fallback: média geral se não encontrar
    console.warn(`Número de eixos ${numero_eixos} não encontrado na tabela. Usando média geral.`);
    return retorno_vazio ? 3.0 : 2.2;
  }
  
  return retorno_vazio ? dados.consumo_vazio_km_l : dados.consumo_carregado_km_l;
}

export function calcularCombustivelEstimado(
  distancia_km: number, 
  numero_eixos: number, 
  retorno_vazio: boolean,
  preco_litro_diesel: number = 6.50
): {
  consumo_km_l: number;
  litros_estimados: number;
  custo_estimado: number;
} {
  const consumo = obterConsumoVeiculo(numero_eixos, retorno_vazio);
  const litros = distancia_km / consumo;
  const custo = litros * preco_litro_diesel;
  
  return {
    consumo_km_l: consumo,
    litros_estimados: Math.round(litros * 10) / 10,
    custo_estimado: Math.round(custo * 100) / 100,
  };
}
