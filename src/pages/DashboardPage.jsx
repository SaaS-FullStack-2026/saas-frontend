import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NovaOSModal from '../components/NovaOSModal';
import DetalhesOSModal from '../components/DetalhesOSModal';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Layers, 
  RotateCw, 
  AlertTriangle, 
  Star, 
  Wrench, 
  Plus, 
  Map, 
  Users, 
  Building2, 
  ChevronRight, 
  Sparkles,
  MapPin,
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';

function obterDataLocalHoje() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function calcularAtraso(os) {
  if (!os?.dataAgendamento || os.status === 'CONCLUIDA' || os.status === 'CANCELADA') {
    return { atrasada: false };
  }

  const agora = new Date();
  const dataAg = new Date(os.dataAgendamento);

  const pad = (n) => String(n).padStart(2, '0');
  const dataAgStr = `${dataAg.getFullYear()}-${pad(dataAg.getMonth() + 1)}-${pad(dataAg.getDate())}`;
  const hojeStr = obterDataLocalHoje();
  if (dataAgStr > hojeStr) {
    return { atrasada: false };
  }

  const deslocamentoMinutos = os.tempoDeslocamentoMinutos || 30;
  const horaSaidaPrevista = new Date(dataAg.getTime() - deslocamentoMinutos * 60000);

  if (agora > horaSaidaPrevista && (os.status === 'ABERTA' || os.status === 'ATRIBUIDA')) {
    const minutos = Math.max(1, Math.round((agora - horaSaidaPrevista) / 60000));
    return {
      atrasada: true,
      tipo: 'DESLOCAMENTO',
      minutosAtraso: minutos,
      mensagem: `Deveria ter iniciado trânsito há ${minutos}m`
    };
  }

  if (agora > dataAg && os.status !== 'EM_ATENDIMENTO') {
    const minutos = Math.max(1, Math.round((agora - dataAg) / 60000));
    return {
      atrasada: true,
      tipo: 'ATENDIMENTO',
      minutosAtraso: minutos,
      mensagem: `Atendimento atrasado há ${minutos}m`
    };
  }

  return { atrasada: false };
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [ordens, setOrdens] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [totalEquipamentos, setTotalEquipamentos] = useState(0);
  const [metricasBI, setMetricasBI] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Modais
  const [modalNovaOSAberto, setModalNovaOSAberto] = useState(false);
  const [osSelecionada, setOsSelecionada] = useState(null);

  const carregarMetricas = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const [resOrdens, resEqp, resUsuarios, resBI] = await Promise.all([
        api.get('/ordens-servico', { timeout: 8000 }),
        api.get('/equipamentos', { timeout: 8000 }).catch(() => ({ data: [] })),
        api.get('/usuarios', { timeout: 8000 }).catch(() => ({ data: [] })),
        api.get('/ordens-servico/bi-metricas', { timeout: 8000 }).catch(() => ({ data: null }))
      ]);

      setOrdens(resOrdens.data || []);
      setTotalEquipamentos(resEqp.data?.length || 0);
      setUsuarios(resUsuarios.data || []);
      if (resBI?.data) {
        setMetricasBI(resBI.data);
      }
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

  const tecnicos = useMemo(() => {
    return usuarios.filter((u) => (u.perfil || '').toUpperCase() === 'AGENTE');
  }, [usuarios]);

  // Contagens principais
  const abertas = ordens.filter((o) => o.status === 'ABERTA' || o.status === 'ATRIBUIDA').length;
  const emAtendimento = ordens.filter((o) => o.status === 'EM_DESLOCAMENTO' || o.status === 'EM_ATENDIMENTO').length;
  const concluidas = ordens.filter((o) => o.status === 'CONCLUIDA').length;

  const ordensComAvaliacao = ordens.filter((o) => o.avaliacaoNota != null);
  const mediaCsat = ordensComAvaliacao.length > 0 
    ? (ordensComAvaliacao.reduce((acc, o) => acc + o.avaliacaoNota, 0) / ordensComAvaliacao.length).toFixed(1)
    : '5.0';

  // Identificação de Ordens em Atraso e Críticas
  const ordensCriticas = useMemo(() => {
    return ordens
      .map((o) => ({ ...o, atrasoInfo: calcularAtraso(o) }))
      .filter((o) => o.atrasoInfo.atrasada || o.prioridade === 'CRITICA' || o.prioridade === 'ALTA')
      .slice(0, 6);
  }, [ordens]);

  // Status dos Técnicos em Campo Agora
  const statusTecnicos = useMemo(() => {
    return tecnicos.slice(0, 6).map((t) => {
      const ordensDoTecnico = ordens.filter((o) => o.agente?.id === t.id);
      const emExecucao = ordensDoTecnico.find((o) => o.status === 'EM_ATENDIMENTO' || o.status === 'EM_DESLOCAMENTO');
      const concluidasTec = ordensDoTecnico.filter((o) => o.status === 'CONCLUIDA');

      let localTexto = 'Na Sede (Base de Despacho)';
      let cor = 'text-blue-700 bg-blue-50 border-blue-200';
      let statusLabel = 'Disponível';

      if (emExecucao) {
        if (emExecucao.status === 'EM_ATENDIMENTO') {
          localTexto = `Em atendimento: ${emExecucao.cliente?.nome || 'Cliente'}`;
          cor = 'text-purple-700 bg-purple-50 border-purple-200';
          statusLabel = 'Em Atendimento';
        } else {
          localTexto = `A caminho de: ${emExecucao.cliente?.nome || 'Cliente'}`;
          cor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
          statusLabel = 'Em Trânsito';
        }
      } else if (concluidasTec.length > 0) {
        const ultima = concluidasTec[concluidasTec.length - 1];
        localTexto = `Último local: ${ultima.cliente?.nome || 'Cliente'}`;
        cor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        statusLabel = 'Concluída';
      }

      return {
        tecnico: t,
        localTexto,
        cor,
        statusLabel,
        tarefasTotal: ordensDoTecnico.length
      };
    });
  }, [tecnicos, ordens]);

  const cards = [
    { title: 'Ordens Pendentes', count: abertas, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Aguardando Despacho' },
    { title: 'Em Execução / Campo', count: emAtendimento, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Em Trânsito / Atendimento' },
    { title: 'Concluídas com Sucesso', count: concluidas, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Atendimentos Finalizados' },
    { title: 'Pontualidade (BI)', count: `${metricasBI?.pontualidadePercentual != null ? metricasBI.pontualidadePercentual.toFixed(1) : '100'}%`, icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50', sub: `${metricasBI?.totalAtrasadas || 0} atrasos detectados` },
    { title: 'Satisfação CSAT', count: `${mediaCsat} ⭐`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', sub: `${ordensComAvaliacao.length} avaliações coletadas` },
    { title: 'Ativos Cadastrados', count: totalEquipamentos, icon: Wrench, color: 'text-cyan-600', bg: 'bg-cyan-50', sub: 'Com QR Code e Histórico' },
  ];

  const passosMaquinaEstados = [
    { label: '1. Aberta', bg: 'bg-amber-100 text-amber-800' },
    { label: '2. Atribuída', bg: 'bg-blue-100 text-blue-800' },
    { label: '3. Deslocamento', bg: 'bg-indigo-100 text-indigo-800' },
    { label: '4. Atendimento', bg: 'bg-purple-100 text-purple-800' },
    { label: '5. Concluída', bg: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Cabeçalho do Cockpit de Comando */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Activity size={18} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cockpit de Comando Operacional
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visão consolidada de despacho, métricas em tempo real e monitoramento das equipes de campo.
          </p>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setModalNovaOSAberto(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Nova O.S.</span>
          </button>

          <button
            onClick={() => navigate('/linha-do-tempo')}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <Clock size={15} className="text-blue-600" />
            <span>Linha do Tempo</span>
          </button>

          <button
            onClick={() => navigate('/mapa')}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <Map size={15} className="text-emerald-600" />
            <span>Mapa ao Vivo</span>
          </button>

          <button
            onClick={carregarMetricas}
            disabled={carregando}
            className="p-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs cursor-pointer transition-colors"
            title="Atualizar dados"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
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

      {/* Grid de KPIs Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300 min-h-[115px]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.title}</p>
                <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                  <Icon size={17} />
                </div>
              </div>
              <div className="mt-2">
                {carregando ? (
                  <div className="h-7 w-16 bg-slate-200 rounded-lg animate-pulse" />
                ) : (
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {c.count}
                  </h3>
                )}
                {c.sub && <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{c.sub}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Central Dividida: Radar de Chamados Críticos & Monitor de Técnicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bloco 1: Radar de Chamados Críticos & Em Atraso */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span>Radar de Atenção Operacional</span>
              </h2>
              <p className="text-2xs text-slate-400">Ordens em atraso de deslocamento ou com prioridade crítica</p>
            </div>
            <button
              onClick={() => navigate('/ordens')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver todas</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {ordensCriticas.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-emerald-700">✓ Operação 100% no Prazo!</p>
                <p className="text-slate-400">Nenhum chamado com atraso registrado ou prioridade pendente.</p>
              </div>
            ) : (
              ordensCriticas.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setOsSelecionada(o)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-blue-600">#{o.id}</span>
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 truncate">
                        {o.titulo}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 truncate flex items-center gap-1">
                      <Building2 size={11} className="text-slate-400 shrink-0" />
                      <span>{o.cliente?.nome || 'Cliente N/D'}</span>
                      {o.agente && <span className="text-slate-400">• Técnico: {o.agente.nome}</span>}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {o.atrasoInfo.atrasada ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full border border-rose-200 animate-pulse">
                        <AlertTriangle size={10} />
                        <span>{o.atrasoInfo.minutosAtraso}m atraso</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                        {o.prioridade}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bloco 2: Monitor dos Técnicos em Campo Agora */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <span>Equipe em Campo Agora</span>
              </h2>
              <p className="text-2xs text-slate-400">Localização instantânea dos técnicos em operação</p>
            </div>
            <button
              onClick={() => navigate('/cadastros?tab=equipe')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Gerenciar</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {statusTecnicos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Nenhum técnico cadastrado como Agente de Campo.
              </div>
            ) : (
              statusTecnicos.map((item) => (
                <div
                  key={item.tecnico.id}
                  onClick={() => navigate('/mapa')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {item.tecnico.nome.charAt(0)}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 block truncate">
                        {item.tecnico.nome}
                      </span>
                      <span className="text-2xs text-slate-400 block truncate">
                        {item.localTexto}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.cor}`}>
                      {item.statusLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {item.tarefasTotal} tarefas hoje
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Máquina de Estados e Conformidade */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield size={16} className="text-indigo-600" />
              <span>Fluxo de Conformidade Operacional</span>
            </h2>
            <p className="text-2xs text-slate-400">Ciclo estrito e auditado para garantia de SLA em campo</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-2 font-mono min-w-max">
              {passosMaquinaEstados.map((passo, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg font-bold ${passo.bg} shadow-2xs`}>
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

      {/* Modal de Nova OS */}
      <NovaOSModal
        isOpen={modalNovaOSAberto}
        onClose={() => setModalNovaOSAberto(false)}
        onOSCriada={() => {
          setModalNovaOSAberto(false);
          carregarMetricas();
        }}
      />

      {/* Modal de Detalhes da OS */}
      <DetalhesOSModal
        os={osSelecionada}
        isOpen={Boolean(osSelecionada)}
        onClose={() => setOsSelecionada(null)}
        onOSAtualizada={carregarMetricas}
      />
    </div>
  );
}
