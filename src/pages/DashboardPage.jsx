import { useEffect, useState } from 'react';
import api from '../services/api';
import { CheckCircle2, Clock, TrendingUp, Layers, RotateCw } from 'lucide-react';

export default function DashboardPage() {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarMetricas = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/ordens-servico');
      setOrdens(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarMetricas();
  }, []);

  const abertas = ordens.filter((o) => o.status === 'ABERTA' || o.status === 'ATRIBUIDA').length;
  const emAtendimento = ordens.filter((o) => o.status === 'EM_DESLOCAMENTO' || o.status === 'EM_ATENDIMENTO').length;
  const concluidas = ordens.filter((o) => o.status === 'CONCLUIDA').length;

  const cards = [
    { title: 'Ordens Pendentes', count: abertas, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Em Execução / Campo', count: emAtendimento, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Concluídas', count: concluidas, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Cadastrado', count: ordens.length, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard Operacional</h1>
          <p className="text-xs sm:text-sm text-slate-500">Métricas consolidadas em tempo real das atividades da sua equipe.</p>
        </div>
        <button
          onClick={carregarMetricas}
          disabled={carregando}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-lg text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCw size={15} className={carregando ? 'animate-spin' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Cards de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {carregando ? '...' : c.count}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloco da Máquina de Estados */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Máquina de Estados Unidirecional</h2>
          <p className="text-xs text-slate-500">Ciclo estrito de conformidade para auditoria em campo</p>
        </div>

        <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-2 text-xs font-mono min-w-max">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md font-semibold">1. Aberta</span>
              <span className="text-slate-400">➔</span>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md font-semibold">2. Atribuída</span>
              <span className="text-slate-400">➔</span>
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-md font-semibold">3. Deslocamento</span>
              <span className="text-slate-400">➔</span>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md font-semibold">4. Atendimento</span>
              <span className="text-slate-400">➔</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-semibold">5. Concluída</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
