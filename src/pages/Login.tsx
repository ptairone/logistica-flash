import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Truck, Fingerprint, Building2 } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signUp, user, roles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { 
    isBiometricAvailable, 
    isBiometricEnabled, 
    enableBiometric, 
    authenticateWithBiometric,
    getSavedEmail,
  } = useBiometricAuth();

  // Tentar auto-login com biometria ao carregar
  useEffect(() => {
    const tryBiometricLogin = async () => {
      if (!user && isBiometricEnabled) {
        setBioLoading(true);
        try {
          const credentials = await authenticateWithBiometric();
          if (credentials) {
            await signIn(credentials.email, credentials.password);
            toast.success('Login automático com biometria realizado!', {
              icon: <Fingerprint className="h-4 w-4" />,
            });
          }
        } catch (error) {
          console.error('Erro no auto-login biométrico:', error);
        } finally {
          setBioLoading(false);
        }
      }
    };

    tryBiometricLogin();
  }, [isBiometricEnabled]);

  // Popular email salvo se existir
  useEffect(() => {
    const savedEmail = getSavedEmail();
    if (savedEmail && !email) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (user && !authLoading) {
      const isMotorista = roles.includes('motorista');
      const isAdmin = roles.includes('admin');
      
      if (isMotorista && !isAdmin) {
        navigate('/motorista/viagens');
      } else if (roles.length > 0) {
        navigate('/dashboard');
      } else {
        // Timeout de 5 segundos para evitar tela travada
        timeoutId = setTimeout(() => {
          toast.warning('Seu usuário ainda não possui permissões configuradas. Entre em contato com o administrador.');
          navigate('/apresentacao');
        }, 5000);
      }
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, authLoading, roles, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha inválidos');
        } else {
          toast.error('Erro ao fazer login: ' + error.message);
        }
        return;
      }

      toast.success('Login realizado com sucesso!');
      
      // Configurar biometria sem bloquear a UI
      setTimeout(async () => {
        if (rememberMe && isBiometricAvailable && !isBiometricEnabled) {
          try {
            const success = await enableBiometric(email, password);
            if (success) {
              toast.success('Biometria configurada! Próximo login será automático.', {
                icon: <Fingerprint className="h-4 w-4" />,
              });
            }
          } catch (error) {
            console.error('Erro ao configurar biometria:', error);
          }
        }
      }, 0);
    } catch (error) {
      toast.error('Erro ao fazer login.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nome) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, nome);
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao criar conta: ' + error.message);
      }
    } else {
      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Truck className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Logística Flash</CardTitle>
          <CardDescription>Sistema de Gestão de Transportes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {isBiometricAvailable && !isBiometricEnabled && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <Fingerprint className="h-4 w-4" />
                      Lembrar-me com biometria
                    </label>
                  </div>
                )}

                {isBiometricEnabled && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    <span>Login automático ativado</span>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || authLoading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nome">Nome completo</Label>
                  <Input
                    id="signup-nome"
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Link para registro de empresa */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link 
            to="/registro-empresa" 
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            <Building2 className="h-3 w-3" />
            Cadastre sua empresa
          </Link>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Teste grátis por 7 dias
        </p>
      </div>
    </div>
  );
}
