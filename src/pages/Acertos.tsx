import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Acertos() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Acertos</h2>
          <p className="text-muted-foreground">
            Fechamento financeiro dos motoristas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Acertos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum acerto cadastrado
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
