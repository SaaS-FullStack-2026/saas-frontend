import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Map,
  Clock, 
  Database,
  Activity,
  Layers,
  Smartphone,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const gruposNavegacao = [
    {
      titulo: 'Visão Geral',
      itens: [
        { path: '/dashboard', label: 'Dashboard Cockpit', icon: LayoutDashboard }
      ]
    },
    {
      titulo: 'Operações & Despacho',
      itens: [
        { path: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList },
        { path: '/linha-do-tempo', label: 'Linha do Tempo (Gantt)', icon: Clock },
        { path: '/mapa', label: 'Mapa em Tempo Real', icon: Map }
      ]
    },
    {
      titulo: 'Gestão & Cadastros',
      itens: [
        { path: '/cadastros', label: 'Central de Cadastros', icon: Database },
        { path: '/status', label: 'Status da API', icon: Activity }
      ]
    }
  ];

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

      {/* Navigation Links agrupados */}
      <nav className="flex-1 px-4 py-5 space-y-5 overflow-y-auto">
        {gruposNavegacao.map((grupo, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400 px-3 tracking-wider">
              {grupo.titulo}
            </div>
            {grupo.itens.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Divisor e Atalho para Modo Técnico */}
        <div className="pt-3 border-t border-slate-800/80 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400 px-3 tracking-wider">
            Visão de Campo
          </div>
          <NavLink
            to="/mobile"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-800/30 transition-colors"
          >
            <Smartphone size={17} />
            <span>Modo Técnico Mobile</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span className="font-mono text-[10px]">FieldOps Pro</span>
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
        </span>
      </div>
    </aside>
  );
}
