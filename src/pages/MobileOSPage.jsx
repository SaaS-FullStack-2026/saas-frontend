import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Clock,
  Navigation,
  Wrench,
  FileCheck,
  ExternalLink,
  Route as RouteIcon,
  Truck,
  Home,
  Check,
  Calendar,
  Sparkles,
  List,
  AlertTriangle,
  Phone,
  Compass
} from 'lucide-react';
import ConcluirOSModal from '../components/mobile/ConcluirOSModal';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';

function obterDataLocalHoje() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function MobileOSPage() {
  const usuarioLogado = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [ordens, setOrdens] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSelecionadoId, setTecnicoSelecionadoId] = useState(
    usuarioLogado.perfil === 'AGENTE' ? String(usuarioLogado.id || '') : ''
  );
  const [dataSelecionada, setDataSelecionada] = useState(obterDataLocalHoje());
  const [modoVisualizacao, setModoVisualizacao] = useState('ROTEIRO'); // 'ROTEIRO' | 'LISTA'
  const [buscaLista, setBuscaLista] = useState('');
  
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);
  const [osParaConcluir, setOsParaConcluir] = useState(null);
  const [salvandoConclusao, setSalvandoConclusao] = useState(false);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [resOrdens, resUsuarios] = await Promise.all([
        api.get('/ordens-servico'),
        api.get('/usuarios').catch(() => ({ data: [] }))
      ]);

      setOrdens(resOrdens.data || []);

      const agentes = (resUsuarios.data || []).filter(
        (u) => (u.perfil || '').toUpperCase() === 'AGENTE'
      );
      setTecnicos(agentes.length > 0 ? agentes : (resUsuarios.data || []));

      // Se for gestor e ainda não selecionou um técnico, seleciona o primeiro agente disponível
      if (usuarioLogado.perfil !== 'AGENTE' && !tecnicoSelecionadoId && agentes.length > 0) {
        setTecnicoSelecionadoId(String(agentes[0].id));
      }
    } catch (err) {
      console.error('Erro ao carregar dados mobile:', err);
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

  // Separação e ordenação do Roteiro do Técnico para o Dia Selecionado
  const ordensDoDiaDoTecnico = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');

    return ordens
      .filter((o) => {
        // Filtro por técnico (se selecionado)
        if (tecnicoSelecionadoId && String(o.agente?.id) !== String(tecnicoSelecionadoId)) {
          return false;
        }
        if (!o.dataAgendamento) return false;

        const d = new Date(o.dataAgendamento);
        const dataLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        return dataLocal === dataSelecionada;
      })
      .sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));
  }, [ordens, tecnicoSelecionadoId, dataSelecionada]);

  // Resumo de Progresso da Rota
  const resumoRota = useMemo(() => {
    const total = ordensDoDiaDoTecnico.length;
    const concluidas = ordensDoDiaDoTecnico.filter((o) => o.status === 'CONCLUIDA').length;
    const progressoPercentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, concluidas, progressoPercentual };
  }, [ordensDoDiaDoTecnico]);

  // Parada Ativa (Próxima Ação Imediata do Técnico)
  const paradaAtiva = useMemo(() => {
    // 1. Prioriza quem já está em atendimento
    const emAtendimento = ordensDoDiaDoTecnico.find((o) => o.status === 'EM_ATENDIMENTO');
    if (emAtendimento) return { os: emAtendimento, tipo: 'EM_ATENDIMENTO' };

    // 2. Prioriza quem está em deslocamento
    const emDeslocamento = ordensDoDiaDoTecnico.find((o) => o.status === 'EM_DESLOCAMENTO');
    if (emDeslocamento) return { os: emDeslocamento, tipo: 'EM_DESLOCAMENTO' };

    // 3. Primeira parada pendente atribuída
    const proximaPendente = ordensDoDiaDoTecnico.find(
      (o) => o.status === 'ATRIBUIDA' || o.status === 'ABERTA'
    );
    if (proximaPendente) return { os: proximaPendente, tipo: 'PROXIMA' };

    return null;
  }, [ordensDoDiaDoTecnico]);

  // Transições de Status
  const proximoStatus = (statusAtual) => {
    switch (statusAtual) {
      case 'ABERTA': return 'ATRIBUIDA';
      case 'ATRIBUIDA': return 'EM_DESLOCAMENTO';
      case 'EM_DESLOCAMENTO': return 'EM_ATENDIMENTO';
      case 'EM_ATENDIMENTO': return 'CONCLUIDA';
      default: return null;
    }
  };

  const getAcaoInfo = (statusAtual) => {
    switch (statusAtual) {
      case 'ABERTA': 
        return { texto: 'Aceitar e Confirmar O.S.', icon: Clock, bg: 'bg-blue-600 hover:bg-blue-700' };
      case 'ATRIBUIDA': 
        return { texto: 'Iniciar Deslocamento (GPS)', icon: Navigation, bg: 'bg-indigo-600 hover:bg-indigo-700' };
      case 'EM_DESLOCAMENTO': 
        return { texto: 'Cheguei ao Local (Iniciar Atendimento)', icon: Wrench, bg: 'bg-amber-600 hover:bg-amber-700' };
      case 'EM_ATENDIMENTO': 
        return { texto: 'Concluir Atendimento (Checklist & Assinatura)', icon: CheckCircle2, bg: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'CONCLUIDA': 
        return { texto: '✓ Atendimento Concluído', icon: CheckCircle2, bg: 'bg-slate-200 text-slate-500' };
      default: 
        return { texto: 'Finalizado', icon: CheckCircle2, bg: 'bg-slate-200 text-slate-500' };
    }
  };

  const handleAcaoClick = (os) => {
    if (os.status === 'EM_ATENDIMENTO') {
      setOsParaConcluir(os);
    } else {
      avancarStatusSimples(os.id, os.status);
    }
  };

  const avancarStatusSimples = async (id, statusAtual) => {
    const novoStatus = proximoStatus(statusAtual);
    if (!novoStatus) return;

    try {
      setProcessandoId(id);
      await api.patch(`/ordens-servico/${id}/status`, { novoStatus });
      await carregarDados();
    } catch (err) {
      alert('Erro na transição: ' + (err.response?.data || err.message));
    } finally {
      setProcessandoId(null);
    }
  };

  const handleConcluirComAssinatura = async (dadosConclusao) => {
    if (!osParaConcluir) return;

    try {
      setSalvandoConclusao(true);
      await api.patch(`/ordens-servico/${osParaConcluir.id}/status`, {
        novoStatus: 'CONCLUIDA',
        ...dadosConclusao,
      });

      setOsParaConcluir(null);
      await carregarDados();
    } catch (err) {
      alert('Erro ao concluir O.S.: ' + (err.response?.data?.message || err.response?.data || err.message));
    } finally {
      setSalvandoConclusao(false);
    }
  };

  // Montagem do Endereço de Destino para Google Maps e Waze
  const getEnderecoDestino = (cliente) => {
    if (!cliente) return 'São Paulo, SP';
    const partes = [cliente.endereco, cliente.bairro, cliente.cidade, cliente.nome].filter(Boolean);
    return partes.join(', ');
  };

  const getGoogleMapsUrl = (destino) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
  };

  const getWazeUrl = (destino) => {
    return `https://waze.com/ul?q=${encodeURIComponent(destino)}&navigate=yes`;
  };

  // Filtragem para o Modo Lista
  const ordensListaFiltradas = useMemo(() => {
    return ordens.filter((o) => {
      if (tecnicoSelecionadoId && String(o.agente?.id) !== String(tecnicoSelecionadoId)) {
        return false;
      }
      if (!buscaLista.trim()) return true;
      const b = buscaLista.toLowerCase();
      return (
        o.id.toString().includes(b) ||
        (o.titulo || '').toLowerCase().includes(b) ||
        (o.cliente?.nome || '').toLowerCase().includes(b) ||
        (o.cliente?.bairro || '').toLowerCase().includes(b)
      );
    });
  }, [ordens, tecnicoSelecionadoId, buscaLista]);

  const isHoje = dataSelecionada === obterDataLocalHoje();

  return (
    <div className="space-y-4">
      {/* Controles de Cabeçalho: Alternância de Modo (Roteiro vs Lista) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Seletor de Modo */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setModoVisualizacao('ROTEIRO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                modoVisualizacao === 'ROTEIRO'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RouteIcon size={14} />
              <span>Roteiro do Dia</span>
            </button>
            <button
              onClick={() => setModoVisualizacao('LISTA')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                modoVisualizacao === 'LISTA'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} />
              <span>Todos Chamados</span>
            </button>
          </div>

          <button
            onClick={carregarDados}
            disabled={carregando}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Atualizar dados"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>

        {/* Seletor de Técnico (se for Gestor/Admin testando ou inspecionando) */}
        {usuarioLogado.perfil !== 'AGENTE' && tecnicos.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-500 shrink-0">Colaborador:</span>
            <select
              value={tecnicoSelecionadoId}
              onChange={(e) => setTecnicoSelecionadoId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos os Técnicos</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navegação de Datas no Modo Roteiro */}
        {modoVisualizacao === 'ROTEIRO' && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <button
                onClick={() => mudarDataRelativa(-1)}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Dia anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={irParaHoje}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isHoje ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => mudarDataRelativa(1)}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Próximo dia"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODO ROTEIRO DO DIA (ROADMAP SEQUENCIAL / LISTA ENCADEADA) */}
      {/* ========================================================================= */}
      {modoVisualizacao === 'ROTEIRO' && (
        <div className="space-y-4">
          {/* Card de Progresso da Rota do Dia */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass size={16} className="text-blue-600" />
                <span>Progresso da Rota Diária</span>
              </span>
              <span className="font-mono font-bold text-blue-600">
                {resumoRota.concluidas} de {resumoRota.total} paradas ({resumoRota.progressoPercentual}%)
              </span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${resumoRota.progressoPercentual}%` }}
              />
            </div>
          </div>

          {/* Card de Destaque: "Parada Ativa / O que fazer agora" */}
          {paradaAtiva && (
            <div className={`rounded-2xl p-4 border shadow-md space-y-3 transition-all ${
              paradaAtiva.tipo === 'EM_ATENDIMENTO'
                ? 'bg-gradient-to-br from-purple-50 to-indigo-50/50 border-purple-300 ring-2 ring-purple-200'
                : paradaAtiva.tipo === 'EM_DESLOCAMENTO'
                ? 'bg-gradient-to-br from-indigo-50 to-blue-50/50 border-indigo-300 ring-2 ring-indigo-200'
                : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-800 shadow-2xs">
                  {paradaAtiva.tipo === 'EM_ATENDIMENTO' && '⚡ Em Atendimento Agora'}
                  {paradaAtiva.tipo === 'EM_DESLOCAMENTO' && '🚗 Em Deslocamento / Trânsito'}
                  {paradaAtiva.tipo === 'PROXIMA' && '📍 Próxima Parada da Rota'}
                </span>
                <span className="font-mono text-xs font-bold text-blue-700">
                  O.S. #{paradaAtiva.os.id}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {paradaAtiva.os.titulo}
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-medium flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400 shrink-0" />
                  <span>{paradaAtiva.os.cliente?.nome || 'Cliente'}</span>
                  {paradaAtiva.os.cliente?.bairro && (
                    <span className="text-slate-400">({paradaAtiva.os.cliente.bairro})</span>
                  )}
                </p>
                {paradaAtiva.os.cliente?.endereco && (
                  <p className="text-2xs text-slate-500 mt-0.5 pl-4.5 truncate">
                    {paradaAtiva.os.cliente.endereco}
                  </p>
                )}
              </div>

              {/* Botões de Ação Imediata & GPS */}
              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                {/* Botões de GPS */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getGoogleMapsUrl(getEnderecoDestino(paradaAtiva.os.cliente))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Navigation size={13} className="text-blue-600" />
                    <span>Google Maps</span>
                    <ExternalLink size={10} className="text-slate-400" />
                  </a>
                  <a
                    href={getWazeUrl(getEnderecoDestino(paradaAtiva.os.cliente))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Truck size={13} className="text-cyan-600" />
                    <span>Waze GPS</span>
                    <ExternalLink size={10} className="text-slate-400" />
                  </a>
                </div>

                {/* Botão de Transição de Status */}
                {(() => {
                  const acao = getAcaoInfo(paradaAtiva.os.status);
                  const Icon = acao.icon;
                  return (
                    <button
                      onClick={() => handleAcaoClick(paradaAtiva.os)}
                      disabled={processandoId === paradaAtiva.os.id}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${acao.bg} ${
                        processandoId === paradaAtiva.os.id ? 'opacity-60' : ''
                      }`}
                    >
                      <Icon size={16} />
                      <span>{processandoId === paradaAtiva.os.id ? 'Atualizando...' : acao.texto}</span>
                      <ChevronRight size={15} />
                    </button>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Stepper / Linha do Tempo Encadeada da Rota */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <RouteIcon size={14} className="text-blue-600" />
              <span>Itinerário Encadeado do Dia ({ordensDoDiaDoTecnico.length} paradas)</span>
            </h4>

            {ordensDoDiaDoTecnico.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Nenhuma parada programada para este dia.</p>
                <p className="text-slate-400">Verifique com a supervisão ou selecione outra data.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {/* Ponto 0: Sede Operacional / Início da Jornada */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                    <Home size={12} />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Sede Operacional (Ponto de Partida)</span>
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">08:00</span>
                    </div>
                    <p className="text-2xs text-slate-500">
                      Prefeitura de SP • Viaduto do Chá, 15 - Centro Histórico
                    </p>
                  </div>
                </div>

                {/* Paradas Encadeadas 1..N */}
                {ordensDoDiaDoTecnico.map((os, idx) => {
                  const paradaNum = idx + 1;
                  const dataAg = new Date(os.dataAgendamento);
                  const duracaoMin = os.duracaoEstimadaMinutos || 60;
                  const deslocamentoMin = os.tempoDeslocamentoMinutos || 30;
                  const dataFim = new Date(dataAg.getTime() + duracaoMin * 60000);

                  const horaInicioStr = dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const horaFimStr = dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  const isConcluida = os.status === 'CONCLUIDA';
                  const isEmAndamento = os.status === 'EM_ATENDIMENTO';
                  const isEmDeslocamento = os.status === 'EM_DESLOCAMENTO';
                  const ativo = getCategoriaInfo(os.equipamento?.categoria);

                  const acao = getAcaoInfo(os.status);
                  const Icon = acao.icon;

                  // Origem do trecho de deslocamento
                  const origemTrecho = idx === 0 
                    ? 'Prefeitura de SP (Sede)' 
                    : `${ordensDoDiaDoTecnico[idx - 1].cliente?.nome || 'Parada Anterior'}`;

                  return (
                    <div key={os.id} className="relative space-y-2">
                      {/* Faixa / Elo Conector de Trânsito entre Paradas */}
                      <div className="relative -left-3 py-1 flex items-center gap-2 text-2xs font-medium text-amber-700 bg-amber-50/80 border border-dashed border-amber-300 rounded-lg px-2.5 shadow-2xs">
                        <Truck size={12} className="shrink-0 text-amber-600" />
                        <span className="truncate">
                          Trecho: {origemTrecho} → {os.cliente?.nome}
                        </span>
                        <span className="ml-auto font-mono font-bold text-amber-800 shrink-0">
                          ~{deslocamentoMin}m {os.distanciaDeslocamentoKm ? `(${os.distanciaDeslocamentoKm.toFixed(1)}km)` : ''}
                        </span>
                      </div>

                      {/* Marcador do Nó da Parada */}
                      <div className={`absolute -left-6 top-7 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                        isConcluida
                          ? 'bg-emerald-600 text-white'
                          : isEmAndamento
                          ? 'bg-purple-600 text-white ring-4 ring-purple-100 animate-pulse'
                          : isEmDeslocamento
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                          : 'bg-white border-2 border-slate-300 text-slate-600'
                      }`}>
                        {isConcluida ? <Check size={12} /> : paradaNum}
                      </div>

                      {/* Card da Parada */}
                      <div className={`rounded-xl border p-3.5 text-xs space-y-2.5 transition-all shadow-xs ${
                        isEmAndamento
                          ? 'bg-purple-50/40 border-purple-300 ring-1 ring-purple-200'
                          : isEmDeslocamento
                          ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200'
                          : isConcluida
                          ? 'bg-slate-50/60 border-slate-200 opacity-90'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}>
                        <div className="flex items-center justify-between gap-1 leading-tight">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{paradaNum}ª Parada</span>
                            <span className="font-mono text-2xs text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                              #{os.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                              {horaInicioStr} - {horaFimStr}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-900 text-sm leading-snug">{os.titulo}</h5>
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs mt-1">
                            <Building2 size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{os.cliente?.nome || 'Cliente não informado'}</span>
                            {os.cliente?.bairro && (
                              <span className="text-slate-400 truncate">({os.cliente.bairro})</span>
                            )}
                          </div>
                          {os.cliente?.endereco && (
                            <p className="text-2xs text-slate-500 mt-0.5 pl-4.5 truncate">
                              {os.cliente.endereco}
                            </p>
                          )}
                        </div>

                        {/* Botão de Ação / GPS da Parada */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          {/* Botão de GPS rápido */}
                          {!isConcluida && (
                            <a
                              href={getGoogleMapsUrl(getEnderecoDestino(os.cliente))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Abrir rota no Google Maps"
                            >
                              <Navigation size={11} />
                              <span>GPS</span>
                            </a>
                          )}

                          {/* Botão de Status */}
                          <button
                            onClick={() => handleAcaoClick(os)}
                            disabled={isConcluida || processandoId === os.id}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-default ${acao.bg} ${
                              processandoId === os.id ? 'opacity-60' : ''
                            }`}
                          >
                            <Icon size={14} />
                            <span>{processandoId === os.id ? 'Atualizando...' : acao.texto}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO LISTA COMPLETA (VISUALIZAÇÃO ALTERNATIVA / BUSCA GERAL) */}
      {/* ========================================================================= */}
      {modoVisualizacao === 'LISTA' && (
        <div className="space-y-3">
          {/* Campo de Busca Rápida */}
          <input
            type="text"
            value={buscaLista}
            onChange={(e) => setBuscaLista(e.target.value)}
            placeholder="Buscar por #ID, título, cliente ou bairro..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />

          {carregando ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Carregando chamados...
            </div>
          ) : ordensListaFiltradas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
              Nenhuma ordem encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {ordensListaFiltradas.map((os) => {
                const acao = getAcaoInfo(os.status);
                const Icon = acao.icon;
                const pStatus = proximoStatus(os.status);

                return (
                  <div
                    key={os.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        #{os.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {os.status !== 'CONCLUIDA' && (
                          <a
                            href={getGoogleMapsUrl(getEnderecoDestino(os.cliente))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 transition-colors"
                          >
                            <Navigation size={11} />
                            <span>GPS</span>
                          </a>
                        )}
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                          {os.status ? os.status.replace('_', ' ') : 'INDEFINIDO'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug">{os.titulo}</h3>
                      {os.descricao && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{os.descricao}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{os.cliente?.nome || 'Cliente não definido'}</span>
                      </div>
                      {os.agente && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>Técnico: {os.agente.nome}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAcaoClick(os)}
                      disabled={!pStatus || processandoId === os.id}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed ${acao.bg} ${
                        processandoId === os.id ? 'opacity-60' : ''
                      }`}
                    >
                      <Icon size={15} />
                      <span>{processandoId === os.id ? 'Atualizando...' : acao.texto}</span>
                      {pStatus && <ChevronRight size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Conclusão com Checklist e Assinatura Digital */}
      <ConcluirOSModal
        os={osParaConcluir}
        isOpen={Boolean(osParaConcluir)}
        onClose={() => setOsParaConcluir(null)}
        onConcluir={handleConcluirComAssinatura}
        salvando={salvandoConclusao}
      />
    </div>
  );
}
