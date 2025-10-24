import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMotoristasAtivos } from '@/hooks/useViagens';
import { useViagensDisponiveis } from '@/hooks/useAcertos';
import { DespesasCaminhaoSection } from '@/components/acertos/DespesasCaminhaoSection';
import { DespesasVariaveisSection } from '@/components/acertos/DespesasVariaveisSection';
import { FretesSection } from '@/components/acertos/FretesSection';
import { RelatorioLucroPrejuizo } from '@/components/acertos/RelatorioLucroPrejuizo';
import { Checkbox } from '@/components/ui/checkbox';

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

interface DespesaVariavel {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  reembolsavel: boolean;
}

export default function AcertoCompleto() {
  const navigate = useNavigate();
  const { data: motoristas = [] } = useMotoristasAtivos();

  // Dados do cabeçalho
  const [motoristaId, setMotoristaId] = useState('');
  const [codigoViagem, setCodigoViagem] = useState('');
  const [dataSalarioInicio, setDataSalarioInicio] = useState('');
  const [dataSalarioFim, setDataSalarioFim] = useState('');
  const [kmInicial, setKmInicial] = useState(0);
  const [kmFinal, setKmFinal] = useState(0);
  const [quantidadeDias, setQuantidadeDias] = useState(0);

  // Viagens disponíveis
  const { data: viagensDisponiveis = [] } = useViagensDisponiveis(motoristaId);

  const [viagensSelecionadas, setViagensSelecionadas] = useState<string[]>([]);

  // Despesas
  const [despesasCaminhao, setDespesasCaminhao] = useState<DespesaCaminhao[]>([]);
  const [despesasVariaveis, setDespesasVariaveis] = useState<DespesaVariavel[]>([]);

  // Calcular KM rodado
  const kmRodado = kmFinal - kmInicial;

  // Calcular quantidade de dias automaticamente
  useEffect(() => {
    if (dataSalarioInicio && dataSalarioFim) {
      const inicio = new Date(dataSalarioInicio);
      const fim = new Date(dataSalarioFim);
      const diffTime = Math.abs(fim.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setQuantidadeDias(diffDays);
    }
  }, [dataSalarioInicio, dataSalarioFim]);

  // Calcular receita total das viagens selecionadas
  const viagensSelecionadasData = viagensDisponiveis.filter(v => viagensSelecionadas.includes(v.id));
  const receitaTotal = viagensSelecionadasData.reduce((sum, v) => sum + (v.frete?.valor_frete || 0), 0);

  const toggleViagem = (viagemId: string) => {
    setViagensSelecionadas(prev =>
      prev.includes(viagemId)
        ? prev.filter(id => id !== viagemId)
        : [...prev, viagemId]
    );
  };

  const handleSalvar = () => {
    // TODO: Implementar salvamento no banco de dados
    console.log('Salvando acerto completo...', {
      motoristaId,
      codigoViagem,
      dataSalarioInicio,
      dataSalarioFim,
      kmInicial,
      kmFinal,
      viagensSelecionadas,
      despesasCaminhao,
      despesasVariaveis,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/acertos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Acerto Completo - Planilha Integrada</h1>
              <p className="text-muted-foreground">
                Sistema completo de gestão de lucro e prejuízo
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSalvar}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button onClick={handleSalvar}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Acerto Financeiro
            </Button>
          </div>
        </div>

        {/* Cabeçalho do Acerto */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motorista">Motorista *</Label>
                <Select value={motoristaId} onValueChange={setMotoristaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {motoristas.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código da Viagem</Label>
                <Input
                  id="codigo"
                  value={codigoViagem}
                  onChange={(e) => setCodigoViagem(e.target.value)}
                  placeholder="QTM-2D80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dias">Quantidade de Dias</Label>
                <Input
                  id="dias"
                  type="number"
                  value={quantidadeDias}
                  onChange={(e) => setQuantidadeDias(parseInt(e.target.value) || 0)}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-inicio">Data Início</Label>
                <Input
                  id="data-inicio"
                  type="date"
                  value={dataSalarioInicio}
                  onChange={(e) => setDataSalarioInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-fim">Data Fim</Label>
                <Input
                  id="data-fim"
                  type="date"
                  value={dataSalarioFim}
                  onChange={(e) => setDataSalarioFim(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="km-inicial">KM Inicial</Label>
                <Input
                  id="km-inicial"
                  type="number"
                  value={kmInicial}
                  onChange={(e) => setKmInicial(parseFloat(e.target.value) || 0)}
                  placeholder="750.941"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="km-final">KM Final</Label>
                <Input
                  id="km-final"
                  type="number"
                  value={kmFinal}
                  onChange={(e) => setKmFinal(parseFloat(e.target.value) || 0)}
                  placeholder="755.298"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="km-rodado">KM Rodado</Label>
                <Input
                  id="km-rodado"
                  type="number"
                  value={kmRodado}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-km">Média KM/Dia</Label>
                <Input
                  id="media-km"
                  type="number"
                  value={quantidadeDias > 0 ? (kmRodado / quantidadeDias).toFixed(2) : 0}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Viagens */}
        {motoristaId && dataSalarioInicio && dataSalarioFim && (
          <Card>
            <CardHeader>
              <CardTitle>Viagens Disponíveis ({viagensSelecionadas.length} selecionadas)</CardTitle>
            </CardHeader>
            <CardContent>
              {viagensDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma viagem disponível para o período selecionado
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viagensDisponiveis.map((viagem: any) => (
                    <Card
                      key={viagem.id}
                      className={viagensSelecionadas.includes(viagem.id) ? 'border-primary bg-primary/5' : 'cursor-pointer'}
                      onClick={() => toggleViagem(viagem.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={viagensSelecionadas.includes(viagem.id)}
                            onCheckedChange={() => toggleViagem(viagem.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{viagem.codigo}</p>
                            <p className="text-sm text-muted-foreground">
                              {viagem.origem} → {viagem.destino}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {viagem.km_percorrido || 0} km
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                R$ {(viagem.frete?.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs de Seções */}
        <Tabs defaultValue="despesas-caminhao" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="despesas-caminhao">Despesas Caminhão</TabsTrigger>
            <TabsTrigger value="despesas-variaveis">Despesas Variáveis</TabsTrigger>
            <TabsTrigger value="fretes">Fretes</TabsTrigger>
            <TabsTrigger value="relatorio">Relatório L/P</TabsTrigger>
          </TabsList>

          <TabsContent value="despesas-caminhao">
            <DespesasCaminhaoSection
              despesas={despesasCaminhao}
              onChange={setDespesasCaminhao}
              quantidadeDias={quantidadeDias}
            />
          </TabsContent>

          <TabsContent value="despesas-variaveis">
            <DespesasVariaveisSection
              despesas={despesasVariaveis}
              onChange={setDespesasVariaveis}
            />
          </TabsContent>

          <TabsContent value="fretes">
            <FretesSection
              fretes={[]}
              viagensSelecionadas={viagensSelecionadasData}
            />
          </TabsContent>

          <TabsContent value="relatorio">
            <RelatorioLucroPrejuizo
              receitaTotal={receitaTotal}
              despesasCaminhao={despesasCaminhao}
              despesasVariaveis={despesasVariaveis}
              quantidadeDias={quantidadeDias}
              kmRodado={kmRodado}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
