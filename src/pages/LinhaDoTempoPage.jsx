import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import DetalhesOSModal from '../components/DetalhesOSModal';
import NavegacaoOperacional from '../components/layout/NavegacaoOperacional';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';
import { 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  User, 
  Building2, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  MapPin,
  GripVertical, 
  Layers, 
  Sparkles,
  History,
  X,
  Loader2,
  ThumbsUp,
  Navigation
} from 'lucide-react';

const HORA_INICIAL_TIMELINE = 0; // 00:00 (Meia-noite)
const HORA_FINAL_TIMELINE = 23;  // 23:00 (Noite)
const HORAS_TIMELINE = Array.from({ length: 24 }, (_, i) => i); // Grade completa de 24 horas (00:00 às 23:00)
const LARGURA_HORA_PX = 115; // 115px por hora para scroll suave

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

  // Apenas considera atraso no dia de hoje ou em datas passadas
  const pad = (n) => String(n).padStart(2, '0');
  const dataAgStr = `${dataAg.getFullYear()}-${pad(dataAg.getMonth() + 1)}-${pad(dataAg.getDate())}`;
  const hojeStr = obterDataLocalHoje();
  if (dataAgStr > hojeStr) {
    return { atrasada: false };
  }

  const deslocamentoMinutos = os.tempoDeslocamentoMinutos || 30;
  const horaSaidaPrevista = new Date(dataAg.getTime() - deslocamentoMinutos * 60000);

  // 1. Já passou do momento previsto para iniciar o trânsito/deslocamento e o técnico ainda não saiu
  if (agora > horaSaidaPrevista && (os.status === 'ABERTA' || os.status === 'ATRIBUIDA')) {
    const minutos = Math.max(1, Math.round((agora - horaSaidaPrevista) / 60000));
    return {
      atrasada: true,
      tipo: 'DESLOCAMENTO',
      minutosAtraso: minutos,
      mensagem: `Deveria ter iniciado deslocamento há ${minutos}m`
    };
  }

  // 2. Já passou da hora agendada de atendimento e ainda não está em atendimento no cliente
  if (agora > dataAg && os.status !== 'EM_ATENDIMENTO') {
    const minutos = Math.max(1, Math.round((agora - dataAg) / 60000));
    return {
      atrasada: true,
      tipo: 'ATENDIMENTO',
      minutosAtraso: minutos,
      mensagem: `Início de atendimento atrasado há ${minutos}m`
    };
  }

  return { atrasada: false };
}

