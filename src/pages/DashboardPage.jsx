import { useEffect, useState } from 'react';
import api from '../services/api';
import { CheckCircle2, Clock, TrendingUp, Layers, RotateCw, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarMetricas = async () => {
    try {
      setCarregando(true);
      // Tenta buscar os dados com timeout de 5 segundos
      const res = await api.get('/ordens-servico', { timeout: 5000 });
      setOrdens(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      // Exibe aviso amigável para o usuário caso o backend não responda
      alert('Não foi possível conectar com o servidor. Verifique se o back-end em Spring Boot está em execução.');
    } finally {
      // O bloco 'finally' GARANTE que a tela nunca trave no estado "Atualizando..."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between transition-all hover:border-slate-300">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</p>
                {carregando ? (
                  <div className="h-8 w-16 bg-slate-200 rounded-md animate-pulse my-1" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {c.count}
                  </h3>
                )}
              </div>
              <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}>
                <Icon size={24} />
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