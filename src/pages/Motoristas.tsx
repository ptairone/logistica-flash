import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Motoristas() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Motoristas</h2>
          <p className="text-muted-foreground">
            Gerencie os motoristas da frota
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Motoristas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum motorista cadastrado
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
