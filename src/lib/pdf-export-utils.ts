import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

// Converter imagem para data URL
async function imagemParaDataURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha ao baixar imagem');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao converter imagem:', error);
    return '';
  }
}

// Obter URL pública do Supabase Storage
function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from('comprovantes').getPublicUrl(path);
  return data.publicUrl;
}

// Adicionar cabeçalho padronizado
function adicionarCabecalhoPDF(doc: jsPDF, titulo: string, subtitulo: string) {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitulo, 105, 28, { align: 'center' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 32, 190, 32);
  
  return 40; // Retorna posição Y após o cabeçalho
}

// Adicionar rodapé com número de página
function adicionarRodape(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Página ${pageNumber} de ${totalPages} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
}

// Gerar PDF de uma viagem
export async function gerarPDFViagem(
  viagem: any,
  despesas: any[],
  transacoes: any[],
  comprovantes: any[]
) {
  const doc = new jsPDF();
  let yPos = adicionarCabecalhoPDF(
    doc,
    `Relatório de Viagem - ${viagem.codigo}`,
    `${viagem.origem} → ${viagem.destino}`
  );

  // Informações da Viagem
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações da Viagem', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const infoViagem = [
    `Motorista: ${viagem.motorista?.nome || 'N/A'}`,
    `Veículo: ${viagem.veiculo?.placa || 'N/A'} - ${viagem.veiculo?.modelo || 'N/A'}`,
    `Saída: ${viagem.data_saida ? new Date(viagem.data_saida).toLocaleString('pt-BR') : 'N/A'}`,
    `Chegada: ${viagem.data_chegada ? new Date(viagem.data_chegada).toLocaleString('pt-BR') : 'N/A'}`,
    `KM Percorrido: ${viagem.km_percorrido || 'N/A'}`,
    `Status: ${viagem.status}`,
  ];

  infoViagem.forEach((info) => {
    doc.text(info, 20, yPos);
    yPos += 5;
  });

  yPos += 5;

  // Resumo Financeiro
  const totalDespesas = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const totalAdiantamentos = transacoes
    .filter((t) => t.tipo === 'adiantamento')
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const totalRecebimentos = transacoes
    .filter((t) => t.tipo === 'recebimento_frete')
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const valorFrete = viagem.frete?.valor_frete || 0;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const resumoFinanceiro = [
    `Valor do Frete: R$ ${Number(valorFrete).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Total Despesas: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Total Adiantamentos: R$ ${totalAdiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Total Recebimentos: R$ ${totalRecebimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ];

  resumoFinanceiro.forEach((info) => {
    doc.text(info, 20, yPos);
    yPos += 5;
  });

  yPos += 10;

  // Tabela de Despesas
  if (despesas.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Despesas Detalhadas', 20, yPos);
    yPos += 5;

    const despesasData = despesas.map((d) => [
      new Date(d.data).toLocaleDateString('pt-BR'),
      d.tipo,
      d.descricao || '-',
      d.reembolsavel ? 'Sim' : 'Não',
      `R$ ${Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Tipo', 'Descrição', 'Reembolsável', 'Valor']],
      body: despesasData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Tabela de Transações
  if (transacoes.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transações Financeiras', 20, yPos);
    yPos += 5;

    const transacoesData = transacoes.map((t) => [
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.tipo === 'adiantamento' ? 'Adiantamento' : 'Recebimento Frete',
      t.forma_pagamento || '-',
      t.descricao || '-',
      `R$ ${Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Tipo', 'Forma Pagamento', 'Descrição', 'Valor']],
      body: transacoesData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Comprovantes
  if (comprovantes.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprovantes Anexados', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    for (const comprovante of comprovantes) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(`${comprovante.nome} (${comprovante.tipo_documento || 'Documento'})`, 20, yPos);
      yPos += 5;

      // Adicionar imagem do comprovante se for uma imagem
      if (comprovante.mime_type?.startsWith('image/')) {
        try {
          const dataUrl = await imagemParaDataURL(comprovante.url);
          if (dataUrl) {
            // Adicionar imagem em tamanho maior para melhor visualização
            const imgWidth = 170;
            const imgHeight = 120;
            
            if (yPos + imgHeight > 280) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.addImage(dataUrl, 'JPEG', 20, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
          }
        } catch (error) {
          console.error('Erro ao adicionar imagem:', error);
          doc.setTextColor(255, 0, 0);
          doc.text('(Erro ao carregar imagem)', 20, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 5;
        }
      } else {
        doc.setTextColor(128, 128, 128);
        doc.text(`Tipo: ${comprovante.mime_type || 'Desconhecido'} - Não é uma imagem`, 20, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
      }
    }
  }

  // Adicionar rodapés
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    adicionarRodape(doc, i, totalPages);
  }

  // Salvar PDF
  doc.save(`viagem_${viagem.codigo}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Gerar PDF de um acerto
export async function gerarPDFAcerto(
  acerto: any,
  viagens: any[],
  comprovantes: any[]
) {
  const doc = new jsPDF();
  let yPos = adicionarCabecalhoPDF(
    doc,
    `Acerto - ${acerto.codigo}`,
    `Motorista: ${acerto.motorista?.nome || 'N/A'}`
  );

  // Informações do Acerto
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações do Acerto', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const infoAcerto = [
    `Período: ${new Date(acerto.periodo_inicio).toLocaleDateString('pt-BR')} até ${new Date(acerto.periodo_fim).toLocaleDateString('pt-BR')}`,
    `Status: ${acerto.status}`,
    `Data Pagamento: ${acerto.data_pagamento ? new Date(acerto.data_pagamento).toLocaleDateString('pt-BR') : 'Não pago'}`,
    `Forma Pagamento: ${acerto.forma_pagamento || 'N/A'}`,
  ];

  infoAcerto.forEach((info) => {
    doc.text(info, 20, yPos);
    yPos += 5;
  });

  yPos += 5;

  // Resumo Financeiro
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const resumo = [
    `Base de Comissão: R$ ${Number(acerto.base_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Comissão (${acerto.percentual_comissao || 0}%): R$ ${Number(acerto.valor_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Reembolsos: R$ ${Number(acerto.total_reembolsos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Adiantamentos: - R$ ${Number(acerto.total_adiantamentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Descontos: - R$ ${Number(acerto.total_descontos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ];

  resumo.forEach((info) => {
    doc.text(info, 20, yPos);
    yPos += 5;
  });

  yPos += 3;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `TOTAL A PAGAR: R$ ${Number(acerto.total_pagar || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    20,
    yPos
  );
  yPos += 10;

  // Tabela de Viagens
  if (viagens.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Viagens do Período', 20, yPos);
    yPos += 5;

    const viagensData = viagens.map((v) => {
      const despesasReemb = v.despesas?.filter((d: any) => d.reembolsavel).reduce((sum: number, d: any) => sum + d.valor, 0) || 0;
      const despesasNaoReemb = v.despesas?.filter((d: any) => !d.reembolsavel).reduce((sum: number, d: any) => sum + d.valor, 0) || 0;

      return [
        v.codigo,
        v.origem,
        v.destino,
        new Date(v.data_saida).toLocaleDateString('pt-BR'),
        `R$ ${Number(v.frete?.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${despesasReemb.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${despesasNaoReemb.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Código', 'Origem', 'Destino', 'Data', 'Frete', 'Desp. Reemb.', 'Desp. N/Reemb.']],
      body: viagensData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Comprovantes
  if (comprovantes.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Comprovantes (${comprovantes.length})`, 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Relação de todos os comprovantes anexados nas viagens deste acerto:', 20, yPos);
    yPos += 5;

    comprovantes.forEach((comp, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${comp.nome} (${comp.tipo_documento || 'Documento'})`, 25, yPos);
      yPos += 5;
    });
  }

  // Observações
  if (acerto.observacoes) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(acerto.observacoes, 170);
    doc.text(splitText, 20, yPos);
  }

  // Adicionar rodapés
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    adicionarRodape(doc, i, totalPages);
  }

  // Salvar PDF
  doc.save(`acerto_${acerto.codigo}_${new Date().toISOString().split('T')[0]}.pdf`);
}
