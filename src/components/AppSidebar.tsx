import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Receipt,
  Package,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Wrench,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/lib/auth';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { hasRole, signOut } = useAuth();
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const collapsed = state === 'collapsed';

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
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'}>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        {!collapsed && (
          <h2 className="text-lg font-bold text-sidebar-foreground">
            Logística Flash
          </h2>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