function obterInfoAtivo(os) {
  if (os.equipamento) {
    const cat = getCategoriaInfo(os.equipamento.categoria);
    return { emoji: cat.emoji, nome: os.equipamento.nome, cor: cat.cor };
  }
  const t = ((os.titulo || '') + ' ' + (os.descricao || '')).toLowerCase();
  if (t.includes('ar') || t.includes('split') || t.includes('clima')) {
    return { emoji: '❄️', nome: 'Climatização', cor: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
  }
  if (t.includes('roteador') || t.includes('rede') || t.includes('ti') || t.includes('fibra')) {
    return { emoji: '📶', nome: 'TI & Redes', cor: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  }
  if (t.includes('fria') || t.includes('geladeira') || t.includes('congelad')) {
    return { emoji: '🧊', nome: 'Refrigeração', cor: 'text-blue-700 bg-blue-50 border-blue-200' };
  }
  if (t.includes('dedetiz') || t.includes('praga') || t.includes('isca')) {
    return { emoji: '🛡️', nome: 'Dedetização', cor: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  if (t.includes('elevador') || t.includes('motor')) {
    return { emoji: '⚙️', nome: 'Elevador / Motor', cor: 'text-amber-700 bg-amber-50 border-amber-200' };
  }
  return { emoji: '🔧', nome: 'Ativo Geral', cor: 'text-slate-700 bg-slate-50 border-slate-200' };
}

function obterLocalizacaoAtualColaborador(tecnicoId, ordensDoDia) {
  const ordensTecnico = ordensDoDia
    .filter((o) => o.agente?.id === tecnicoId)
    .sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));

  // 1. Em atendimento ou em deslocamento
  const emAndamento = ordensTecnico.find((o) => o.status === 'EM_ATENDIMENTO' || o.status === 'EM_DESLOCAMENTO');
  if (emAndamento) {
    const cli = emAndamento.cliente?.nome || 'Cliente';
    const bairro = emAndamento.cliente?.bairro ? ` (${emAndamento.cliente.bairro})` : '';
    if (emAndamento.status === 'EM_ATENDIMENTO') {
      return {
        tipo: 'ATENDIMENTO',
        texto: `Em atendimento: ${cli}${bairro}`,
        cor: 'text-purple-700 bg-purple-50 border-purple-200'
      };
    }
    return {
      tipo: 'DESLOCAMENTO',
      texto: `A caminho de: ${cli}${bairro}`,
      cor: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    };
  }

  // 2. Última OS concluída hoje
  const concluidas = ordensTecnico.filter((o) => o.status === 'CONCLUIDA');
  if (concluidas.length > 0) {
    const ultima = concluidas[concluidas.length - 1];
    const cli = ultima.cliente?.nome || 'Cliente';
    const bairro = ultima.cliente?.bairro ? ` (${ultima.cliente.bairro})` : '';
    return {
      tipo: 'ULTIMO_LOCAL',
      texto: `Último local: ${cli}${bairro}`,
      cor: 'text-slate-700 bg-slate-100 border-slate-200'
    };
  }

  // 3. Sem atividades iniciadas hoje -> Sede / Base
  return {
    tipo: 'SEDE',
    texto: 'Prefeitura de SP (Sede / Base)',
    cor: 'text-blue-700 bg-blue-50 border-blue-200'
  };
}

export default function LinhaDoTempoPage() {
  const [dataSelecionada, setDataSelecionada] = useState(obterDataLocalHoje());
  const [tecnicos, setTecnicos] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [metricasBI, setMetricasBI] = useState({
    totalOrdens: 0,
    totalReagendamentos: 0,
    totalAtrasadas: 0,
    pontualidadePercentual: 100
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Drag and Drop & Interações
  const [draggedOS, setDraggedOS] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null); // { tecnicoId, hora }
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [feedbackRecalculo, setFeedbackRecalculo] = useState(null);
  const [exibirFilaEspera, setExibirFilaEspera] = useState(true);

  // Modal Rápido de Sugestão de Técnicos por Proximidade
  const [sugestaoModalOS, setSugestaoModalOS] = useState(null);
  const [sugestoesLista, setSugestoesLista] = useState([]);
  const [carregandoSugestoes, setCarregandoSugestoes] = useState(false);
  const [motivoReatribuicao, setMotivoReatribuicao] = useState('Reatribuição por proximidade geográfica via despacho inteligente');
  const [salvandoReatribuicao, setSalvandoReatribuicao] = useState(false);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const [resUsuarios, resOrdens, resBI] = await Promise.all([
        api.get('/usuarios'),
        api.get('/ordens-servico'),
        api.get('/ordens-servico/bi-metricas').catch(() => ({ data: null }))
      ]);

      const apenasAgentes = (resUsuarios.data || []).filter(
        (u) => (u.perfil || '').toUpperCase() === 'AGENTE'
      );
      setTecnicos(apenasAgentes.length > 0 ? apenasAgentes : (resUsuarios.data || []));
      setOrdens(resOrdens.data || []);
      if (resBI?.data) {
        setMetricasBI(resBI.data);
      }
    } catch (err) {
      console.error('Erro ao carregar linha do tempo:', err);
      setErro('Não foi possível carregar a agenda e colaboradores. Verifique a conexão.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Navegação de Datas
  const mudarDataRelativa = (dias) => {
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia + dias, 12, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    setDataSelecionada(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  const irParaHoje = () => {
    setDataSelecionada(obterDataLocalHoje());
  };

  // Separação de Ordens: do Dia vs Fila de Espera (Sem Técnico)
  const ordensDoDia = useMemo(() => {
    return ordens.filter((o) => {
      if (!o.dataAgendamento) return false;
      const d = new Date(o.dataAgendamento);
      const pad = (n) => String(n).padStart(2, '0');
      const dataOSLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return dataOSLocal === dataSelecionada;
    });
  }, [ordens, dataSelecionada]);

  const ordensAtrasadasHoje = useMemo(() => {
    return ordensDoDia.filter((o) => calcularAtraso(o).atrasada);
  }, [ordensDoDia]);

  const ordensFilaEspera = useMemo(() => {
    return ordens.filter((o) => !o.agente || o.status === 'ABERTA');
  }, [ordens]);

  // Manipulação de Drag and Drop
  const handleDragStart = (e, os) => {
    setDraggedOS(os);
    e.dataTransfer.setData('text/plain', String(os.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, tecnicoId, hora) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverTarget || dragOverTarget.tecnicoId !== tecnicoId || dragOverTarget.hora !== hora) {
      setDragOverTarget({ tecnicoId, hora });
    }
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = async (e, tecnicoId, hora) => {
    e.preventDefault();
    setDragOverTarget(null);

    if (!draggedOS) return;

    try {
      // Monta data exata no fuso local e converte para ISO completo
      const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia, hora, 0, 0);
      const dataIso = dataObj.toISOString();

      // Chamada à API com recálculo inteligente no backend e registro de auditoria
      const res = await api.patch(`/ordens-servico/${draggedOS.id}/reagendar`, {
        agenteId: tecnicoId,
        dataAgendamento: dataIso,
        duracaoEstimadaMinutos: draggedOS.duracaoEstimadaMinutos || 60,
        tempoDeslocamentoMinutos: draggedOS.tempoDeslocamentoMinutos || 30,
        motivo: 'Ajuste manual de grade na linha do tempo'
      });

      const osAtualizada = res.data;
      const horaEfetiva = new Date(osAtualizada.dataAgendamento).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Feedback de recálculo inteligente
      setFeedbackRecalculo({
        titulo: `OS #${osAtualizada.id} Reagendada com Sucesso!`,
        mensagem: `Alocada para ${osAtualizada.agente?.nome} às ${horaEfetiva} com buffer de deslocamento recalculado.`
      });
      setTimeout(() => setFeedbackRecalculo(null), 5000);

      // Atualiza estado local e métricas
      setOrdens((prev) => prev.map((o) => (o.id === osAtualizada.id ? osAtualizada : o)));
      api.get('/ordens-servico/bi-metricas').then((resBI) => {
        if (resBI.data) setMetricasBI(resBI.data);
      }).catch(() => {});
    } catch (err) {
      console.error('Erro ao reagendar OS:', err);
      alert('Não foi possível reagendar a ordem de serviço. Tente novamente.');
    } finally {
      setDraggedOS(null);
    }
  };

  // Funções para Sugestão de Técnicos por Proximidade
  const abrirSugestoesParaOS = async (os, e) => {
    if (e) e.stopPropagation();
    try {
      setSugestaoModalOS(os);
      setCarregandoSugestoes(true);
      setSugestoesLista([]);
      setMotivoReatribuicao('Reatribuição por proximidade geográfica via despacho inteligente');
      const res = await api.get(`/ordens-servico/${os.id}/sugestoes-tecnicos`);
      setSugestoesLista(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar sugestões:', err);
    } finally {
      setCarregandoSugestoes(false);
    }
  };

  const reatribuirParaTecnico = async (sugestao) => {
    if (!sugestaoModalOS) return;
    try {
      setSalvandoReatribuicao(true);
      const res = await api.patch(`/ordens-servico/${sugestaoModalOS.id}/reagendar`, {
        agenteId: sugestao.tecnicoId,
        dataAgendamento: sugestaoModalOS.dataAgendamento || new Date().toISOString(),
        duracaoEstimadaMinutos: sugestaoModalOS.duracaoEstimadaMinutos || 60,
        tempoDeslocamentoMinutos: sugestao.tempoDeslocamentoMinutos || 30,
        motivo: motivoReatribuicao.trim() || 'Reatribuição por proximidade geográfica'
      });

      const osAtualizada = res.data;
      setFeedbackRecalculo({
        titulo: `OS #${osAtualizada.id} reatribuída para ${sugestao.nome}!`,
        mensagem: `Distância estimada: ${sugestao.distanciaKm != null ? sugestao.distanciaKm.toFixed(1) + ' km' : 'N/D'} • Trânsito: ${sugestao.tempoDeslocamentoMinutos} min.`
      });
      setTimeout(() => setFeedbackRecalculo(null), 5000);
      setSugestaoModalOS(null);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao reatribuir OS:', err);
      alert('Não foi possível reatribuir a ordem de serviço.');
    } finally {
      setSalvandoReatribuicao(false);
    }
  };

  // Posição da "Linha do Agora" (se a data selecionada for hoje)
  const isHoje = dataSelecionada === obterDataLocalHoje();
  const agora = new Date();
  const horaAgoraFloat = agora.getHours() + agora.getMinutes() / 60;
  const linhaAgoraLeftPx = (horaAgoraFloat - HORA_INICIAL_TIMELINE) * LARGURA_HORA_PX;

  return (
    <div className="space-y-4">
      {/* Barra de Navegação da Tríade Operacional */}
      <NavegacaoOperacional />

      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            <span>Linha do Tempo Operacional</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Planejamento diário da equipe de campo, monitoramento de rotas e despacho inteligente com auditoria.
          </p>
        </div>

        {/* Controles de Navegação da Data */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-xs">
            <button
              onClick={() => mudarDataRelativa(-1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Dia anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={irParaHoje}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isHoje ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => mudarDataRelativa(1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Próximo dia"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Seletor Nativo de Data */}
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          />

          {/* Alerta de Ordens em Atraso Hoje */}
          {ordensAtrasadasHoje.length > 0 && (
            <div 
              title={`${ordensAtrasadasHoje.length} ordens com deslocamento ou atendimento atrasado hoje`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse shadow-2xs"
            >
              <AlertTriangle size={14} className="text-rose-600 shrink-0" />
              <span>{ordensAtrasadasHoje.length} em Atraso</span>
            </div>
          )}

          <button
            onClick={() => setExibirFilaEspera(!exibirFilaEspera)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              exibirFilaEspera
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers size={14} />
            <span>Fila de Espera ({ordensFilaEspera.length})</span>
          </button>

          <button
            onClick={carregarDados}
            disabled={carregando}
            className="p-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer transition-all"
            title="Atualizar dados"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Cards de Métricas Operacionais & BI (Auditoria de Reagendamentos & Atrasos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Layers size={18} />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total de OS</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">{metricasBI.totalOrdens ?? ordens.length}</span>
              <span className="text-[10px] text-slate-400">chamados</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <History size={18} />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Reagendamentos</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-purple-700">{metricasBI.totalReagendamentos ?? 0}</span>
              <span className="text-[10px] text-purple-600/80 font-medium">auditados</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Atrasos Operacionais</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-rose-700">{metricasBI.totalAtrasadas ?? ordensAtrasadasHoje.length}</span>
              <span className="text-[10px] text-rose-600/80 font-medium">identificados</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pontualidade (BI)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-emerald-700">
                {metricasBI.pontualidadePercentual != null ? metricasBI.pontualidadePercentual.toFixed(1) : '100'}%
              </span>
              <span className="text-[10px] text-emerald-600/80 font-medium">no prazo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback de Recálculo Inteligente */}
      {feedbackRecalculo && (
        <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles size={16} className="text-amber-300" />
            </div>
            <div>
              <span className="font-bold block">{feedbackRecalculo.titulo}</span>
              <span className="text-white/90">{feedbackRecalculo.mensagem}</span>
            </div>
          </div>
          <button
            onClick={() => setFeedbackRecalculo(null)}
            className="text-white/80 hover:text-white p-1 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Fila de Espera (Ordens sem Técnico para Despacho Rápido) */}
      {exibirFilaEspera && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Layers size={15} className="text-amber-600" />
              <span>Fila de Espera • Ordens Aguardando Despacho ({ordensFilaEspera.length})</span>
            </div>
            <span className="text-2xs text-amber-700 font-medium">
              Arraste um chamado para o horário desejado ou clique em Sugerir Técnico
            </span>
          </div>

          {ordensFilaEspera.length === 0 ? (
            <p className="text-xs text-amber-700/80 italic py-2">
              ✓ Nenhuma ordem de serviço pendente de atribuição. Toda a operação está alocada!
            </p>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {ordensFilaEspera.map((o) => {
                const ativo = obterInfoAtivo(o);
                return (
                  <div
                    key={o.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, o)}
                    onClick={() => setOsSelecionada(o)}
                    className="bg-white border border-amber-300/80 hover:border-amber-500 rounded-xl p-3 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing shrink-0 w-68 space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">#{o.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ativo.cor}`}>
                        {ativo.emoji} {ativo.nome.split(' ')[0]}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                      {o.titulo}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                      <Building2 size={12} className="shrink-0 text-slate-400" />
                      <span className="truncate">{o.cliente?.nome || 'Cliente N/D'}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => abrirSugestoesParaOS(o, e)}
                        className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
                        title="Ver sugestão de técnicos mais próximos da área"
                      >
                        <Sparkles size={11} />
                        <span>Sugerir Técnico</span>
                      </button>
                      <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                        <GripVertical size={11} /> Arrastar
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Banner Informativo se o Dia Selecionado não tiver Ordens Agendadas */}
      {ordensDoDia.length === 0 && !carregando && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600 shrink-0" size={17} />
            <span>
              Nenhuma ordem de serviço agendada para <strong>{new Date(dataSelecionada + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>. 
              {ordensFilaEspera.length > 0 && ' Arraste chamados da Fila de Espera para o horário desejado ou navegue entre os dias:'}
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => mudarDataRelativa(-1)}
              className="px-2.5 py-1 text-2xs font-semibold bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-blue-800"
            >
              ← Ver Dia Anterior
            </button>
            <button
              onClick={() => mudarDataRelativa(1)}
              className="px-2.5 py-1 text-2xs font-semibold bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-blue-800"
            >
              Ver Próximo Dia →
            </button>
          </div>
        </div>
      )}

      {/* Matriz Gantt / Linha do Tempo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Barra de Legenda & Status */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Status:</span>
            <span className="inline-flex items-center gap-1.5 text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-medium text-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Atribuída
            </span>
            <span className="inline-flex items-center gap-1.5 text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded font-medium text-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Em Deslocamento (Trânsito)
            </span>
            <span className="inline-flex items-center gap-1.5 text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-medium text-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" /> Em Atendimento
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium text-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Concluída
            </span>
          </div>

          <div className="flex items-center gap-2 text-2xs text-slate-500">
            <span className="inline-block w-4 h-2 rounded bg-amber-400/40 border border-amber-500 border-dashed" />
            <span>Faixa de Deslocamento Pré-Atendimento (Passe o mouse no caminhão 🚗 para ver rota)</span>
          </div>
        </div>

        {/* Scroll Horizontal da Matriz de Técnicos */}
        <div className="overflow-x-auto relative">
          <div style={{ minWidth: `${280 + HORAS_TIMELINE.length * LARGURA_HORA_PX}px` }}>
            {/* Header das Horas */}
            <div className="flex items-center border-b border-slate-200 bg-slate-100/70 font-semibold text-xs text-slate-600 sticky top-0 z-20">
              {/* Coluna de Colaboradores */}
              <div className="w-[280px] shrink-0 p-3.5 border-r border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                Colaboradores & Localização ({tecnicos.length})
              </div>

              {/* Colunas das Horas */}
              <div className="flex-1 flex relative">
                {HORAS_TIMELINE.map((hora) => (
                  <div
                    key={hora}
                    style={{ width: `${LARGURA_HORA_PX}px` }}
                    className="p-3 text-center border-r border-slate-200 text-xs font-mono font-bold text-slate-600 shrink-0"
                  >
                    {String(hora).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Linha Vermelha do "Agora" */}
            {isHoje && horaAgoraFloat >= HORA_INICIAL_TIMELINE && horaAgoraFloat <= (HORA_FINAL_TIMELINE + 1) && (
              <div
                style={{ left: `${280 + linhaAgoraLeftPx}px` }}
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none"
              >
                <div className="absolute -top-1 -left-2 bg-rose-600 text-white font-mono text-[9px] font-bold px-1 rounded shadow-xs">
                  Agora
                </div>
              </div>
            )}

            {/* Linhas de Cada Técnico */}
            {tecnicos.length === 0 ? (
              <div className="p-12 text-center bg-white text-xs text-slate-500 space-y-2">
                <User className="mx-auto text-slate-400" size={32} />
                <p className="font-semibold text-slate-800 text-sm">Nenhum colaborador carregado</p>
                <p className="text-slate-500">Cadastre técnicos de campo na página de Equipes ou clique no botão Atualizar.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tecnicos.map((tecnico) => {
                  const ordensTecnicoHoje = ordensDoDia
                    .filter((o) => o.agente?.id === tecnico.id)
                    .sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));

                  const minutosTotais = ordensTecnicoHoje.reduce(
                    (acc, o) => acc + (o.duracaoEstimadaMinutos || 60),
                    0
                  );
                  const horasTotaisStr = `${Math.floor(minutosTotais / 60)}h ${minutosTotais % 60}m`;
                  const localizacaoTecnico = obterLocalizacaoAtualColaborador(tecnico.id, ordensDoDia);

                  return (
                    <div key={tecnico.id} className="flex min-h-[96px] hover:bg-slate-50/50 transition-colors">
                      {/* Painel Fixo do Técnico (Esquerda) com Localização Atual em Tempo Real */}
                      <div className="w-[280px] shrink-0 p-3.5 border-r border-slate-200 flex flex-col justify-between bg-white z-10 shadow-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {tecnico.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{tecnico.nome}</h4>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {tecnico.email}
                              </span>
                            </div>
                          </div>

                          {/* Badge de Localização Atual do Colaborador */}
                          <div 
                            title={localizacaoTecnico.texto}
                            className={`px-2 py-1 rounded-lg border text-[10px] font-medium flex items-center gap-1.5 truncate ${localizacaoTecnico.cor}`}
                          >
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">{localizacaoTecnico.texto}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                          <span className="text-slate-500 font-medium">
                            {ordensTecnicoHoje.length} tarefas ({horasTotaisStr})
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disponível
                          </span>
                        </div>
                      </div>

                      {/* Área da Grade Horária (Gantt Drop Area) */}
                      <div className="flex-1 relative flex">
                        {/* Células de Fundo para Drop */}
                        {HORAS_TIMELINE.map((hora) => {
                          const isHovered =
                            dragOverTarget?.tecnicoId === tecnico.id && dragOverTarget?.hora === hora;

                          return (
                            <div
                              key={hora}
                              style={{ width: `${LARGURA_HORA_PX}px` }}
                              onDragOver={(e) => handleDragOver(e, tecnico.id, hora)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, tecnico.id, hora)}
                              className={`border-r border-slate-100 transition-colors shrink-0 flex items-center justify-center text-2xs text-slate-300 select-none ${
                                isHovered ? 'bg-blue-100/60 ring-2 ring-blue-500 ring-inset' : ''
                              }`}
                            >
                              {isHovered && (
                                <span className="font-bold text-blue-700 animate-pulse text-[11px]">
                                  Soltar aqui ({String(hora).padStart(2, '0')}:00)
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {/* Renderização das Ordens do Técnico no Dia */}
                        {ordensTecnicoHoje.map((o, idx) => {
                          const dataAg = new Date(o.dataAgendamento);
                          const horaInicioFloat = dataAg.getHours() + dataAg.getMinutes() / 60;
                          const duracaoMinutos = o.duracaoEstimadaMinutos || 60;
                          const deslocamentoMinutos = o.tempoDeslocamentoMinutos || 30;

                          // Cálculos posicionais proporcionais em pixels
                          const offsetLeftPx = (horaInicioFloat - HORA_INICIAL_TIMELINE) * LARGURA_HORA_PX;
                          const widthPx = Math.max((duracaoMinutos / 60) * LARGURA_HORA_PX, 95);

                          const deslocamentoWidthPx = (deslocamentoMinutos / 60) * LARGURA_HORA_PX;
                          const deslocamentoLeftPx = offsetLeftPx - deslocamentoWidthPx;

                          const horaFim = new Date(dataAg.getTime() + duracaoMinutos * 60000);
                          const horaInicioStr = dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                          const horaFimStr = horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                          const horaSaidaPrevista = new Date(dataAg.getTime() - deslocamentoMinutos * 60000);
                          const horaSaidaPrevistaStr = horaSaidaPrevista.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                          // Determina origem do deslocamento
                          const origemNome = idx > 0 
                            ? `${ordensTecnicoHoje[idx - 1].cliente?.nome || 'Cliente Anterior'} ${ordensTecnicoHoje[idx - 1].cliente?.bairro ? `(${ordensTecnicoHoje[idx - 1].cliente.bairro})` : ''}`
                            : 'Prefeitura de SP (Sede / Base Operacional)';

                          const ativo = obterInfoAtivo(o);
                          const atraso = calcularAtraso(o);

                          const corStatus = (() => {
                            if (atraso.atrasada) {
                              return 'bg-rose-50/90 border-rose-400 text-rose-950 ring-2 ring-rose-500 shadow-md';
                            }
                            switch (o.status) {
                              case 'EM_DESLOCAMENTO': return 'bg-indigo-50 border-indigo-300 text-indigo-900';
                              case 'EM_ATENDIMENTO': return 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-300';
                              case 'CONCLUIDA': return 'bg-emerald-50 border-emerald-300 text-emerald-900';
                              default: return 'bg-blue-50 border-blue-300 text-blue-900';
                            }
                          })();

                          return (
                            <div key={o.id}>
                              {/* Faixa Visual de Deslocamento com Hover Card Logístico Detalhado */}
                              {deslocamentoLeftPx >= 0 && (
                                <div
                                  style={{
                                    left: `${deslocamentoLeftPx}px`,
                                    width: `${deslocamentoWidthPx}px`,
                                    top: '16px',
                                    height: '60px'
                                  }}
                                  className="absolute rounded-l-lg bg-amber-400/20 hover:bg-amber-400/35 border-y border-l border-dashed border-amber-400 flex items-center justify-center text-[10px] text-amber-800 font-semibold z-10 px-1 group cursor-pointer transition-colors"
                                >
                                  <div className="truncate flex items-center gap-1 font-mono text-[9px] sm:text-[10px]">
                                    <Truck size={12} className="shrink-0 text-amber-700 group-hover:scale-125 transition-transform" />
                                    <span>{deslocamentoMinutos}m</span>
                                    {o.distanciaDeslocamentoKm && (
                                      <span className="hidden md:inline text-[9px] text-amber-700 font-medium">
                                        ({o.distanciaDeslocamentoKm.toFixed(1)}km)
                                      </span>
                                    )}
                                  </div>

                                  {/* Popover / Card Detalhado ao Passar o Mouse sobre o Caminhão */}
                                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 border border-slate-700">
                                    <div className="flex items-center gap-1.5 font-bold text-amber-400 pb-1.5 border-b border-slate-800 text-xs">
                                      <Truck size={14} />
                                      <span>Logística de Deslocamento</span>
                                    </div>
                                    <div className="space-y-1.5 pt-2 text-[11px] leading-tight text-slate-300">
                                      <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Origem:</span>
                                        <span className="text-white font-medium truncate block">{origemNome}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Destino:</span>
                                        <span className="text-white font-medium truncate block">
                                          {o.cliente?.nome || 'Cliente'} {o.cliente?.bairro ? `(${o.cliente.bairro})` : ''}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[10px]">
                                        <div>
                                          <span className="text-slate-400 block">Distância:</span>
                                          <span className="font-bold text-amber-300">
                                            {o.distanciaDeslocamentoKm ? `${o.distanciaDeslocamentoKm.toFixed(1)} km` : '~10.0 km'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block">Trânsito Est.:</span>
                                          <span className="font-bold text-white">{deslocamentoMinutos} min</span>
                                        </div>
                                      </div>
                                      <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                                        <span>Janela de Saída:</span>
                                        <span className="font-mono text-white font-semibold">
                                          {horaSaidaPrevistaStr} → {horaInicioStr}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700" />
                                  </div>
                                </div>
                              )}

                              {/* Card da Ordem de Serviço na Timeline */}
                              <div
                                style={{
                                  left: `${offsetLeftPx}px`,
                                  width: `${widthPx}px`,
                                  top: '12px',
                                  height: '68px'
                                }}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, o)}
                                onClick={() => setOsSelecionada(o)}
                                title={atraso.atrasada ? `${atraso.mensagem} • Clique para ver detalhes` : undefined}
                                className={`absolute rounded-xl border p-2 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all z-20 flex flex-col justify-between overflow-hidden group ${corStatus}`}
                              >
                                <div className="flex items-center justify-between gap-1 leading-tight">
                                  <span className="font-mono text-[10px] font-bold text-blue-700">
                                    #{o.id}
                                  </span>
                                  {atraso.atrasada ? (
                                    <div className="flex items-center gap-1">
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.2 bg-rose-600 text-white rounded shadow-2xs animate-pulse truncate">
                                        <AlertTriangle size={9} />
                                        <span>{atraso.minutosAtraso}m</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => abrirSugestoesParaOS(o, e)}
                                        title="Sugerir outro técnico próximo para evitar atraso"
                                        className="p-0.5 text-slate-600 hover:text-indigo-600 bg-white/70 hover:bg-white rounded transition-colors cursor-pointer"
                                      >
                                        <Sparkles size={10} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-semibold truncate flex items-center gap-0.5">
                                        <span>{ativo.emoji}</span>
                                        <span className="truncate">{ativo.nome.split(' ')[0]}</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => abrirSugestoesParaOS(o, e)}
                                        title="Sugerir técnicos mais próximos da área"
                                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-indigo-600 rounded transition-opacity cursor-pointer"
                                      >
                                        <Sparkles size={10} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <p className="font-bold text-[11px] truncate text-slate-900 group-hover:text-blue-600">
                                  {o.titulo}
                                </p>

                                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium pt-0.5 border-t border-slate-200/60">
                                  <span className="truncate max-w-[80px]">{o.cliente?.nome}</span>
                                  <span className="font-mono font-semibold text-slate-800 shrink-0">
                                    {horaInicioStr}-{horaFimStr}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Rápido de Sugestão de Técnicos por Proximidade */}
      {sugestaoModalOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Sugestão de Técnicos por Proximidade</h3>
                  <p className="text-2xs text-slate-400">
                    O.S. #{sugestaoModalOS.id} • Cliente: {sugestaoModalOS.cliente?.nome || 'N/D'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSugestaoModalOS(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Destino do Atendimento</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {sugestaoModalOS.cliente?.nome} ({sugestaoModalOS.cliente?.bairro || sugestaoModalOS.cliente?.cidade || 'São Paulo'})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Técnico Atual</span>
                  <span className="font-semibold text-slate-700">
                    {sugestaoModalOS.agente?.nome || 'Nenhum (Fila de Espera)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Justificativa / Motivo da Reatribuição (Auditoria BI)
                </label>
                <input
                  type="text"
                  value={motivoReatribuicao}
                  onChange={(e) => setMotivoReatribuicao(e.target.value)}
                  placeholder="Ex: Trânsito no trajeto, proximidade com a região..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Ranking de Proximidade da Equipe:
                </span>

                {carregandoSugestoes ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                    <p>Calculando distâncias e tempos de trânsito em São Paulo...</p>
                  </div>
                ) : sugestoesLista.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    Nenhum colaborador disponível para comparação.
                  </p>
                ) : (
                  sugestoesLista.map((s) => {
                    const isAtual = sugestaoModalOS.agente?.id === s.tecnicoId;

                    return (
                      <div
                        key={s.tecnicoId}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          s.recomendado
                            ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{s.nome}</span>
                            {s.recomendado && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                                <ThumbsUp size={9} /> Recomendado
                              </span>
                            )}
                            {isAtual && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                Atual
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{s.localizacaoAtualDescricao}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                          <div className="text-right text-xs">
                            <span className="font-bold text-indigo-700 block">
                              {s.distanciaKm != null ? `${s.distanciaKm.toFixed(1)} km` : '-'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ~{s.tempoDeslocamentoMinutos}m ({s.tarefasHoje} tarefas hoje)
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={salvandoReatribuicao || isAtual}
                            onClick={() => reatribuirParaTecnico(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-2xs ${
                              isAtual
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : s.recomendado
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {salvandoReatribuicao ? 'Alocando...' : isAtual ? 'Já Alocado' : 'Reatribuir'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSugestaoModalOS(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Administrativo Completo de Detalhes da OS */}
      <DetalhesOSModal
        os={osSelecionada}
        isOpen={Boolean(osSelecionada)}
        onClose={() => setOsSelecionada(null)}
        onOSAtualizada={carregarDados}
      />
    </div>
  );
}
