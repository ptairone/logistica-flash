import { useParams, useSearchParams } from 'react-router-dom';
import { useValidateDriverToken } from '@/hooks/useDriverFormLink';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverFormPartida } from '@/components/viagens/driver-form/DriverFormPartida';
import { DriverFormDespesas } from '@/components/viagens/driver-form/DriverFormDespesas';
import { DriverFormCheckpoints } from '@/components/viagens/driver-form/DriverFormCheckpoints';
import { DriverFormChegada } from '@/components/viagens/driver-form/DriverFormChegada';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function DriverForm() {
  const { viagemId } = useParams<{ viagemId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { data: viagem, isLoading, error } = useValidateDriverToken(viagemId!, token!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Validando acesso...</p>
      </div>
    );
  }

  if (error || !viagem) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Link inválido ou expirado'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Viagem {viagem.codigo}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="partida" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="partida">Partida</TabsTrigger>
                <TabsTrigger value="despesas">Despesas</TabsTrigger>
                <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
                <TabsTrigger value="chegada">Chegada</TabsTrigger>
              </TabsList>

              <TabsContent value="partida">
                <DriverFormPartida viagemId={viagemId!} />
              </TabsContent>

              <TabsContent value="despesas">
                <DriverFormDespesas viagemId={viagemId!} />
              </TabsContent>

              <TabsContent value="checkpoints">
                <DriverFormCheckpoints viagemId={viagemId!} />
              </TabsContent>

              <TabsContent value="chegada">
                <DriverFormChegada viagemId={viagemId!} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
