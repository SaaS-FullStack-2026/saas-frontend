import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import MobileLayout from './components/layout/MobileLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdensPage from './pages/OrdensPage';
import UsuariosPage from './pages/UsuariosPage';
import ClientesPage from './pages/ClientesPage';
import MobileOSPage from './pages/MobileOSPage';
import StatusCheck from './pages/StatusCheck';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública de Autenticação */}
        <Route path="/login" element={<LoginPage />} />

        {/* Visão Mobile Protegida para Técnicos de Campo */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mobile" element={<MobileLayout />}>
            <Route index element={<MobileOSPage />} />
          </Route>
        </Route>

        {/* Rotas Administrativas Desktop Protegidas (Gestor / Admin) */}
        <Route element={<ProtectedRoute allowedRoles={['GESTOR', 'ADMIN']} />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ordens" element={<OrdensPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="status" element={<StatusCheck />} />
          </Route>
        </Route>

        {/* Redirecionamento de rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
