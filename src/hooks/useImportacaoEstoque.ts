import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentoImportado, ItemComMatching, calcularSimilaridade, ratearFrete } from '@/lib/validations-importacao';

export function useImportacaoEstoque() {
  const { toast } = useToast();
  const [documentoProcessado, setDocumentoProcessado] = useState<DocumentoImportado | null>(null);
  const [itensComMatching, setItensComMatching] = useState<ItemComMatching[]>([]);

  // Processar arquivo
  const processarArquivo = useMutation({
    mutationFn: async ({ file, fileName, fileType }: { 
      file: string; 
      fileName: string; 
      fileType: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('processar-documento-estoque', {
        body: { file, fileName, fileType }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.data as DocumentoImportado;
    },
    onSuccess: async (data) => {
      setDocumentoProcessado(data);
      
      // Fazer matching dos itens
      await realizarMatching(data);
      
      toast({
        title: 'Documento processado',
        description: `${data.itens.length} itens extraídos com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao processar documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Buscar itens do catálogo para matching
  const realizarMatching = async (documento: DocumentoImportado) => {
    const { data: itensCatalogo, error } = await supabase
      .from('itens_estoque')
      .select('id, codigo, descricao, unidade');

    if (error) {
      console.error('Erro ao buscar catálogo:', error);
      return;
    }

    const itensProcessados: ItemComMatching[] = documento.itens.map((item, index) => {
      let melhorMatch: any = null;
      let melhorScore = 0;

      // Tentar match por código
      if (item.codigoFornecedor) {
        const matchCodigo = itensCatalogo?.find(
          (cat) => cat.codigo === item.codigoFornecedor
        );
        if (matchCodigo) {
          melhorMatch = matchCodigo;
          melhorScore = 1.0;
        }
      }

      // Se não encontrou por código, tentar por descrição
      if (!melhorMatch && itensCatalogo) {
        for (const itemCat of itensCatalogo) {
          const score = calcularSimilaridade(item.descricao, itemCat.descricao);
          if (score > melhorScore) {
            melhorScore = score;
            melhorMatch = itemCat;
          }
        }
      }

      // Aplicar frete se houver
      const freteRateado = documento.totais.frete || 0;
      const itensComFrete = freteRateado > 0 
        ? ratearFrete(documento.itens, freteRateado, 'valor')
        : documento.itens;

      const itemComFrete = itensComFrete[index];

      return {
        ...itemComFrete,
        id_temp: `temp_${index}`,
        item_catalogo_id: melhorMatch?.id,
        item_catalogo_nome: melhorMatch?.descricao,
        score_matching: melhorScore,
        aceito: melhorScore >= 0.85,
        criar_novo: melhorScore < 0.85,
      };
    });

    setItensComMatching(itensProcessados);
  };

  // Confirmar entrada
  const confirmarEntrada = useMutation({
    mutationFn: async (itens: ItemComMatching[]) => {
      const itensAceitos = itens.filter(item => item.aceito);
      
      if (itensAceitos.length === 0) {
        throw new Error('Nenhum item aceito para entrada');
      }

      // Criar itens novos no catálogo se necessário
      const itensNovos = itensAceitos.filter(item => item.criar_novo);
      const novosIds: Record<string, string> = {};

      for (const item of itensNovos) {
        const { data: novoItem, error } = await supabase
          .from('itens_estoque')
          .insert([{
            codigo: item.codigoFornecedor || `AUTO_${Date.now()}`,
            descricao: item.descricao,
            categoria: 'outros',
            unidade: item.unidade,
            estoque_atual: 0,
            estoque_minimo: 0,
            custo_medio: item.valorUnitario || 0,
          }])
          .select()
          .single();

        if (error) throw error;
        novosIds[item.id_temp] = novoItem.id;
      }

      // Criar movimentações de entrada
      const movimentacoes = itensAceitos.map(item => ({
        item_id: item.criar_novo ? novosIds[item.id_temp] : item.item_catalogo_id,
        tipo: 'entrada' as const,
        quantidade: item.quantidade,
        custo_unitario: item.valorUnitario || 0,
        motivo: `Entrada via ${documentoProcessado?.origemArquivo.tipo.toUpperCase()} - NF ${documentoProcessado?.documento.numero}`,
      }));

      // Inserir movimentações (o trigger do banco atualiza o estoque)
      for (const mov of movimentacoes) {
        const { data: auth } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('movimentacoes_estoque')
          .insert([{
            ...mov,
            usuario_id: auth.user?.id,
            data: new Date().toISOString(),
          }]);

        if (error) throw error;

        // Atualizar estoque e custo médio manualmente
        const { data: itemAtual, error: fetchError } = await supabase
          .from('itens_estoque')
          .select('*')
          .eq('id', mov.item_id)
          .single();

        if (fetchError) throw fetchError;

        const novoEstoque = itemAtual.estoque_atual + mov.quantidade;
        const novoCusto = 
          (itemAtual.estoque_atual * itemAtual.custo_medio + mov.quantidade * mov.custo_unitario) /
          novoEstoque;

        const { error: updateError } = await supabase
          .from('itens_estoque')
          .update({
            estoque_atual: novoEstoque,
            custo_medio: novoCusto,
          })
          .eq('id', mov.item_id);

        if (updateError) throw updateError;
      }

      return { itensNovos: itensNovos.length, movimentacoes: movimentacoes.length };
    },
    onSuccess: (result) => {
      toast({
        title: 'Entrada confirmada',
        description: `${result.movimentacoes} movimentações criadas. ${result.itensNovos} novos itens adicionados ao catálogo.`,
      });
      
      // Limpar estado
      setDocumentoProcessado(null);
      setItensComMatching([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao confirmar entrada',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    documentoProcessado,
    itensComMatching,
    setItensComMatching,
    processarArquivo,
    confirmarEntrada,
    isProcessing: processarArquivo.isPending,
    isConfirming: confirmarEntrada.isPending,
  };
}
