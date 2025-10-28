import { z } from "zod";

export const abastecimentoSchema = z.object({
  veiculo_id: z.string().uuid("ID do veículo inválido"),
  viagem_id: z.string().uuid("ID da viagem inválido").optional().nullable(),
  motorista_id: z.string().uuid("ID do motorista inválido").optional().nullable(),
  km_veiculo: z.number({
    required_error: "KM do veículo é obrigatório",
    invalid_type_error: "KM deve ser um número",
  }).positive("KM deve ser positivo"),
  litros: z.number({
    required_error: "Quantidade de litros é obrigatória",
    invalid_type_error: "Litros deve ser um número",
  }).positive("Litros deve ser positivo").min(1, "Mínimo 1 litro"),
  valor_total: z.number({
    required_error: "Valor total é obrigatório",
    invalid_type_error: "Valor deve ser um número",
  }).positive("Valor deve ser positivo"),
  posto_nome: z.string().optional().nullable(),
  posto_cidade: z.string().optional().nullable(),
  posto_uf: z.string().max(2).optional().nullable(),
  data_abastecimento: z.string().datetime("Data inválida"),
  comprovante_url: z.string().url("URL inválida").optional().nullable(),
  observacoes: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  localizacao_timestamp: z.string().datetime().optional().nullable(),
}).refine(
  (data) => data.litros <= 1000,
  {
    message: "Quantidade de litros muito alta (máximo 1000L)",
    path: ["litros"],
  }
).refine(
  (data) => {
    const valorPorLitro = data.valor_total / data.litros;
    return valorPorLitro >= 3 && valorPorLitro <= 15;
  },
  {
    message: "Valor por litro fora da faixa esperada (R$ 3,00 - R$ 15,00)",
    path: ["valor_total"],
  }
);

export type AbastecimentoFormData = z.infer<typeof abastecimentoSchema>;

export interface AbastecimentoDadosExtraidos {
  km_veiculo: number | null;
  litros: number | null;
  valor_total: number | null;
  posto_nome: string | null;
  posto_cidade: string | null;
  posto_uf: string | null;
  data_abastecimento: string | null;
}
