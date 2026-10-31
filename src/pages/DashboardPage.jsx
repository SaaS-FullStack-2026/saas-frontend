import { useEffect, useState } from 'react';
import api from '../services/api';
import { CheckCircle2, Clock, TrendingUp, Layers, RotateCw, AlertTriangle, Star, Wrench } from 'lucide-react';

export default function DashboardPage() {
  const [ordens, setOrdens] = useState([]);
  const [totalEquipamentos, setTotalEquipamentos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarMetricas = async () => {
    try {
      setCarregando(true);
      const [resOrdens, resEqp] = await Promise.all([
        api.get('/ordens-servico', { timeout: 8000 }),
        api.get('/equipamentos', { timeout: 8000 }).catch(() => ({ data: [] }))
      ]);
      setOrdens(resOrdens.data || []);
      setTotalEquipamentos(resEqp.data?.length || 0);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setErro('Não foi possível conectar com o servidor para obter métricas.');
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

  const ordensComAvaliacao = ordens.filter((o) => o.avaliacaoNota != null);
  const mediaCsat = ordensComAvaliacao.length > 0 
    ? (ordensComAvaliacao.reduce((acc, o) => acc + o.avaliacaoNota, 0) / ordensComAvaliacao.length).toFixed(1)
    : '5.0';

  const cards = [
    { title: 'Ordens Pendentes', count: abertas, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Em Execução / Campo', count: emAtendimento, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Concluídas', count: concluidas, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Satisfação CSAT', count: `${mediaCsat} ⭐`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', sub: `${ordensComAvaliacao.length} avaliações` },
    { title: 'Ativos Cadastrados', count: totalEquipamentos, icon: Wrench, color: 'text-cyan-600', bg: 'bg-cyan-50', sub: 'Com QR Code' },
    { title: 'Total de Ordens', count: ordens.length, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const passosMaquinaEstados = [
    { label: '1. Aberta', bg: 'bg-amber-100 hover:bg-amber-200 text-amber-800' },
    { label: '2. Atribuída', bg: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
    { label: '3. Deslocamento', bg: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800' },
    { label: '4. Atendimento', bg: 'bg-purple-100 hover:bg-purple-200 text-purple-800' },
    { label: '5. Concluída', bg: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' },
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
          className={`self-start sm:self-auto inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all ${
            carregando ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'
          }`}
        >
          <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
          <span>{carregando ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
      </div>

      {/* Alerta de Erro de Conexão */}
      {erro && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>{erro}</span>
          </div>
          <button
            onClick={carregarMetricas}
            className="text-xs font-semibold text-rose-700 underline hover:text-rose-900 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Cards de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 min-h-[110px]">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{c.title}</p>
                <div className={`p-2 rounded-lg ${c.bg} ${c.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-2">
                {carregando ? (
                  <div className="h-7 w-14 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {c.count}
                  </h3>
                )}
                {c.sub && <span className="text-[10px] text-slate-400 block mt-0.5">{c.sub}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloco da Máquina de Estados Interativa */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Máquina de Estados Unidirecional</h2>
          <p className="text-xs text-slate-500">Ciclo estrito de conformidade para auditoria em campo</p>
        </div>

        <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-2 text-xs font-mono min-w-max">
              {passosMaquinaEstados.map((passo, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${passo.bg} shadow-2xs active:scale-95`}>
                    {passo.label}
                  </span>
                  {idx < passosMaquinaEstados.length - 1 && (
                    <span className="text-slate-400 font-bold">➔</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}