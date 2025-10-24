import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DespesaCaminhao {
  id: string;
  categoria: string;
  descricao: string;
  valorAnual: number;
  valorMensal: number;
  valorDiario: number;
  quantidadeDias: number;
  tipo: 'debito' | 'credito';
}

const CATEGORIAS_DESPESAS = [
  'DIESEL FORA',
  'DIESEL CASA',
  'DIESEL NO POSTO PAGO',
  'PEDAGIO',
  'PEÇAS E MECÂNICAS',
  'MANUTENÇÃO FORA',
  'MANUTENÇÃO CASA',
  'MÃO DE OBRA CASA',
  'IPVA E LICENCIAMENTO',
  'SEGURO C/ TERCEIROS',
  'SEGURO COOPERATIVA',
  'RASTREADOR MONITORAMENTO',
  'PNEUS',
  'PRESTAÇÃO DO CAMINHÃO',
  'LICENÇAS',
  'PROVENTOS',
  'SALARIO MOTORISTA',
];

interface DespesasCaminhaoSectionProps {
  despesas: DespesaCaminhao[];
  onChange: (despesas: DespesaCaminhao[]) => void;
  quantidadeDias: number;
}

export function DespesasCaminhaoSection({ despesas, onChange, quantidadeDias }: DespesasCaminhaoSectionProps) {
  const adicionarDespesa = () => {
    const novaDespesa: DespesaCaminhao = {
      id: Date.now().toString(),
      categoria: '',
      descricao: '',
      valorAnual: 0,
      valorMensal: 0,
      valorDiario: 0,
      quantidadeDias: quantidadeDias,
      tipo: 'debito',
    };
    onChange([...despesas, novaDespesa]);
  };

  const removerDespesa = (id: string) => {
    onChange(despesas.filter(d => d.id !== id));
  };

  const atualizarDespesa = (id: string, campo: keyof DespesaCaminhao, valor: any) => {
    onChange(despesas.map(d => {
      if (d.id !== id) return d;
      
      const atualizada = { ...d, [campo]: valor };
      
      // Recalcular valores automaticamente
      if (campo === 'valorAnual') {
        atualizada.valorMensal = valor / 12;
        atualizada.valorDiario = atualizada.valorMensal / 30;
      } else if (campo === 'valorMensal') {
        atualizada.valorAnual = valor * 12;
        atualizada.valorDiario = valor / 30;
      } else if (campo === 'valorDiario') {
        atualizada.valorMensal = valor * 30;
        atualizada.valorAnual = atualizada.valorMensal * 12;
      }
      
      return atualizada;
    }));
  };

  const totalDebito = despesas
    .filter(d => d.tipo === 'debito')
    .reduce((sum, d) => sum + (d.valorDiario * d.quantidadeDias), 0);

  const totalCredito = despesas
    .filter(d => d.tipo === 'credito')
    .reduce((sum, d) => sum + (d.valorDiario * d.quantidadeDias), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Despesas do Caminhão</CardTitle>
          <Button onClick={adicionarDespesa} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Despesa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-right p-2">Val/Ano</th>
                  <th className="text-right p-2">Val/Mês</th>
                  <th className="text-right p-2">Val/Dia</th>
                  <th className="text-right p-2">Q/Dia</th>
                  <th className="text-right p-2">Débito</th>
                  <th className="text-right p-2">Crédito</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((despesa) => (
                  <tr key={despesa.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Select
                        value={despesa.categoria}
                        onValueChange={(valor) => atualizarDespesa(despesa.id, 'categoria', valor)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS_DESPESAS.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={despesa.valorAnual}
                        onChange={(e) => atualizarDespesa(despesa.id, 'valorAnual', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs text-right"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={despesa.valorMensal.toFixed(2)}
                        onChange={(e) => atualizarDespesa(despesa.id, 'valorMensal', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs text-right"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={despesa.valorDiario.toFixed(2)}
                        onChange={(e) => atualizarDespesa(despesa.id, 'valorDiario', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs text-right"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={despesa.quantidadeDias}
                        onChange={(e) => atualizarDespesa(despesa.id, 'quantidadeDias', parseInt(e.target.value) || 0)}
                        className="h-8 text-xs text-right"
                      />
                    </td>
                    <td className="p-2 text-right">
                      {despesa.tipo === 'debito' && (
                        <span className="text-destructive font-medium">
                          {(despesa.valorDiario * despesa.quantidadeDias).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {despesa.tipo === 'credito' && (
                        <span className="text-green-600 font-medium">
                          {(despesa.valorDiario * despesa.quantidadeDias).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Select
                          value={despesa.tipo}
                          onValueChange={(valor: 'debito' | 'credito') => atualizarDespesa(despesa.id, 'tipo', valor)}
                        >
                          <SelectTrigger className="h-8 w-20 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debito">Débito</SelectItem>
                            <SelectItem value="credito">Crédito</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerDespesa(despesa.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td colSpan={5} className="p-2 text-right">TOTAL:</td>
                  <td className="p-2 text-right text-destructive">
                    R$ {totalDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-green-600">
                    R$ {totalCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
