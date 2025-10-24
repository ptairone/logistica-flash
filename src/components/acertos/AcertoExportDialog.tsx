import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useViagensAcerto } from '@/hooks/useAcertos';

interface AcertoExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acerto: any;
}

export function AcertoExportDialog({ open, onOpenChange, acerto }: AcertoExportDialogProps) {
  const { data: viagens = [] } = useViagensAcerto(acerto?.id);

  if (!acerto) return null;

  const handleExportPDF = () => {
    // TODO: Implementar geração de PDF com jsPDF ou similar
    console.log('Exportar PDF', acerto);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Acerto</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Exportar CSV (Excel)
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleExportPDF}
            disabled
          >
            <FileText className="h-4 w-4" />
            Exportar PDF (Em breve)
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              O arquivo CSV pode ser aberto no Excel ou importado em sistemas de contabilidade.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
