import { Navigate } from 'react-router-dom';

/**
 * Página raiz do aplicativo
 * Redireciona para /apresentacao por padrão
 * Esta página não é mais usada diretamente nas rotas
 */
const Index = () => {
  return <Navigate to="/apresentacao" replace />;
};

export default Index;
