import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.perfil)) {
        // Redirecionamento de segurança baseado no papel
        return user.perfil === 'AGENTE' 
          ? <Navigate to="/mobile" replace />
          : <Navigate to="/dashboard" replace />;
      }
    }

    return <Outlet />;
  } catch (e) {
    console.error('Erro ao verificar sessão do usuário:', e);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}
