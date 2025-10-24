import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Veiculos() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Veículos</h2>
          <p className="text-muted-foreground">
            Gerencie a frota de veículos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum veículo cadastrado
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
