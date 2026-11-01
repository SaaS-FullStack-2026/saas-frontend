import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Route as RouteIcon, User, LogOut, Navigation } from 'lucide-react';

export default function MobileLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-200">
      {/* Header Mobile */}
      <header className="h-14 bg-slate-900 text-white px-5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2 font-bold text-base tracking-tight">
          <Navigation size={18} className="text-blue-400" />
          <span>FieldOps Técnico</span>
        </div>
        <div className="flex items-center gap-2">
          {user.nome && (
            <span className="text-2xs text-slate-400 max-w-[120px] truncate hidden xs:inline">
              {user.nome.split(' ')[0]}
            </span>
          )}
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Navegação Inferior Fixa */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex justify-around items-center h-16 z-30 px-2 shadow-lg">
        <NavLink
          to="/mobile"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full text-xs font-semibold gap-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <RouteIcon size={20} />
          <span>Roteiro do Dia</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className="flex flex-col items-center justify-center w-full h-full text-xs font-semibold text-slate-400 hover:text-slate-600 gap-1 transition-colors"
        >
          <User size={20} />
          <span>Modo Gestor</span>
        </NavLink>
      </nav>
    </div>
  );
}
