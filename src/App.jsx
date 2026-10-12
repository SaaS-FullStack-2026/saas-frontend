import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import OrdensPage from './pages/OrdensPage';
import UsuariosPage from './pages/UsuariosPage';
import ClientesPage from './pages/ClientesPage';
import StatusCheck from './pages/StatusCheck';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="ordens" element={<OrdensPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="status" element={<StatusCheck />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
