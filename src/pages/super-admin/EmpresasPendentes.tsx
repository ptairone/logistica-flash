import { Building2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmpresas } from '@/hooks/useEmpresas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function EmpresasPendentes() {
  const { empresasPendentes, aprovarEmpresa, rejeitarEmpresa } = useEmpresas();

  const handleAprovar = (id: string) => {
    aprovarEmpresa.mutate(id);
  };

  const handleRejeitar = (id: string) => {
    rejeitarEmpresa.mutate({ id, motivo: 'Rejeitado pelo administrador' });
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Empresas Pendentes</h1>
          <p className="text-muted-foreground">Aprovar ou rejeitar solicitações de cadastro</p>
        </div>

        {empresasPendentes.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nenhuma solicitação pendente</h3>
            <p className="text-muted-foreground">
              Todas as solicitações foram processadas
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {empresasPendentes.map((empresa) => (
              <Card key={empresa.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                    </div>
                    <Badge variant="secondary">Pendente</Badge>
                  </div>
                  <CardDescription>{empresa.cnpj}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Responsável:</span>
                      <p className="font-medium">{empresa.nome_responsavel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{empresa.email_contato}</p>
                    </div>
                    {empresa.telefone && (
                      <div>
                        <span className="text-muted-foreground">Telefone:</span>
                        <p className="font-medium">{empresa.telefone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Solicitado em:</span>
                      <p className="font-medium">
                        {new Date(empresa.created_at).toLocaleDateString()} às{' '}
                        {new Date(empresa.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" className="flex-1">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Aprovar Empresa?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ao aprovar, a empresa {empresa.nome} receberá 7 dias de trial
                            e um email com as credenciais de acesso será enviado para{' '}
                            {empresa.email_contato}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAprovar(empresa.id)}>
                            Confirmar Aprovação
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rejeitar Empresa?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A empresa {empresa.nome} será
                            marcada como rejeitada.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRejeitar(empresa.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Confirmar Rejeição
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
