import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Edit3, FileText, AlertTriangle } from 'lucide-react';
import { ViagemAcerto } from '@/lib/validations-acerto';
import { useValidarDespesa } from '@/hooks/useDespesasValidacao';

interface DespesaComValidacao {
  id: string;
  viagemCodigo: string;
  tipo: string;
  descricao?: string;
  valor: number;
  reembolsavel: boolean;
  anexo_url?: string;
  status: 'pendente' | 'aprovada' | 'reprovada' | 'ajustada';
  valor_aprovado?: number;
  justificativa?: string;
  observacoes?: string;
}

interface AcertoRevisaoDespesasProps {
  viagens: ViagemAcerto[];
  acertoId: string;
  onValidacoesChange: (validacoes: Map<string, DespesaComValidacao>) => void;
}

export function AcertoRevisaoDespesas({ viagens, acertoId, onValidacoesChange }: AcertoRevisaoDespesasProps) {
  const [despesasValidacao, setDespesasValidacao] = useState<Map<string, DespesaComValidacao>>(new Map());
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const { mutate: validarDespesa } = useValidarDespesa();

  const despesas: DespesaComValidacao[] = viagens.flatMap((viagem) =>
    viagem.despesas.map((despesa: any) => ({
      id: despesa.id || `temp-${Math.random()}`,
      viagemCodigo: viagem.codigo,
      tipo: despesa.tipo || 'Não especificado',
      descricao: despesa.descricao,
      valor: despesa.valor,
      reembolsavel: despesa.reembolsavel,
      anexo_url: despesa.anexo_url,
      status: despesasValidacao.get(despesa.id || '')?.status || 'pendente',
      valor_aprovado: despesasValidacao.get(despesa.id || '')?.valor_aprovado,
      justificativa: despesasValidacao.get(despesa.id || '')?.justificativa,
      observacoes: despesasValidacao.get(despesa.id || '')?.observacoes,
    }))
  );

  const despesasFiltradas = filtroStatus === 'todas' 
    ? despesas 
    : despesas.filter(d => d.status === filtroStatus);

  const atualizarValidacao = (despesaId: string, updates: Partial<DespesaComValidacao>) => {
    const despesa = despesas.find(d => d.id === despesaId);
    if (!despesa) return;

    const novaValidacao = { ...despesa, ...updates };
    const novoMapa = new Map(despesasValidacao);
    novoMapa.set(despesaId, novaValidacao);
    setDespesasValidacao(novoMapa);
    onValidacoesChange(novoMapa);
  };

  const aprovarDespesa = (despesaId: string) => {
    atualizarValidacao(despesaId, { status: 'aprovada', valor_aprovado: undefined });
  };

  const reprovarDespesa = (despesaId: string) => {
    atualizarValidacao(despesaId, { status: 'reprovada', valor_aprovado: 0 });
  };

  const totais = {
    pendentes: despesas.filter(d => d.status === 'pendente').length,
    aprovadas: despesas.filter(d => d.status === 'aprovada').length,
    reprovadas: despesas.filter(d => d.status === 'reprovada').length,
    ajustadas: despesas.filter(d => d.status === 'ajustada').length,
    semComprovante: despesas.filter(d => !d.anexo_url).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Revisão de Despesas</h3>
          <p className="text-sm text-muted-foreground">
            Valide cada despesa antes de finalizar o acerto
          </p>
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas ({despesas.length})</SelectItem>
            <SelectItem value="pendente">Pendentes ({totais.pendentes})</SelectItem>
            <SelectItem value="aprovada">Aprovadas ({totais.aprovadas})</SelectItem>
            <SelectItem value="reprovada">Reprovadas ({totais.reprovadas})</SelectItem>
            <SelectItem value="ajustada">Ajustadas ({totais.ajustadas})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {totais.semComprovante > 0 && (
        <Card className="p-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {totais.semComprovante} despesa(s) sem comprovante anexado
            </p>
          </div>
        </Card>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Viagem</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor Original</TableHead>
              <TableHead className="text-right">Valor Aprovado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Comprovante</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {despesasFiltradas.map((despesa) => (
              <TableRow key={despesa.id}>
                <TableCell className="font-medium">{despesa.viagemCodigo}</TableCell>
                <TableCell>
                  <Badge variant="outline">{despesa.tipo}</Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {despesa.descricao || '-'}
                </TableCell>
                <TableCell className="text-right">
                  R$ {despesa.valor.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {despesa.status === 'ajustada' ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={despesa.valor_aprovado || despesa.valor}
                      onChange={(e) => atualizarValidacao(despesa.id, {
                        valor_aprovado: parseFloat(e.target.value),
                        status: 'ajustada',
                      })}
                      className="w-24 text-right"
                    />
                  ) : (
                    <span>R$ {(despesa.valor_aprovado || despesa.valor).toFixed(2)}</span>
                  )}
                </TableCell>
                <TableCell>
                  {despesa.status === 'aprovada' && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Aprovada
                    </Badge>
                  )}
                  {despesa.status === 'reprovada' && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Reprovada
                    </Badge>
                  )}
                  {despesa.status === 'ajustada' && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Ajustada
                    </Badge>
                  )}
                  {despesa.status === 'pendente' && (
                    <Badge variant="secondary">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {despesa.anexo_url ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(despesa.anexo_url, '_blank')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem comprovante</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => aprovarDespesa(despesa.id)}
                      disabled={despesa.status === 'aprovada'}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => atualizarValidacao(despesa.id, { status: 'ajustada' })}
                    >
                      <Edit3 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reprovarDespesa(despesa.id)}
                      disabled={despesa.status === 'reprovada'}
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {despesasFiltradas.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma despesa encontrada com este filtro
        </div>
      )}
    </div>
  );
}
