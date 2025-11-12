import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  MapPin, 
  Receipt, 
  Package, 
  FileText, 
  Settings, 
  BarChart3, 
  Wrench,
  Download,
  LogOut,
  Circle,
  Fuel
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { UpdateButton } from '@/components/pwa/UpdateButton';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({ title, showBack, onMenuClick, rightAction }: MobileHeaderProps) {
  const navigate = useNavigate();
  const { hasRole, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { 
      title: 'Dashboard', 
      url: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['admin', 'operacional', 'motorista', 'financeiro']
    },
    { 
      title: 'Veículos', 
      url: '/veiculos', 
      icon: Truck,
      roles: ['admin', 'operacional']
    },
    { 
      title: 'Motoristas', 
      url: '/motoristas', 
      icon: Users,
      roles: ['admin', 'operacional']
    },
    { 
      title: 'Viagens', 
      url: '/viagens', 
      icon: MapPin,
      roles: ['admin', 'operacional', 'motorista']
    },
    { 
      title: 'Fretes', 
      url: '/fretes', 
      icon: FileText,
      roles: ['admin', 'operacional', 'financeiro']
    },
    { 
      title: 'Acertos', 
      url: '/acertos', 
      icon: Receipt,
      roles: ['admin', 'motorista', 'financeiro']
    },
    { 
      title: 'Estoque', 
      url: '/estoque', 
      icon: Package,
      roles: ['admin', 'operacional']
    },
    { 
      title: 'Mecânicos', 
      url: '/mecanicos', 
      icon: Wrench,
      roles: ['admin', 'operacional']
    },
    { 
      title: 'Manutenções', 
      url: '/manutencoes', 
      icon: Settings,
      roles: ['admin', 'operacional']
    },
    { 
      title: 'Pneus', 
      url: '/pneus', 
      icon: Circle,
      roles: ['admin', 'operacional']
    },
    { 
      title: 'Abastecimentos', 
      url: '/abastecimentos', 
      icon: Fuel,
      roles: ['admin', 'operacional']
    },
    { 
      title: 'Relatórios', 
      url: '/relatorios',
      icon: BarChart3,
      roles: ['admin', 'operacional', 'financeiro']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role as any))
  );

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      setIsMenuOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 bg-card border-b border-border backdrop-blur-sm bg-card/95">
        <div className="flex items-center gap-2">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        
        {rightAction && (
          <div className="flex items-center gap-2">
            {rightAction}
          </div>
        )}
      </header>

      {/* Menu Drawer */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Logística Flash</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex-1 p-4 space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
              
              <div className="px-3 py-2">
                <UpdateButton 
                  variant="ghost" 
                  size="default"
                  showLabel={true}
                  className="w-full justify-start"
                />
              </div>
              
              <NavLink
                to="/install"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-foreground"
                  )
                }
              >
                <Download className="h-5 w-5 shrink-0" />
                <span>Instalar App</span>
              </NavLink>
            </nav>

            <div className="p-4 border-t">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
