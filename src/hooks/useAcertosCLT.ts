import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AcertoCLT, DiaTrabalhadoCLT, ConfigCLT } from "@/lib/validations-acerto-clt";

// Hook para buscar acertos CLT
export function useAcertosCLT() {
  const queryClient = useQueryClient();

  const { data: acertos, isLoading, error } = useQuery({
    queryKey: ["acertos-clt"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acertos_clt")
        .select(`
          *,
          motorista:motoristas(id, nome, cpf)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAcertoCLT = useMutation({
    mutationFn: async ({ acerto, dias }: { acerto: AcertoCLT; dias: DiaTrabalhadoCLT[] }) => {
      // Inserir acerto
      const { data: acertoData, error: acertoError } = await supabase
        .from("acertos_clt")
        .insert([acerto as any])
        .select()
        .single();

      if (acertoError) throw acertoError;

      // Inserir dias trabalhados
      if (dias.length > 0) {
        const diasComAcerto = dias.map(dia => ({
          acerto_clt_id: acertoData.id,
          data: dia.data,
          dia_semana: dia.dia_semana,
          horas_totais: dia.horas_totais,
          horas_normais: dia.horas_normais,
          horas_extras: dia.horas_extras,
          km_rodados: dia.km_rodados,
          horas_em_movimento: dia.horas_em_movimento,
          horas_parado_ligado: dia.horas_parado_ligado,
          horas_tempo_noturno: dia.horas_tempo_noturno,
          valor_diaria: dia.valor_diaria,
          valor_horas_extras: dia.valor_horas_extras,
          valor_adicional_fds: dia.valor_adicional_fds,
          valor_adicional_feriado: dia.valor_adicional_feriado,
          valor_adicional_noturno: dia.valor_adicional_noturno,
          valor_total_dia: dia.valor_total_dia,
          eh_feriado: dia.eh_feriado,
          nome_feriado: dia.nome_feriado,
          origem: dia.origem,
          dados_rastreador: dia.dados_rastreador,
        }));

        const { error: diasError } = await supabase
          .from("acertos_clt_dias")
          .insert(diasComAcerto);

        if (diasError) throw diasError;
      }

      return acertoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acertos-clt"] });
      toast.success("Acerto CLT criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar acerto CLT:", error);
      toast.error("Erro ao criar acerto CLT");
    },
  });

  const updateAcertoCLT = useMutation({
    mutationFn: async ({ id, acerto, dias }: { id: string; acerto: Partial<AcertoCLT>; dias?: DiaTrabalhadoCLT[] }) => {
      // Atualizar acerto
      const { error: acertoError } = await supabase
        .from("acertos_clt")
        .update(acerto)
        .eq("id", id);

      if (acertoError) throw acertoError;

      // Se houver dias, deletar os antigos e inserir novos
      if (dias && dias.length > 0) {
        const { error: deleteError } = await supabase
          .from("acertos_clt_dias")
          .delete()
          .eq("acerto_clt_id", id);

        if (deleteError) throw deleteError;

        const diasComAcerto = dias.map(dia => ({
          acerto_clt_id: id,
          data: dia.data,
          dia_semana: dia.dia_semana,
          horas_totais: dia.horas_totais,
          horas_normais: dia.horas_normais,
          horas_extras: dia.horas_extras,
          km_rodados: dia.km_rodados,
          horas_em_movimento: dia.horas_em_movimento,
          horas_parado_ligado: dia.horas_parado_ligado,
          horas_tempo_noturno: dia.horas_tempo_noturno,
          valor_diaria: dia.valor_diaria,
          valor_horas_extras: dia.valor_horas_extras,
          valor_adicional_fds: dia.valor_adicional_fds,
          valor_adicional_feriado: dia.valor_adicional_feriado,
          valor_adicional_noturno: dia.valor_adicional_noturno,
          valor_total_dia: dia.valor_total_dia,
          eh_feriado: dia.eh_feriado,
          nome_feriado: dia.nome_feriado,
          origem: dia.origem,
          dados_rastreador: dia.dados_rastreador,
        }));

        const { error: diasError } = await supabase
          .from("acertos_clt_dias")
          .insert(diasComAcerto);

        if (diasError) throw diasError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acertos-clt"] });
      toast.success("Acerto CLT atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar acerto CLT:", error);
      toast.error("Erro ao atualizar acerto CLT");
    },
  });

  const deleteAcertoCLT = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("acertos_clt")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acertos-clt"] });
      toast.success("Acerto CLT excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir acerto CLT:", error);
      toast.error("Erro ao excluir acerto CLT");
    },
  });

  return {
    acertos,
    isLoading,
    error,
    createAcertoCLT,
    updateAcertoCLT,
    deleteAcertoCLT,
  };
}

// Hook para buscar dias de um acerto CLT
export function useDiasAcertoCLT(acertoCltId: string | null) {
  return useQuery({
    queryKey: ["acertos-clt-dias", acertoCltId],
    queryFn: async () => {
      if (!acertoCltId) return [];

      const { data, error } = await supabase
        .from("acertos_clt_dias")
        .select("*")
        .eq("acerto_clt_id", acertoCltId)
        .order("data", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!acertoCltId,
  });
}

// Hook para buscar configuração CLT do motorista
export function useConfigCLT(motoristaId: string | null) {
  return useQuery({
    queryKey: ["config-clt", motoristaId],
    queryFn: async () => {
      if (!motoristaId) return null;

      const { data, error } = await supabase
        .from("motoristas_config_clt")
        .select("*")
        .eq("motorista_id", motoristaId)
        .eq("ativo", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!motoristaId,
  });
}

// Hook para salvar configuração CLT
export function useSaveConfigCLT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ConfigCLT) => {
      const { data, error } = await supabase
        .from("motoristas_config_clt")
        .upsert([config as any], {
          onConflict: "motorista_id",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["config-clt", variables.motorista_id] });
      toast.success("Configuração CLT salva com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar configuração CLT:", error);
      toast.error("Erro ao salvar configuração CLT");
    },
  });
}

// Hook para processar relatório de rastreador
export function useProcessarRelatorio() {
  return useMutation({
    mutationFn: async ({ imagens, fileName }: { imagens: string[], fileName: string }) => {
      const { data, error } = await supabase.functions.invoke('processar-relatorio-rastreador', {
        body: { 
          imagens,
          fileName
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro ao processar relatório');

      return data.dados;
    },
    onError: (error) => {
      console.error("Erro ao processar relatório:", error);
      toast.error("Erro ao processar relatório: " + error.message);
    },
  });
}

// Função auxiliar para calcular acerto CLT
export function calcularAcertoCLT(
  config: ConfigCLT,
  dias: DiaTrabalhadoCLT[]
): {
  salario_base: number;
  total_diarias: number;
  total_horas_extras: number;
  total_horas_fds: number;
  valor_horas_fds: number;
  total_horas_feriados: number;
  valor_horas_feriados: number;
  total_horas_noturnas: number;
  valor_adicional_noturno: number;
  total_km_rodados: number;
  total_bruto: number;
  total_liquido: number;
  dias_trabalhados: number;
} {
  let totalDiarias = 0;
  let totalHorasExtras = 0;
  let totalValorHE = 0;
  let totalHorasFds = 0;
  let totalValorFds = 0;
  let totalHorasFeriados = 0;
  let totalValorFeriados = 0;
  let totalHorasNoturnas = 0;
  let totalValorNoturno = 0;
  let totalKmRodados = 0;

  dias.forEach(dia => {
    const isFimDeSemana = dia.dia_semana === 0 || dia.dia_semana === 6; // Domingo ou Sábado
    const horasTrabalhadas = dia.horas_totais;

    // 1. Diária se trabalhou
    if (horasTrabalhadas > 0) {
      totalDiarias += config.valor_diaria;
    }

    // 2. Horas extras (acima de 8h/dia)
    if (dia.horas_extras > 0) {
      totalHorasExtras += dia.horas_extras;
      totalValorHE += dia.horas_extras * config.valor_hora_extra;
    }

    // 3. Fim de semana (R$ por hora trabalhada)
    if (isFimDeSemana && horasTrabalhadas > 0) {
      totalHorasFds += horasTrabalhadas;
      totalValorFds += horasTrabalhadas * config.valor_hora_fds;
    }

    // 4. Feriados (R$ por hora trabalhada)
    if (dia.eh_feriado && horasTrabalhadas > 0) {
      totalHorasFeriados += horasTrabalhadas;
      totalValorFeriados += horasTrabalhadas * config.valor_hora_feriado;
    }

    // 5. Adicional noturno (20% sobre valor da hora normal)
    if (dia.horas_tempo_noturno && dia.horas_tempo_noturno > 0) {
      totalHorasNoturnas += dia.horas_tempo_noturno;
      const valorHoraNormal = config.salario_base / 220; // 220 horas/mês
      totalValorNoturno += dia.horas_tempo_noturno * valorHoraNormal * 0.2; // 20% adicional
    }

    // 6. Total de Km rodados
    if (dia.km_rodados) {
      totalKmRodados += dia.km_rodados;
    }
  });

  const salarioBase = config.salario_base;
  const totalBruto = salarioBase + totalDiarias + totalValorHE + totalValorFds + totalValorFeriados + totalValorNoturno;
  const totalLiquido = totalBruto; // Por enquanto sem descontos

  return {
    salario_base: salarioBase,
    total_diarias: totalDiarias,
    total_horas_extras: totalHorasExtras,
    total_horas_fds: totalHorasFds,
    valor_horas_fds: totalValorFds,
    total_horas_feriados: totalHorasFeriados,
    valor_horas_feriados: totalValorFeriados,
    total_horas_noturnas: totalHorasNoturnas,
    valor_adicional_noturno: totalValorNoturno,
    total_km_rodados: totalKmRodados,
    total_bruto: totalBruto,
    total_liquido: totalLiquido,
    dias_trabalhados: dias.length,
  };
}
