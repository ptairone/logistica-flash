import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';
import { SafeArea } from './SafeArea';

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
    </div>
  );
}
