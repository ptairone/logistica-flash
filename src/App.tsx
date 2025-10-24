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
import Estoque from "./pages/Estoque";
import Relatorios from "./pages/Relatorios";
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
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
                <ProtectedRoute requiredRoles={['admin', 'operacional', 'motorista']}>
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
                <ProtectedRoute requiredRoles={['admin', 'motorista', 'financeiro']}>
                  <Acertos />
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
              path="/relatorios"
              element={
                <ProtectedRoute requiredRoles={['admin', 'operacional', 'financeiro']}>
                  <Relatorios />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
