import { useState } from 'react';
import { useViagensMotorista } from '@/hooks/useMotoristas';
import { ViagemCard } from '@/components/motorista/ViagemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Package, CheckCircle, LogOut, Camera } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { QuickCaptureModal } from '@/components/motorista/QuickCaptureModal';

export default function Viagens() {
  const { user, signOut } = useAuth();
  const { data: viagens, isLoading } = useViagensMotorista();
  const navigate = useNavigate();
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const viagensEmAndamento = viagens?.filter(v => v.status === 'em_andamento') || [];
  const viagensPlanejadas = viagens?.filter(v => v.status === 'planejada') || [];
  const viagensConcluidas = viagens?.filter(v => v.status === 'concluida').slice(0, 10) || [];
  const viagensAtivas = [...viagensEmAndamento, ...viagensPlanejadas];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simples e fixo */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Minhas Viagens</h1>
              <p className="text-sm opacity-90">Bem-vindo!</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 p-4 pb-6">
        <Tabs defaultValue="em_andamento" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-auto mb-6">
            <TabsTrigger value="em_andamento" className="flex flex-col gap-1 py-3">
              <Truck className="h-5 w-5" />
              <span className="text-xs font-medium">Em Andamento</span>
              {viagensEmAndamento.length > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                  {viagensEmAndamento.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="planejadas" className="flex flex-col gap-1 py-3">
              <Package className="h-5 w-5" />
              <span className="text-xs font-medium">Planejadas</span>
              {viagensPlanejadas.length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                  {viagensPlanejadas.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="concluidas" className="flex flex-col gap-1 py-3">
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Concluídas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="em_andamento" className="space-y-4">
            {viagensEmAndamento.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Truck className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhuma viagem em andamento</p>
              </div>
            ) : (
              viagensEmAndamento.map(viagem => (
                <ViagemCard key={viagem.id} viagem={viagem} />
              ))
            )}
          </TabsContent>

          <TabsContent value="planejadas" className="space-y-4">
            {viagensPlanejadas.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhuma viagem planejada</p>
              </div>
            ) : (
              viagensPlanejadas.map(viagem => (
                <ViagemCard key={viagem.id} viagem={viagem} />
              ))
            )}
          </TabsContent>

          <TabsContent value="concluidas" className="space-y-4">
            {viagensConcluidas.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhuma viagem concluída</p>
              </div>
            ) : (
              viagensConcluidas.map(viagem => (
                <ViagemCard key={viagem.id} viagem={viagem} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Captura Rápida */}
      <QuickCaptureModal
        open={showCaptureModal}
        onOpenChange={setShowCaptureModal}
        viagens={viagensAtivas}
      />
    </div>
  );
}
