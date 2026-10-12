import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Building2, 
  Activity,
  Layers
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList },
  { path: '/usuarios', label: 'Usuários', icon: Users },
  { path: '/clientes', label: 'Clientes', icon: Building2 },
  { path: '/status', label: 'Status da API', icon: Activity },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen shrink-0 border-r border-slate-800">
      {/* Brand / Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Layers size={22} />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight block">FieldOps</span>
          <span className="text-xs text-slate-400 block -mt-1">SaaS Gestão em Campo</span>
        </div>
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
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="truncate font-mono">FieldOps v0.0.1</p>
      </div>
    </aside>
  );
}
