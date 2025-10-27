import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileMenu } from './MobileMenu';
import { useDevice } from '@/hooks/useDevice';
import { MobileLayout } from './mobile/MobileLayout';

interface MainLayoutProps {
  children: ReactNode;
  mobileTitle?: string;
  showMobileBack?: boolean;
  mobileRightAction?: ReactNode;
}

export function MainLayout({ 
  children, 
  mobileTitle,
  showMobileBack,
  mobileRightAction 
}: MainLayoutProps) {
  const { isMobile } = useDevice();

  // Renderiza layout mobile
  if (isMobile) {
    return (
      <MobileLayout 
        title={mobileTitle}
        showBack={showMobileBack}
        rightAction={mobileRightAction}
      >
        {children}
      </MobileLayout>
    );
  }

  // Renderiza layout desktop
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2 hidden md:flex" />
              <MobileMenu />
              <h1 className="text-lg font-semibold">Gestão de Transportes</h1>
            </div>
          </header>
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
