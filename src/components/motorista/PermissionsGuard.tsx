import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { usePermissions } from '@/contexts/PermissionsContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Truck } from 'lucide-react';

export function PermissionsGuard() {
  const { roles } = useAuth();
  const {
    permissionsRequested,
    isPermissionsModalOpen,
    setIsPermissionsModalOpen,
    requestPermissions,
  } = usePermissions();

  const isMotorista = roles.includes('motorista');

  useEffect(() => {
    // Se for motorista e ainda não solicitou permissões, mostrar modal
    if (isMotorista && !permissionsRequested) {
      // Pequeno delay para não aparecer instantaneamente
      const timer = setTimeout(() => {
        setIsPermissionsModalOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMotorista, permissionsRequested, setIsPermissionsModalOpen]);

  const handleRequestPermissions = async () => {
    await requestPermissions();
  };

  const handleSkip = () => {
    // Marcar como solicitado mesmo que usuário tenha pulado
    localStorage.setItem('motorista_permissions_requested', 'true');
    setIsPermissionsModalOpen(false);
  };

  if (!isMotorista) {
    return null;
  }

  return (
    <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Truck className="h-12 w-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Bem-vindo ao App do Motorista!
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <p>
              Para funcionar corretamente, o aplicativo precisa de acesso a:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-left">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Camera className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Câmera</p>
                  <p className="text-sm">Para fotografar comprovantes e documentos durante as viagens</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Localização</p>
                  <p className="text-sm">Para rastreamento automático e registro de checkpoints</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Você só precisará permitir uma vez. Estas permissões são necessárias para o funcionamento completo do aplicativo.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleRequestPermissions} className="w-full">
            Permitir Acesso
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full">
            Agora não
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
