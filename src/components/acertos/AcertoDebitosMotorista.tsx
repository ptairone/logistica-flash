import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import { AcertoDebito } from '@/hooks/useAcertoDebitos';

interface DebitoSelecionado {
  debito: AcertoDebito;
  valorDescontar: number;
}

interface AcertoDebitosMotoristaProps {
  debitos: AcertoDebito[];
  onDebitosChange: (debitosSelecionados: DebitoSelecionado[]) => void;
}

export function AcertoDebitosMotorista({ debitos, onDebitosChange }: AcertoDebitosMotoristaProps) {
  const [debitosSelecionados, setDebitosSelecionados] = useState<Map<string, DebitoSelecionado>>(new Map());

  const toggleDebito = (debito: AcertoDebito, checked: boolean) => {
    const novoMapa = new Map(debitosSelecionados);
    
    if (checked) {
      novoMapa.set(debito.id, {
        debito,
        valorDescontar: debito.saldo,
      });
    } else {
      novoMapa.delete(debito.id);
    }
    
    setDebitosSelecionados(novoMapa);
  };

  const atualizarValorDescontar = (debitoId: string, valor: number) => {
    const debito = debitosSelecionados.get(debitoId);
    if (!debito) return;

    const valorLimitado = Math.min(Math.max(0, valor), debito.debito.saldo);
    
    const novoMapa = new Map(debitosSelecionados);
    novoMapa.set(debitoId, {
      ...debito,
      valorDescontar: valorLimitado,
    });
    
    setDebitosSelecionados(novoMapa);
  };

  useEffect(() => {
    onDebitosChange(Array.from(debitosSelecionados.values()));
  }, [debitosSelecionados, onDebitosChange]);

  const totalDebitos = debitos.reduce((sum, d) => sum + d.saldo, 0);
  const totalDescontar = Array.from(debitosSelecionados.values())
    .reduce((sum, d) => sum + d.valorDescontar, 0);

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      vale_combustivel: 'Vale Combustível',
      emprestimo: 'Empréstimo',
      dano: 'Dano',
      multa: 'Multa',
      outros: 'Outros',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Débitos Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDebitos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {debitos.length} débito(s) em aberto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">A Descontar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {totalDescontar.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {debitosSelecionados.size} débito(s) selecionado(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(totalDebitos - totalDescontar).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Após este acerto
            </p>
          </CardContent>
        </Card>
      </div>

      {debitos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            🎉 Nenhum débito em aberto para este motorista
          </CardContent>
        </Card>
      ) : (
        <>
          {totalDebitos > 500 && (
            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Atenção: Motorista possui débito alto (R$ {totalDebitos.toFixed(2)})
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Débitos em Aberto</CardTitle>
              <CardDescription>
                Selecione os débitos que deseja descontar neste acerto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor Original</TableHead>
                    <TableHead className="text-right">Já Pago</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Descontar</TableHead>
                    <TableHead>Vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debitos.map((debito) => {
                    const selecionado = debitosSelecionados.has(debito.id);
                    const valorDescontar = debitosSelecionados.get(debito.id)?.valorDescontar || debito.saldo;

                    return (
                      <TableRow key={debito.id}>
                        <TableCell>
                          <Checkbox
                            checked={selecionado}
                            onCheckedChange={(checked) => toggleDebito(debito, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTipoLabel(debito.tipo)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {debito.descricao}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {debito.valor_original.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          R$ {debito.valor_pago.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          R$ {debito.saldo.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {selecionado ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={valorDescontar}
                              onChange={(e) => atualizarValorDescontar(debito.id, parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                              max={debito.saldo}
                              min={0}
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {debito.data_vencimento ? (
                            <span className="text-sm">
                              {new Date(debito.data_vencimento).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
