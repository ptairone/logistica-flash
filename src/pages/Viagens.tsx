import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Viagens() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Viagens</h2>
          <p className="text-muted-foreground">
            Gerencie as viagens e entregas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Viagens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma viagem cadastrada
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
