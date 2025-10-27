import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { AcertoAjuste } from '@/hooks/useAcertoAjustes';

interface AcertoAjustesAdminProps {
  ajustes: AcertoAjuste[];
  onAjustesChange: (ajustes: AcertoAjuste[]) => void;
}

export function AcertoAjustesAdmin({ ajustes, onAjustesChange }: AcertoAjustesAdminProps) {
  const [novoAjuste, setNovoAjuste] = useState<Partial<AcertoAjuste>>({
    tipo: 'bonificacao',
    categoria: '',
    descricao: '',
    valor: 0,
    justificativa: '',
  });

  const adicionarAjuste = () => {
    if (!novoAjuste.categoria || !novoAjuste.descricao || !novoAjuste.valor) {
      return;
    }

    const ajuste: AcertoAjuste = {
      id: `temp-${Date.now()}`,
      acerto_id: '',
      tipo: novoAjuste.tipo as any,
      categoria: novoAjuste.categoria,
      descricao: novoAjuste.descricao,
      valor: novoAjuste.valor,
      justificativa: novoAjuste.justificativa,
      created_at: new Date().toISOString(),
    };

    onAjustesChange([...ajustes, ajuste]);
    setNovoAjuste({
      tipo: 'bonificacao',
      categoria: '',
      descricao: '',
      valor: 0,
      justificativa: '',
    });
  };

  const removerAjuste = (id: string) => {
    onAjustesChange(ajustes.filter(a => a.id !== id));
  };

  const bonificacoes = ajustes.filter(a => a.tipo === 'bonificacao');
  const penalidades = ajustes.filter(a => a.tipo === 'penalidade');
  const outros = ajustes.filter(a => a.tipo === 'correcao' || a.tipo === 'outros');

  const totalBonificacoes = bonificacoes.reduce((sum, a) => sum + a.valor, 0);
  const totalPenalidades = penalidades.reduce((sum, a) => sum + a.valor, 0);

  const categoriasBonificacao = [
    'Meta batida',
    'Qualidade no serviço',
    'Pontualidade',
    'Zero acidentes',
    'Economia de combustível',
    'Hora extra',
    'Outros',
  ];

  const categoriasPenalidade = [
    'Atraso na entrega',
    'Dano ao veículo',
    'Multa de trânsito',
    'Descumprimento de normas',
    'Perda de carga',
    'Outros',
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Bonificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              + R$ {totalBonificacoes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {bonificacoes.length} itens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Penalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              - R$ {totalPenalidades.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {penalidades.length} itens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Ajustes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBonificacoes - totalPenalidades >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalBonificacoes - totalPenalidades >= 0 ? '+' : '-'} R$ {Math.abs(totalBonificacoes - totalPenalidades).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {ajustes.length} ajustes totais
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Ajuste</CardTitle>
          <CardDescription>
            Adicione bonificações, penalidades ou correções ao acerto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={novoAjuste.tipo}
                onValueChange={(value) => setNovoAjuste({ ...novoAjuste, tipo: value as any, categoria: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonificacao">Bonificação</SelectItem>
                  <SelectItem value="penalidade">Penalidade</SelectItem>
                  <SelectItem value="correcao">Correção</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={novoAjuste.categoria}
                onValueChange={(value) => setNovoAjuste({ ...novoAjuste, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {novoAjuste.tipo === 'bonificacao' && categoriasBonificacao.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  {novoAjuste.tipo === 'penalidade' && categoriasPenalidade.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  {(novoAjuste.tipo === 'correcao' || novoAjuste.tipo === 'outros') && (
                    <SelectItem value="Outros">Outros</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={novoAjuste.descricao}
              onChange={(e) => setNovoAjuste({ ...novoAjuste, descricao: e.target.value })}
              placeholder="Ex: Bateu meta de pontualidade do mês"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={novoAjuste.valor}
              onChange={(e) => setNovoAjuste({ ...novoAjuste, valor: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Justificativa</Label>
            <Textarea
              value={novoAjuste.justificativa}
              onChange={(e) => setNovoAjuste({ ...novoAjuste, justificativa: e.target.value })}
              placeholder="Justifique este ajuste (opcional)"
              rows={2}
            />
          </div>

          <Button onClick={adicionarAjuste} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ajuste
          </Button>
        </CardContent>
      </Card>

      {ajustes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ajustes Adicionados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ajustes.map((ajuste) => (
                  <TableRow key={ajuste.id}>
                    <TableCell className="font-medium capitalize">{ajuste.tipo}</TableCell>
                    <TableCell>{ajuste.categoria}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{ajuste.descricao}</TableCell>
                    <TableCell className={`text-right font-medium ${ajuste.tipo === 'bonificacao' ? 'text-green-600' : 'text-red-600'}`}>
                      {ajuste.tipo === 'bonificacao' ? '+' : '-'} R$ {ajuste.valor.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerAjuste(ajuste.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
