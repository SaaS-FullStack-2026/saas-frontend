import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const cards = [
    { title: 'Ordens em Aberto', count: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Em Atendimento', count: '5', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Concluídas Hoje', count: '28', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'SLA em Risco', count: '2', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Operacional</h1>
        <p className="text-sm text-slate-500">Métricas em tempo real das atividades de campo e SLAs da sua organização.</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{c.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{c.count}</h3>
              </div>
              <div className={`p-3 rounded-lg ${c.bg} ${c.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloco de Atividades Recentes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Visão Geral da Máquina de Estados</h2>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600 flex items-center justify-between">
          <span className="font-semibold text-slate-700">Fluxo da Tarefa:</span>
          <span className="font-mono text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
            Aberta ➔ Atribuída ➔ Em Deslocamento ➔ Em Atendimento ➔ Concluída
          </span>
        </div>
      </div>
    </div>
  );
}
