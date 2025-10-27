import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Package } from 'lucide-react';
import { useViagensAcerto, useComprovantesAcerto } from '@/hooks/useAcertos';
import { gerarPDFAcerto } from '@/lib/pdf-export-utils';
import { exportarAcertoComComprovantes } from '@/lib/zip-export-utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AcertoExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acerto: any;
}

export function AcertoExportDialog({ open, onOpenChange, acerto }: AcertoExportDialogProps) {
  const { data: viagens = [] } = useViagensAcerto(acerto?.id);
  const { data: comprovantes = [] } = useComprovantesAcerto(acerto?.id);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  if (!acerto) return null;

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await gerarPDFAcerto(acerto, viagens, comprovantes);
      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar PDF',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Código Viagem',
      'Origem',
      'Destino',
      'Data Saída',
      'Frete (R$)',
      'Despesas Reembolsáveis (R$)',
      'Despesas Não Reembolsáveis (R$)',
    ];

    const rows = viagens.map((viagem: any) => {
      const despesasReemb = viagem.despesas?.filter((d: any) => d.reembolsavel).reduce((sum: number, d: any) => sum + d.valor, 0) || 0;
      const despesasNaoReemb = viagem.despesas?.filter((d: any) => !d.reembolsavel).reduce((sum: number, d: any) => sum + d.valor, 0) || 0;

      return [
        viagem.codigo,
        viagem.origem,
        viagem.destino,
        new Date(viagem.data_saida).toLocaleDateString('pt-BR'),
        viagem.frete?.valor_frete || 0,
        despesasReemb,
        despesasNaoReemb,
      ];
    });

    // Adicionar totais
    rows.push([
      'TOTAIS',
      '',
      '',
      '',
      viagens.reduce((sum: number, v: any) => sum + (v.frete?.valor_frete || 0), 0),
      acerto.total_reembolsos || 0,
      '',
    ]);

    const csvContent = [
      `Acerto: ${acerto.codigo}`,
      `Motorista: ${acerto.motorista?.nome}`,
      `Período: ${new Date(acerto.periodo_inicio).toLocaleDateString('pt-BR')} até ${new Date(acerto.periodo_fim).toLocaleDateString('pt-BR')}`,
      '',
      headers.join(';'),
      ...rows.map(row => row.join(';')),
      '',
      'RESUMO FINANCEIRO',
      `Base de Comissão;R$ ${acerto.base_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Comissão (${acerto.percentual_comissao}%);R$ ${acerto.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Reembolsos;R$ ${acerto.total_reembolsos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Adiantamentos;- R$ ${acerto.total_adiantamentos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Descontos;- R$ ${acerto.total_descontos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `TOTAL A PAGAR;R$ ${acerto.total_pagar?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `acerto_${acerto.codigo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportZIP = async () => {
    try {
      setExporting(true);
      await exportarAcertoComComprovantes(acerto, viagens, comprovantes, (current, total, message) => {
        console.log(`Progresso: ${current}/${total} - ${message}`);
      });
      toast({
        title: 'Sucesso',
        description: 'Arquivo ZIP gerado com sucesso',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao exportar ZIP:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar arquivo ZIP',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Acerto</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <div className="rounded-lg bg-muted p-3 mb-4">
            <p className="text-sm font-medium">
              {viagens.length} viagem(ns) • {comprovantes.length} comprovante(s)
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <Download className="h-4 w-4" />
            Exportar CSV Simples
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleExportPDF}
            disabled={exporting}
          >
            <FileText className="h-4 w-4" />
            {exporting ? 'Gerando PDF...' : 'Exportar PDF Completo'}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleExportZIP}
            disabled={exporting || comprovantes.length === 0}
          >
            <Package className="h-4 w-4" />
            {exporting ? 'Gerando ZIP...' : 'Exportar CSV + Comprovantes (ZIP)'}
          </Button>

          <div className="pt-4 border-t space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>CSV Simples:</strong> Apenas dados tabulados para Excel
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>PDF Completo:</strong> Relatório visual com informações e comprovantes
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>ZIP:</strong> CSV + todos os comprovantes organizados
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
