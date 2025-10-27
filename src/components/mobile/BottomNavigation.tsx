import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Receipt, 
  BarChart3,
  User
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

export function BottomNavigation() {
  const { hasRole } = useAuth();

  const navItems: NavItem[] = [
    {
      title: 'Início',
      url: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'operacional', 'motorista', 'financeiro']
    },
    {
      title: 'Viagens',
      url: '/viagens',
      icon: MapPin,
      roles: ['admin', 'operacional', 'motorista']
    },
    {
      title: 'Acertos',
      url: '/acertos',
      icon: Receipt,
      roles: ['admin', 'motorista', 'financeiro']
    },
    {
      title: 'Relatórios',
      url: '/relatorios',
      icon: BarChart3,
      roles: ['admin', 'operacional', 'financeiro']
    },
    {
      title: 'Perfil',
      url: '/perfil',
      icon: User,
      roles: ['admin', 'operacional', 'motorista', 'financeiro']
    },
  ];

  const filteredNavItems = navItems.filter(item =>
    item.roles.some(role => hasRole(role as any))
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors touch-target",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
                  <span className={cn(
                    "text-[10px] font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.title}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
