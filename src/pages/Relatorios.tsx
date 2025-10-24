import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, Filter } from 'lucide-react';
import { PainelOperacional } from '@/components/relatorios/PainelOperacional';
import { PainelFinanceiro } from '@/components/relatorios/PainelFinanceiro';
import { PainelFrota } from '@/components/relatorios/PainelFrota';
import { PainelMotoristas } from '@/components/relatorios/PainelMotoristas';
import { FiltrosRelatorio } from '@/components/relatorios/FiltrosRelatorio';

export default function Relatorios() {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    motoristaId: '',
    veiculoId: '',
    clienteNome: '',
    status: '',
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">
              Análises operacionais e financeiras da sua frota
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {filtrosAbertos && (
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Relatório</CardTitle>
              <CardDescription>
                Selecione os filtros para refinar os dados exibidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FiltrosRelatorio filtros={filtros} onChange={setFiltros} />
            </CardContent>
          </Card>
        )}

        {/* Painéis */}
        <Tabs defaultValue="operacional" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="operacional">Operacional</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="frota">Frota & Estoque</TabsTrigger>
            <TabsTrigger value="motoristas">Motoristas</TabsTrigger>
          </TabsList>

          <TabsContent value="operacional" className="space-y-4">
            <PainelOperacional filtros={filtros} />
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
            <PainelFinanceiro filtros={filtros} />
          </TabsContent>

          <TabsContent value="frota" className="space-y-4">
            <PainelFrota filtros={filtros} />
          </TabsContent>

          <TabsContent value="motoristas" className="space-y-4">
            <PainelMotoristas filtros={filtros} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
