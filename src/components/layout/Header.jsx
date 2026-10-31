import { useNavigate } from 'react-router-dom';
import { Bell, UserCircle, Building, LogOut, Menu } from 'lucide-react';

export default function Header({ onOpenSidebar }) {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const getPerfilLabel = (perfil) => {
    switch (perfil) {
      case 'GESTOR': return 'Gestor Operacional';
      case 'ADMIN': return 'Administrador';
      case 'AGENTE': return 'Técnico de Campo';
      default: return 'Usuário do Sistema';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0 shadow-xs">
      {/* Botão Hambúrguer (Mobile) + Tenant Info */}
      <div className="flex items-center gap-3">
        {/* Botão Menu Hambúrguer para telas mobile */}
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
          title="Abrir Menu"
        >
          <Menu size={22} />
        </button>

        {/* Badge do Tenant */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 text-slate-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium border border-slate-200">
          <Building size={14} className="text-slate-500 shrink-0" />
          <span className="truncate max-w-[130px] sm:max-w-xs">
            <strong className="font-semibold text-slate-900">{user.empresaNome || 'TechOps'}</strong> Matriz
          </span>
        </div>
      </div>

      {/* User, Notificações & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          title="Notificações" 
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
        >
          <Bell size={18} />
          <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        <div className="h-5 sm:h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2 sm:gap-3">
          <UserCircle size={28} className="text-slate-400 sm:w-8 sm:h-8" />
          <div className="hidden lg:block text-left">
            <span className="block text-sm font-semibold text-slate-800 leading-tight">
              {user.nome || 'Carlos Silva'}
            </span>
            <span className="block text-xs text-slate-500 leading-tight">
              {getPerfilLabel(user.perfil)}
            </span>
          </div>
        </div>

        <div className="h-5 sm:h-6 w-px bg-slate-200"></div>

        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          title="Sair do Sistema"
          className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
