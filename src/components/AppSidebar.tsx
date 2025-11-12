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
  Cog,
  Download,
  Fuel,
  Building2,
  ClipboardCheck,
  Circle,
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
import { InstallButton } from '@/components/pwa/InstallButton';
import { UpdateButton } from '@/components/pwa/UpdateButton';
import { APP_VERSION } from '@/lib/version';

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
      roles: ['admin', 'operacional', 'motorista', 'financeiro', 'super_admin']
    },
    { 
      title: 'Veículos', 
      url: '/veiculos', 
      icon: Truck,
      roles: ['admin', 'operacional', 'super_admin']
    },
    { 
      title: 'Motoristas', 
      url: '/motoristas', 
      icon: Users,
      roles: ['admin', 'operacional', 'super_admin']
    },
    { 
      title: 'Viagens', 
      url: '/viagens', 
      icon: MapPin,
      roles: ['admin', 'operacional', 'motorista', 'super_admin']
    },
    { 
      title: 'Fretes', 
      url: '/fretes', 
      icon: FileText,
      roles: ['admin', 'operacional', 'financeiro', 'super_admin']
    },
    { 
      title: 'Acertos', 
      url: '/acertos', 
      icon: Receipt,
      roles: ['admin', 'motorista', 'financeiro', 'super_admin']
    },
    { 
      title: 'Estoque', 
      url: '/estoque', 
      icon: Package,
      roles: ['admin', 'operacional', 'super_admin']
    },
    { 
      title: 'Mecânicos', 
      url: '/mecanicos', 
      icon: Wrench,
      roles: ['admin', 'operacional', 'super_admin']
    },
    { 
      title: 'Manutenções', 
      url: '/manutencoes', 
      icon: Settings,
      roles: ['admin', 'operacional', 'super_admin']
    },
    { 
      title: 'Pneus', 
      url: '/pneus', 
      icon: Circle,
      roles: ['admin', 'operacional', 'super_admin']
    },
    { 
      title: 'Abastecimentos', 
      url: '/abastecimentos', 
      icon: Fuel,
      roles: ['admin', 'operacional', 'super_admin']
    },
    { 
      title: 'Relatórios', 
      url: '/relatorios',
      icon: BarChart3,
      roles: ['admin', 'operacional', 'financeiro', 'super_admin']
    },
  ];

  // Menu items exclusivos do Super Admin
  const superAdminMenuItems = [
    {
      title: 'Painel Super Admin',
      url: '/super-admin/dashboard',
      icon: Cog,
      roles: ['super_admin']
    },
    {
      title: 'Empresas',
      url: '/super-admin/empresas',
      icon: Building2,
      roles: ['super_admin']
    },
    {
      title: 'Solicitações',
      url: '/super-admin/pendentes',
      icon: ClipboardCheck,
      roles: ['super_admin']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role as any))
  );

  const filteredSuperAdminItems = superAdminMenuItems.filter(item =>
    item.roles.some(role => hasRole(role as any))
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'}>
      {/* Logo Header com Gradiente */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 bg-gradient-to-r from-primary/10 to-purple/10">
        {!collapsed && (
          <h2 className="text-lg font-bold font-display bg-gradient-to-r from-primary to-purple bg-clip-text text-transparent">
            ⚡ Logística Flash
          </h2>
        )}
        {collapsed && (
          <span className="text-2xl">⚡</span>
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
                        `relative group transition-all ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'hover:bg-sidebar-accent/50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-primary via-cyan to-purple rounded-r" />
                          )}
                          <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                          {!collapsed && (
                            <span className="transition-colors">{item.title}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Super Admin */}
        {filteredSuperAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSuperAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `relative group transition-all ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'hover:bg-sidebar-accent/50'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-primary via-cyan to-purple rounded-r" />
                            )}
                            <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                            {!collapsed && (
                              <span className="transition-colors">{item.title}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <UpdateButton 
                  variant="ghost" 
                  size="default"
                  showLabel={!collapsed}
                  className="w-full justify-start"
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/install">
                    <Download className="h-4 w-4" />
                    {!collapsed && <span>Instalar App</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            
            {/* Versão do App */}
            {!collapsed && (
              <div className="px-3 py-2 mt-2 border-t border-sidebar-border">
                <p className="text-xs text-muted-foreground text-center">
                  v{APP_VERSION}
                </p>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
