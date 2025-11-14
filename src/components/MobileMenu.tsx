import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Receipt,
  Package,
  FileText,
  LogOut,
  Wrench,
  Settings,
  Circle,
  Fuel,
  BarChart3,
  Combine,
} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { hasRole, signOut } = useAuth();

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
      title: 'Reboques', 
      url: '/reboques', 
      icon: Combine,
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
    await signOut();
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>Logística Flash</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <nav className="space-y-1">
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
