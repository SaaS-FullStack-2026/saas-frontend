import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Building2, 
  Activity,
  Layers,
  Smartphone,
  X
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList },
  { path: '/usuarios', label: 'Usuários', icon: Users },
  { path: '/clientes', label: 'Clientes', icon: Building2 },
  { path: '/status', label: 'Status da API', icon: Activity },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col h-screen shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Brand / Logo + Botão Fechar no Mobile */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Layers size={22} />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block">FieldOps</span>
            <span className="text-xs text-slate-400 block -mt-1">SaaS Gestão em Campo</span>
          </div>
        </div>

        {/* Botão de Fechar exclusivo do mobile */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
          title="Fechar Menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold uppercase text-slate-400 px-3 mb-2 tracking-wider">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Divisor e Atalho para Modo Técnico */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <div className="text-xs font-semibold uppercase text-slate-400 px-3 mb-2 tracking-wider">
            Visão de Campo
          </div>
          <NavLink
            to="/mobile"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-950/40 hover:text-amber-300 transition-colors"
          >
            <Smartphone size={18} />
            <span>Modo Técnico Mobile</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="truncate font-mono">FieldOps v0.0.1</p>
      </div>
    </aside>
  );
}
