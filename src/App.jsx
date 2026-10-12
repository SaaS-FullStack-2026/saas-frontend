import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdensPage from './pages/OrdensPage';
import UsuariosPage from './pages/UsuariosPage';
import ClientesPage from './pages/ClientesPage';
import StatusCheck from './pages/StatusCheck';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública de Autenticação */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Autenticadas dentro da Casca Principal */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="ordens" element={<OrdensPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="status" element={<StatusCheck />} />
        </Route>

        {/* Fallback de rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
