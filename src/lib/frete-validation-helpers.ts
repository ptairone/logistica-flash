import { FreteFormData } from './validations-frete';

export function validateClienteTab(data: Partial<FreteFormData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.cliente_nome?.trim()) errors.push('Nome do cliente é obrigatório');
  if (!data.cliente_cnpj_cpf?.trim()) errors.push('CPF/CNPJ é obrigatório');
  
  return { isValid: errors.length === 0, errors };
}

export function validateRotaTab(data: Partial<FreteFormData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.origem_cep?.trim()) errors.push('CEP de origem é obrigatório');
  if (!data.origem_cidade?.trim()) errors.push('Cidade de origem é obrigatória');
  if (!data.destino_cep?.trim()) errors.push('CEP de destino é obrigatório');
  if (!data.destino_cidade?.trim()) errors.push('Cidade de destino é obrigatória');
  
  return { isValid: errors.length === 0, errors };
}

export function validateVeiculoTab(data: Partial<FreteFormData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.tipo_carga?.trim()) errors.push('Tipo de carga é obrigatório');
  if (!data.numero_eixos) errors.push('Número de eixos é obrigatório');
  
  return { isValid: errors.length === 0, errors };
}

export function validateValoresTab(data: Partial<FreteFormData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.valor_frete || data.valor_frete <= 0) errors.push('Valor do frete é obrigatório');
  
  return { isValid: errors.length === 0, errors };
}

export function getTabCompleteness(data: Partial<FreteFormData>) {
  return {
    cliente: validateClienteTab(data).isValid ? 100 : 50,
    rota: validateRotaTab(data).isValid ? 100 : 50,
    veiculo: validateVeiculoTab(data).isValid ? 100 : 50,
    valores: validateValoresTab(data).isValid ? 100 : 50,
    extras: 100, // Sempre válida (campos opcionais)
  };
}
