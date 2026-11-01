import { NavLink, useLocation } from 'react-router-dom';
import { ClipboardList, Clock, Map, Sparkles } from 'lucide-react';

export default function NavegacaoOperacional() {
  const location = useLocation();

  const abas = [
    {
      path: '/ordens',
      label: 'Lista de Chamados',
      icon: ClipboardList,
      descricao: 'Visão Analítica & Kanban'
    },
    {
      path: '/linha-do-tempo',
      label: 'Linha do Tempo (Gantt)',
      icon: Clock,
      descricao: 'Despacho & Alocação 24h'
    },
    {
      path: '/mapa',
      label: 'Mapa em Tempo Real',
      icon: Map,
      descricao: 'Geolocalização & Rotas'
    }
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 hidden md:inline">
          Despacho:
        </span>
        {abas.map((aba) => {
          const Icon = aba.icon;
          const isActive = location.pathname === aba.path;

          return (
            <NavLink
              key={aba.path}
              to={aba.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon size={15} />
              <span>{aba.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-2 text-2xs text-slate-500 font-medium px-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Central de Operações Integrada</span>
      </div>
    </div>
  );
}
