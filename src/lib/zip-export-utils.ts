import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';

// Baixar imagem como Blob
async function baixarImagemComoBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao baixar imagem');
  return await response.blob();
}

// Obter URL pública do Supabase Storage
function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from('comprovantes').getPublicUrl(path);
  return data.publicUrl;
}

// Gerar nome de arquivo para comprovante
function nomeArquivoComprovante(
  tipo: string,
  index: number,
  descricao: string,
  extensao: string
): string {
  const tipoFormatado = tipo.toUpperCase().replace(/_/g, '-');
  const numero = String(index + 1).padStart(3, '0');
  const descricaoLimpa = descricao
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  
  return `${tipoFormatado}-${numero}-${descricaoLimpa}.${extensao}`;
}

// Extrair extensão do arquivo
function getExtensaoArquivo(mimeType: string, nomeOriginal: string): string {
  if (nomeOriginal) {
    const match = nomeOriginal.match(/\.([^.]+)$/);
    if (match) return match[1];
  }
  
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  
  return mimeMap[mimeType] || 'bin';
}

// Exportar viagem com comprovantes (CSV + ZIP)
export async function exportarViagemComComprovantes(
  viagem: any,
  despesas: any[],
  transacoes: any[],
  comprovantes: any[],
  onProgress?: (current: number, total: number, message: string) => void
) {
  const zip = new JSZip();

  // Gerar CSV com dados da viagem
  const csvHeaders = [
    'Tipo',
    'Data',
    'Descrição',
    'Categoria',
    'Valor (R$)',
    'Forma Pagamento',
    'Reembolsável',
    'Comprovante',
  ];

  const csvRows: string[][] = [];

  // Adicionar informações da viagem
  csvRows.push([
    'INFORMAÇÃO',
    '',
    `Código: ${viagem.codigo}`,
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push([
    'INFORMAÇÃO',
    '',
    `Origem: ${viagem.origem}`,
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push([
    'INFORMAÇÃO',
    '',
    `Destino: ${viagem.destino}`,
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push([
    'INFORMAÇÃO',
    '',
    `Motorista: ${viagem.motorista?.nome || 'N/A'}`,
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push([
    'INFORMAÇÃO',
    '',
    `Veículo: ${viagem.veiculo?.placa || 'N/A'}`,
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push(['', '', '', '', '', '', '', '']); // Linha vazia

  // Adicionar despesas
  despesas.forEach((despesa, index) => {
    const comprovante = comprovantes.find(
      (c) => c.tipo_documento === 'despesa' && c.nome.includes(despesa.tipo)
    );
    
    csvRows.push([
      'DESPESA',
      new Date(despesa.data).toLocaleDateString('pt-BR'),
      despesa.descricao || '-',
      despesa.tipo,
      Number(despesa.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      '-',
      despesa.reembolsavel ? 'Sim' : 'Não',
      comprovante ? comprovante.nome : '',
    ]);
  });

  // Adicionar transações
  transacoes.forEach((transacao, index) => {
    const tipoLabel = transacao.tipo === 'adiantamento' ? 'ADIANTAMENTO' : 'RECEBIMENTO';
    const comprovante = comprovantes.find(
      (c) => c.tipo_documento === transacao.tipo
    );

    csvRows.push([
      tipoLabel,
      new Date(transacao.data).toLocaleDateString('pt-BR'),
      transacao.descricao || '-',
      '-',
      Number(transacao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      transacao.forma_pagamento || '-',
      '-',
      comprovante ? comprovante.nome : '',
    ]);
  });

  // Adicionar totais
  const totalDespesas = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const totalAdiantamentos = transacoes
    .filter((t) => t.tipo === 'adiantamento')
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const totalRecebimentos = transacoes
    .filter((t) => t.tipo === 'recebimento_frete')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  csvRows.push(['', '', '', '', '', '', '', '']); // Linha vazia
  csvRows.push([
    'TOTAL',
    '',
    'Total Despesas',
    '',
    totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    '',
    '',
    '',
  ]);
  csvRows.push([
    'TOTAL',
    '',
    'Total Adiantamentos',
    '',
    totalAdiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    '',
    '',
    '',
  ]);
  csvRows.push([
    'TOTAL',
    '',
    'Total Recebimentos',
    '',
    totalRecebimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    '',
    '',
    '',
  ]);

  const csvContent = [csvHeaders.join(';'), ...csvRows.map((row) => row.join(';'))].join('\n');
  zip.file('dados.csv', csvContent);

  // Adicionar comprovantes
  const comprovantesFolder = zip.folder('comprovantes');
  if (comprovantesFolder && comprovantes.length > 0) {
    for (let i = 0; i < comprovantes.length; i++) {
      const comprovante = comprovantes[i];
      
      if (onProgress) {
        onProgress(i + 1, comprovantes.length, `Baixando comprovante ${i + 1} de ${comprovantes.length}...`);
      }

      try {
        const url = getPublicUrl(comprovante.url);
        const blob = await baixarImagemComoBlob(url);
        const extensao = getExtensaoArquivo(comprovante.mime_type, comprovante.nome);
        
        let tipoDoc = comprovante.tipo_documento || 'documento';
        let descricao = comprovante.nome.replace(/\.[^/.]+$/, ''); // Remove extensão
        
        const nomeArquivo = nomeArquivoComprovante(tipoDoc, i, descricao, extensao);
        comprovantesFolder.file(nomeArquivo, blob);
      } catch (error) {
        console.error(`Erro ao baixar comprovante ${comprovante.nome}:`, error);
      }
    }
  }

  // Gerar e baixar ZIP
  if (onProgress) {
    onProgress(comprovantes.length, comprovantes.length, 'Gerando arquivo ZIP...');
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `viagem_${viagem.codigo}_${new Date().toISOString().split('T')[0]}.zip`);
}

// Exportar acerto com comprovantes (CSV + ZIP)
export async function exportarAcertoComComprovantes(
  acerto: any,
  viagens: any[],
  comprovantes: any[],
  onProgress?: (current: number, total: number, message: string) => void
) {
  const zip = new JSZip();

  // Gerar CSV com dados do acerto
  const csvHeaders = [
    'Código Viagem',
    'Origem',
    'Destino',
    'Data Saída',
    'Frete (R$)',
    'Despesas Reembolsáveis (R$)',
    'Despesas Não Reembolsáveis (R$)',
  ];

  const csvRows: string[][] = [];

  // Cabeçalho do acerto
  csvRows.push([
    `Acerto: ${acerto.codigo}`,
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push([
    `Motorista: ${acerto.motorista?.nome}`,
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push([
    `Período: ${new Date(acerto.periodo_inicio).toLocaleDateString('pt-BR')} até ${new Date(acerto.periodo_fim).toLocaleDateString('pt-BR')}`,
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push(['', '', '', '', '', '', '']); // Linha vazia

  // Dados das viagens
  viagens.forEach((viagem) => {
    const despesasReemb =
      viagem.despesas
        ?.filter((d: any) => d.reembolsavel)
        .reduce((sum: number, d: any) => sum + d.valor, 0) || 0;
    const despesasNaoReemb =
      viagem.despesas
        ?.filter((d: any) => !d.reembolsavel)
        .reduce((sum: number, d: any) => sum + d.valor, 0) || 0;

    csvRows.push([
      viagem.codigo,
      viagem.origem,
      viagem.destino,
      new Date(viagem.data_saida).toLocaleDateString('pt-BR'),
      Number(viagem.frete?.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      despesasReemb.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      despesasNaoReemb.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    ]);
  });

  // Totais
  csvRows.push(['', '', '', '', '', '', '']); // Linha vazia
  csvRows.push([
    'RESUMO FINANCEIRO',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  csvRows.push([
    'Base de Comissão',
    '',
    '',
    '',
    Number(acerto.base_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    '',
    '',
  ]);
  csvRows.push([
    `Comissão (${acerto.percentual_comissao}%)`,
    '',
    '',
    '',
    Number(acerto.valor_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    '',
    '',
  ]);
  csvRows.push([
    'Reembolsos',
    '',
    '',
    '',
    Number(acerto.total_reembolsos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    '',
    '',
  ]);
  csvRows.push([
    'Adiantamentos',
    '',
    '',
    '',
    `- ${Number(acerto.total_adiantamentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    '',
    '',
  ]);
  csvRows.push([
    'Descontos',
    '',
    '',
    '',
    `- ${Number(acerto.total_descontos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    '',
    '',
  ]);
  csvRows.push([
    'TOTAL A PAGAR',
    '',
    '',
    '',
    Number(acerto.total_pagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    '',
    '',
  ]);

  const csvContent = [csvHeaders.join(';'), ...csvRows.map((row) => row.join(';'))].join('\n');
  zip.file('acerto.csv', csvContent);

  // Adicionar comprovantes organizados por viagem
  const comprovantesFolder = zip.folder('comprovantes');
  if (comprovantesFolder && comprovantes.length > 0) {
    for (let i = 0; i < comprovantes.length; i++) {
      const comprovante = comprovantes[i];
      
      if (onProgress) {
        onProgress(i + 1, comprovantes.length, `Baixando comprovante ${i + 1} de ${comprovantes.length}...`);
      }

      try {
        const url = getPublicUrl(comprovante.url);
        const blob = await baixarImagemComoBlob(url);
        const extensao = getExtensaoArquivo(comprovante.mime_type, comprovante.nome);
        
        // Encontrar viagem relacionada
        const viagemRelacionada = viagens.find((v) => v.id === comprovante.entidade_id);
        const prefixoViagem = viagemRelacionada ? `${viagemRelacionada.codigo}_` : '';
        
        let tipoDoc = comprovante.tipo_documento || 'documento';
        let descricao = comprovante.nome.replace(/\.[^/.]+$/, '');
        
        const nomeArquivo = `${prefixoViagem}${nomeArquivoComprovante(tipoDoc, i, descricao, extensao)}`;
        comprovantesFolder.file(nomeArquivo, blob);
      } catch (error) {
        console.error(`Erro ao baixar comprovante ${comprovante.nome}:`, error);
      }
    }
  }

  // Gerar e baixar ZIP
  if (onProgress) {
    onProgress(comprovantes.length, comprovantes.length, 'Gerando arquivo ZIP...');
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `acerto_${acerto.codigo}_${new Date().toISOString().split('T')[0]}.zip`);
}
