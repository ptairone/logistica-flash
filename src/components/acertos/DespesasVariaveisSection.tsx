import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DespesaVariavel {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  reembolsavel: boolean;
}

const TIPOS_DESPESA = [
  { value: 'POSTO', label: 'POSTO' },
  { value: 'PEDAGIO', label: 'PEDÁGIO' },
  { value: 'ALIMENTACAO', label: 'ALIMENTAÇÃO' },
  { value: 'ESTACIONAMENTO', label: 'ESTACIONAMENTO' },
  { value: 'MECANICA', label: 'MECÂNICA' },
  { value: 'OUTROS', label: 'OUTROS' },
];

interface DespesasVariaveisSectionProps {
  despesas: DespesaVariavel[];
  onChange: (despesas: DespesaVariavel[]) => void;
}

export function DespesasVariaveisSection({ despesas, onChange }: DespesasVariaveisSectionProps) {
  const adicionarDespesa = () => {
    const novaDespesa: DespesaVariavel = {
      id: Date.now().toString(),
      tipo: 'POSTO',
      descricao: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      reembolsavel: true,
    };
    onChange([...despesas, novaDespesa]);
  };

  const removerDespesa = (id: string) => {
    onChange(despesas.filter(d => d.id !== id));
  };

  const atualizarDespesa = (id: string, campo: keyof DespesaVariavel, valor: any) => {
    onChange(despesas.map(d => d.id === id ? { ...d, [campo]: valor } : d));
  };

  const totalReembolsavel = despesas
    .filter(d => d.reembolsavel)
    .reduce((sum, d) => sum + d.valor, 0);

  const totalNaoReembolsavel = despesas
    .filter(d => !d.reembolsavel)
    .reduce((sum, d) => sum + d.valor, 0);

  const totalGeral = despesas.reduce((sum, d) => sum + d.valor, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Despesas Variáveis</CardTitle>
          <Button onClick={adicionarDespesa} size="sm" variant="outline">
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
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-right p-2">Valor (R$)</th>
                  <th className="text-center p-2">Reembolsável</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((despesa) => (
                  <tr key={despesa.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Input
                        type="date"
                        value={despesa.data}
                        onChange={(e) => atualizarDespesa(despesa.id, 'data', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <Select
                        value={despesa.tipo}
                        onValueChange={(valor) => atualizarDespesa(despesa.id, 'tipo', valor)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_DESPESA.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        value={despesa.descricao}
                        onChange={(e) => atualizarDespesa(despesa.id, 'descricao', e.target.value)}
                        placeholder="Descrição..."
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={despesa.valor}
                        onChange={(e) => atualizarDespesa(despesa.id, 'valor', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs text-right"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Select
                        value={despesa.reembolsavel ? 'sim' : 'nao'}
                        onValueChange={(valor) => atualizarDespesa(despesa.id, 'reembolsavel', valor === 'sim')}
                      >
                        <SelectTrigger className="h-8 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerDespesa(despesa.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-medium">
                  <td colSpan={3} className="p-2 text-right">Reembolsável:</td>
                  <td className="p-2 text-right text-blue-600">
                    R$ {totalReembolsavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2}></td>
                </tr>
                <tr className="font-medium">
                  <td colSpan={3} className="p-2 text-right">Não Reembolsável:</td>
                  <td className="p-2 text-right text-orange-600">
                    R$ {totalNaoReembolsavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2}></td>
                </tr>
                <tr className="border-t-2 font-bold">
                  <td colSpan={3} className="p-2 text-right">TOTAL GERAL:</td>
                  <td className="p-2 text-right text-primary">
                    R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
