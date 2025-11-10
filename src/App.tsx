import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./lib/auth";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { WelcomeModal } from "./components/pwa/WelcomeModal";
import { UpdateNotification } from "./components/pwa/UpdateNotification";
import Login from "./pages/Login";
import Apresentacao from "./pages/Apresentacao";
import Dashboard from "./pages/Dashboard";
import Veiculos from "./pages/Veiculos";
import Motoristas from "./pages/Motoristas";
import Viagens from "./pages/Viagens";
import Fretes from "./pages/Fretes";
import Manutencoes from "./pages/Manutencoes";
import Acertos from "./pages/Acertos";
import AcertoCompleto from "./pages/AcertoCompleto";
import Estoque from "./pages/Estoque";
import Relatorios from "./pages/Relatorios";
import Mecanicos from "./pages/Mecanicos";
import Abastecimentos from "./pages/Abastecimentos";
import DriverForm from "./pages/DriverForm";
import InstallApp from "./pages/InstallApp";
import MotoristaViagens from "./pages/motorista/Viagens";
import ViagemMotorista from "./pages/motorista/ViagemMotorista";
import AdicionarDespesa from "./pages/motorista/AdicionarDespesa";
import ComprovantesWhatsApp from "./pages/ComprovantesWhatsApp";
import RegistroEmpresa from "./pages/RegistroEmpresa";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import Empresas from "./pages/super-admin/Empresas";
import EmpresasPendentes from "./pages/super-admin/EmpresasPendentes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPrompt />
      <WelcomeModal />
      <UpdateNotification />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/apresentacao" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/apresentacao" element={<Apresentacao />} />
            <Route path="/install" element={<InstallApp />} />
            <Route path="/registro-empresa" element={<RegistroEmpresa />} />
            
            {/* Rotas do Super Admin */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/empresas"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <Empresas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/pendentes"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <EmpresasPendentes />
                </ProtectedRoute>
              }
            />
            
            {/* Rotas do Motorista */}
            <Route
              path="/motorista"
              element={
                <ProtectedRoute requiredRoles={['motorista']}>
                  <MotoristaViagens />
                </ProtectedRoute>
              }
            />
            <Route
              path="/motorista/viagens"
              element={
                <ProtectedRoute requiredRoles={['motorista']}>
                  <MotoristaViagens />
                </ProtectedRoute>
              }
            />
            <Route
              path="/motorista/viagem/:id"
              element={
                <ProtectedRoute requiredRoles={['motorista']}>
                  <ViagemMotorista />
                </ProtectedRoute>
              }
            />
            <Route
              path="/motorista/viagem/:id/adicionar-despesa"
              element={
                <ProtectedRoute requiredRoles={['motorista']}>
                  <AdicionarDespesa />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional', 'financeiro']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/veiculos"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <Veiculos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/motoristas"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <Motoristas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viagens"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <Viagens />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fretes"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional', 'financeiro']}>
                  <Fretes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/acertos"
              element={
                <ProtectedRoute requiredRoles={['admin', 'financeiro']}>
                  <Acertos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/acertos/completo"
              element={
                <ProtectedRoute requiredRoles={['admin', 'financeiro']}>
                  <AcertoCompleto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estoque"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <Estoque />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mecanicos"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <Mecanicos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manutencoes"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <Manutencoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional', 'financeiro']}>
                  <Relatorios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/abastecimentos"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <Abastecimentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/comprovantes-whatsapp"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional']}>
                  <ComprovantesWhatsApp />
                </ProtectedRoute>
              }
            />
            
            {/* Rota pública para formulário do motorista */}
            <Route path="/p/viagem/:viagemId" element={<DriverForm />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
