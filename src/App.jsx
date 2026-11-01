import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import MobileLayout from './components/layout/MobileLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdensPage from './pages/OrdensPage';
import MapaPage from './pages/MapaPage';
import LinhaDoTempoPage from './pages/LinhaDoTempoPage';
import CadastrosPage from './pages/CadastrosPage';
import EquipamentosPage from './pages/EquipamentosPage';
import UsuariosPage from './pages/UsuariosPage';
import ClientesPage from './pages/ClientesPage';
import MobileOSPage from './pages/MobileOSPage';
import RastreioPublicoPage from './pages/RastreioPublicoPage';
import StatusCheck from './pages/StatusCheck';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública de Autenticação */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota Pública de Rastreio do Chamado para o Cliente Final (Estilo Uber) */}
        <Route path="/rastreio/:codigo" element={<RastreioPublicoPage />} />

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
            <Route path="mapa" element={<MapaPage />} />
            <Route path="linha-do-tempo" element={<LinhaDoTempoPage />} />
            <Route path="cadastros" element={<CadastrosPage />} />
            {/* Redirecionamentos da Tríade de Cadastros para a Central Unificada */}
            <Route path="equipamentos" element={<Navigate to="/cadastros?tab=ativos" replace />} />
            <Route path="usuarios" element={<Navigate to="/cadastros?tab=equipe" replace />} />
            <Route path="clientes" element={<Navigate to="/cadastros?tab=clientes" replace />} />
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
