import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  X, 
  Play, 
  Pause, 
  Zap, 
  RotateCw, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Bot, 
  Clock, 
  Sparkles,
  Layers,
  Check,
  Users,
  MapPin,
  Sprout
} from 'lucide-react';

export default function SimuladorModal({ isOpen, onClose, onCicloExecutado }) {
  const [status, setStatus] = useState({
    ativo: false,
    intervaloSegundos: 300,
    ciclosExecutados: 0,
    totalOrdensCriadas: 0,
    totalTransicoesRealizadas: 0,
    totalAtrasosGerados: 0,
    totalTecnicosDisponiveis: 0,
    totalClientesDisponiveis: 0,
    ultimoCiclo: null,
    logsRecentes: []
  });

  const [cadencia, setCadencia] = useState(300);
  const [carregando, setCarregando] = useState(false);
  const [executandoCiclo, setExecutandoCiclo] = useState(false);
  const [povoandoCenario, setPovoandoCenario] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [erro, setErro] = useState(null);

  const carregarStatus = async () => {
    try {
      const res = await api.get('/simulacao/status');
      if (res.data) {
        setStatus(res.data);
        if (res.data.intervaloSegundos) {
          setCadencia(res.data.intervaloSegundos);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar status do simulador:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarStatus();
      const interval = setInterval(carregarStatus, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const iniciarSimulacao = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await api.post(`/simulacao/iniciar?intervaloSegundos=${cadencia}`);
      setStatus(res.data);
      onCicloExecutado?.();
    } catch (err) {
      setErro('Não foi possível iniciar a simulação.');
    } finally {
      setCarregando(false);
    }
  };

  const pararSimulacao = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await api.post('/simulacao/parar');
      setStatus(res.data);
      onCicloExecutado?.();
    } catch (err) {
      setErro('Não foi possível pausar a simulação.');
    } finally {
      setCarregando(false);
    }
  };

  const executarCicloManual = async () => {
    try {
      setExecutandoCiclo(true);
      setErro(null);
      await api.post('/simulacao/executar-ciclo');
      await carregarStatus();
      onCicloExecutado?.();
    } catch (err) {
      setErro('Erro ao executar ciclo manual.');
    } finally {
      setExecutandoCiclo(false);
    }
  };

  const povoarCenario = async () => {
    try {
      setPovoandoCenario(true);
      setErro(null);
      setMensagemSucesso(null);
      const res = await api.post('/simulacao/povoar-cenario');
      await carregarStatus();
      onCicloExecutado?.();
      setMensagemSucesso(`Base provisionada com sucesso! +${res.data?.tecnicosCriados || 0} técnicos, +${res.data?.clientesCriados || 0} clientes e +${res.data?.equipamentosCriados || 0} equipamentos em SP adicionados.`);
      setTimeout(() => setMensagemSucesso(null), 6000);
    } catch (err) {
      setErro('Erro ao auto-popular base de simulação.');
    } finally {
      setPovoandoCenario(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Simulador Operacional em Tempo Real</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  status.ativo 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' 
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}>
                  {status.ativo ? '● Rodando em Background' : '○ Pausado'}
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-0.5">
                Bot Despachante & Bots Colaboradores gerando e movimentando a operação 24 horas por dia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
              <span>{erro}</span>
              <button onClick={() => setErro(null)} className="font-bold">✕</button>
            </div>
          )}

          {mensagemSucesso && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{mensagemSucesso}</span>
              </div>
              <button onClick={() => setMensagemSucesso(null)} className="font-bold cursor-pointer">✕</button>
            </div>
          )}

          {/* Banner de Ecossistema Autônomo e Auto-Provisioning */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-blue-600/10 text-blue-600 rounded-xl mt-0.5">
                <Sprout size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">Ecossistema de Simulação (São Paulo):</span>
                  <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg shadow-2xs">
                    👷 {status.totalTecnicosDisponiveis || 0} Técnicos de Campo
                  </span>
                  <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg shadow-2xs">
                    📍 {status.totalClientesDisponiveis || 0} Clientes com GPS
                  </span>
                </div>
                <p className="text-2xs text-slate-500 mt-1">
                  Não é necessário cadastrar nada manualmente: o motor auto-provisiona a frota e locais em SP automaticamente para a simulação rodar 24h.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={povoandoCenario}
              onClick={povoarCenario}
              className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
              title="Injeta ou atualiza a frota de 5 técnicos e 8 clientes com coordenadas GPS em São Paulo"
            >
              <Sprout size={14} className={povoandoCenario ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
              <span>{povoandoCenario ? 'Provisionando...' : '🌱 Auto-popular Equipe & Locais'}</span>
            </button>
          </div>

          {/* Painel de Controles */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Cadência dos Ciclos:</span>
                <select
                  value={cadencia}
                  onChange={(e) => setCadencia(Number(e.target.value))}
                  disabled={status.ativo}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value={60}>A cada 1 minuto (Acelerado)</option>
                  <option value={300}>A cada 5 minutos (Padrão)</option>
                  <option value={600}>A cada 10 minutos</option>
                  <option value={1800}>A cada 30 minutos</option>
                  <option value={3600}>A cada 1 hora</option>
                </select>
              </div>

              {/* Ações de Play / Pause e Disparo Imediato */}
              <div className="flex items-center gap-2 flex-wrap">
                {status.ativo ? (
                  <button
                    type="button"
                    disabled={carregando}
                    onClick={pararSimulacao}
                    className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Pause size={14} />
                    <span>Pausar Simulação</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={carregando}
                    onClick={iniciarSimulacao}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Play size={14} />
                    <span>Iniciar Loop 24h</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={executandoCiclo}
                  onClick={executarCicloManual}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
                  title="Executa 1 ciclo imediatamente sem precisar esperar o tempo"
                >
                  <Zap size={14} className={executandoCiclo ? 'animate-bounce text-amber-300' : ''} />
                  <span>{executandoCiclo ? 'Processando Ciclo...' : '⚡ Executar Ciclo Agora'}</span>
                </button>
              </div>
            </div>

            <p className="text-2xs text-slate-500">
              * O <strong>Bot Despachante</strong> gera chamados e atribui ao colaborador mais próximo por geolocalização. Os <strong>Bots Colaboradores</strong> realizam deslocamentos, chegam ao local, concluem ordens com CSAT e simulam imprevistos viários reais.
            </p>
          </div>

          {/* Cards de Métricas do Simulador */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Ciclos Rodados</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-900">{status.ciclosExecutados}</span>
                <span className="text-[10px] text-slate-400">rodadas</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">O.S. Criadas</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-blue-700">{status.totalOrdensCriadas}</span>
                <span className="text-[10px] text-blue-600/80">despachadas</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">Transições de Campo</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-emerald-700">{status.totalTransicoesRealizadas}</span>
                <span className="text-[10px] text-emerald-600/80">avanços</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">Atrasos Auditados</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-amber-700">{status.totalAtrasosGerados}</span>
                <span className="text-[10px] text-amber-600/80">imprevistos</span>
              </div>
            </div>
          </div>

          {/* Terminal de Logs ao Vivo dos Bots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Terminal size={15} className="text-slate-600" />
                <span>Log de Ações dos Bots em Tempo Real</span>
              </div>
              <span className="text-2xs text-slate-400">Atualização a cada 3.5s</span>
            </div>

            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-3.5 rounded-xl border border-slate-800 h-64 overflow-y-auto space-y-1.5 shadow-inner">
              {status.logsRecentes.length === 0 ? (
                <p className="text-slate-500 italic py-8 text-center">
                  Nenhum log registrado ainda. Clique em "⚡ Executar Ciclo Agora" para iniciar as ações dos bots!
                </p>
              ) : (
                status.logsRecentes.map((logStr, idx) => {
                  let cor = 'text-slate-300';
                  if (logStr.includes('Bot Despachante')) cor = 'text-cyan-400';
                  else if (logStr.includes('Bot Técnico')) cor = 'text-emerald-400';
                  else if (logStr.includes('Alerta') || logStr.includes('Trânsito')) cor = 'text-amber-400';
                  else if (logStr.includes('concluída')) cor = 'text-green-300 font-semibold';
                  else if (logStr.includes('Erro')) cor = 'text-rose-400';

                  return (
                    <div key={idx} className={`leading-relaxed text-[11px] ${cor}`}>
                      {logStr}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-2xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Motor de Simulação Ativo no Servidor</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
}
