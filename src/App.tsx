import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Veiculos from "./pages/Veiculos";
import Motoristas from "./pages/Motoristas";
import Viagens from "./pages/Viagens";
import Fretes from "./pages/Fretes";
import Acertos from "./pages/Acertos";
import AcertoCompleto from "./pages/AcertoCompleto";
import Estoque from "./pages/Estoque";
import Relatorios from "./pages/Relatorios";
import Mecanicos from "./pages/Mecanicos";
import DriverForm from "./pages/DriverForm";
import InstallApp from "./pages/InstallApp";
import MotoristaViagens from "./pages/motorista/Viagens";
import ViagemMotorista from "./pages/motorista/ViagemMotorista";
import AdicionarDespesa from "./pages/motorista/AdicionarDespesa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/install" element={<InstallApp />} />
            
            {/* Rotas do Motorista */}
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
              path="/relatorios"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional', 'financeiro']}>
                  <Relatorios />
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
