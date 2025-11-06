import { useViagensMotorista } from '@/hooks/useViagensMotorista';
import { ViagemCard } from '@/components/motorista/ViagemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { APP_VERSION } from '@/lib/version';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: viagens, isLoading } = useViagensMotorista();

  const viagensEmAndamento = viagens?.filter(v => v.status === 'em_andamento') || [];
  const viagensPlanejadas = viagens?.filter(v => v.status === 'planejada') || [];
  const viagensConcluidas = viagens?.filter(v => v.status === 'concluida').slice(0, 10) || [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minhas Viagens</h1>
        <p className="text-muted-foreground">Bem-vindo, motorista!</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="em_andamento" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="em_andamento" className="flex flex-col gap-1 py-3">
            <Truck className="h-5 w-5" />
            <span className="text-xs">Em Andamento</span>
            {viagensEmAndamento.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                {viagensEmAndamento.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="planejadas" className="flex flex-col gap-1 py-3">
            <Package className="h-5 w-5" />
            <span className="text-xs">Planejadas</span>
            {viagensPlanejadas.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {viagensPlanejadas.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="concluidas" className="flex flex-col gap-1 py-3">
            <CheckCircle className="h-5 w-5" />
            <span className="text-xs">Concluídas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="em_andamento" className="mt-6 space-y-4">
          {viagensEmAndamento.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma viagem em andamento</p>
            </div>
          ) : (
            viagensEmAndamento.map(viagem => (
              <ViagemCard key={viagem.id} viagem={viagem} />
            ))
          )}
        </TabsContent>

        <TabsContent value="planejadas" className="mt-6 space-y-4">
          {viagensPlanejadas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma viagem planejada</p>
            </div>
          ) : (
            viagensPlanejadas.map(viagem => (
              <ViagemCard key={viagem.id} viagem={viagem} />
            ))
          )}
        </TabsContent>

        <TabsContent value="concluidas" className="mt-6 space-y-4">
          {viagensConcluidas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma viagem concluída</p>
            </div>
          ) : (
            viagensConcluidas.map(viagem => (
              <ViagemCard key={viagem.id} viagem={viagem} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Versão do App */}
      <div className="fixed bottom-20 left-0 right-0 pb-2 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
        <p className="text-xs text-muted-foreground text-center">
          v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
