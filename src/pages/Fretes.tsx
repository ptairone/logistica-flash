import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Fretes() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fretes</h2>
          <p className="text-muted-foreground">
            Gerencie os fretes e clientes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Fretes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum frete cadastrado
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
