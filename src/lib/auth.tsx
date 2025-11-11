import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'operacional' | 'motorista' | 'financeiro' | 'mecanico' | 'super_admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: UserRole[];
  empresaId: string | null;
  empresaNome: string | null;
  empresaStatus: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaNome, setEmpresaNome] = useState<string | null>(null);
  const [empresaStatus, setEmpresaStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer fetchUserRoles to avoid blocking the callback
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer fetchUserRoles to avoid blocking
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    setLoading(true);
    try {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('role, empresa_id')
        .eq('user_id', userId);

      if (!error && rolesData) {
        const userRoles = (rolesData as any[]).map((r: any) => r.role as UserRole);
        setRoles(userRoles);
        
        // Se não for super admin, buscar dados da empresa
        const empresaIdValue = (rolesData as any[])[0]?.empresa_id;
        const isSuperAdminUser = userRoles.includes('super_admin');
        
        if (empresaIdValue && !isSuperAdminUser) {
          setEmpresaId(empresaIdValue);
          
          // Buscar dados da empresa
          const { data: empresa } = await supabase
            .from('empresas' as any)
            .select('nome, status, data_fim_trial')
            .eq('id', empresaIdValue)
            .single();
          
          if (empresa) {
            setEmpresaNome((empresa as any).nome);
            
            // Validar trial expirado
            if ((empresa as any).status === 'trial' && new Date() > new Date((empresa as any).data_fim_trial)) {
              setEmpresaStatus('trial_expirado');
              // Opcional: fazer signOut automaticamente
              // await signOut();
              // toast.error('Seu período de teste expirou. Entre em contato para renovar.');
            } else {
              setEmpresaStatus((empresa as any).status);
            }
          }
        } else if (isSuperAdminUser) {
          // Super admin não tem empresa
          setEmpresaId(null);
          setEmpresaNome(null);
          setEmpresaStatus(null);
        }
      } else {
        setRoles([]);
        setEmpresaId(null);
        setEmpresaNome(null);
        setEmpresaStatus(null);
      }
    } catch (error) {
      console.error('Erro ao buscar papéis do usuário:', error);
      setRoles([]);
      setEmpresaId(null);
      setEmpresaNome(null);
      setEmpresaStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setEmpresaId(null);
    setEmpresaNome(null);
    setEmpresaStatus(null);
  };

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = roles.includes('admin');
  const isSuperAdmin = roles.includes('super_admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        empresaId,
        empresaNome,
        empresaStatus,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children, requiredRoles }: { children: ReactNode; requiredRoles?: UserRole[] }) {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (requiredRoles && !requiredRoles.some(role => roles.includes(role))) {
        navigate('/');
      }
    }
  }, [user, roles, loading, navigate, requiredRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user || (requiredRoles && !requiredRoles.some(role => roles.includes(role)))) {
    return null;
  }

  return <>{children}</>;
}
