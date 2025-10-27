import { ReactNode, useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';
import { SafeArea } from './SafeArea';
import { FloatingActionButton } from './FloatingActionButton';
import { QuickCaptureModal } from '@/components/motorista/QuickCaptureModal';
import { useAuth } from '@/lib/auth';
import { useViagensMotorista } from '@/hooks/useViagensMotorista';
import { Camera } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  showBottomNav?: boolean;
}

export function MobileLayout({ 
  children, 
  title = 'Logística Flash',
  showBack,
  rightAction,
  showBottomNav = true
}: MobileLayoutProps) {
  const { user } = useAuth();
  const { data: viagens } = useViagensMotorista();
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  // Verificar se é motorista e tem viagens ativas
  const isMotorista = user?.user_metadata?.role === 'motorista';
  const viagensAtivas = viagens?.filter(v => v.status !== 'concluida') || [];
  const mostrarFAB = isMotorista && viagensAtivas.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MobileHeader 
        title={title} 
        showBack={showBack}
        rightAction={rightAction}
      />
      
      <main className="flex-1 overflow-auto pb-20">
        <SafeArea bottom={false}>
          {children}
        </SafeArea>
      </main>
      
      {showBottomNav && <BottomNavigation />}

      {/* FAB para captura rápida - apenas para motoristas com viagens ativas */}
      {mostrarFAB && (
        <FloatingActionButton
          onClick={() => setShowCaptureModal(true)}
          icon={<Camera className="h-6 w-6" />}
        />
      )}

      {/* Modal de captura rápida */}
      <QuickCaptureModal
        open={showCaptureModal}
        onOpenChange={setShowCaptureModal}
        viagens={viagensAtivas}
      />
    </div>
  );
}
