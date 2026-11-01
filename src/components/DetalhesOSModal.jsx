import { useEffect, useState } from 'react';
import api from '../services/api';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';
import RelatorioOSModal from './RelatorioOSModal';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  User, 
  FileText, 
  PenTool, 
  History, 
  AlertTriangle,
  Tag,
  Wrench,
  Loader2,
  Share2,
  Check,
  Printer,
  Star,
  Edit3,
  Sparkles,
  MapPin,
  Truck,
  Navigation,
  UserCheck,
  RefreshCw
} from 'lucide-react';

export default function DetalhesOSModal({ os, isOpen, onClose, onOSAtualizada }) {
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [relatorioAberto, setRelatorioAberto] = useState(false);

  // Estados para edição/vinculação de ativo
  const [editandoAtivo, setEditandoAtivo] = useState(false);
  const [equipamentosCliente, setEquipamentosCliente] = useState([]);
  const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(false);
  const [ativoSelecionadoId, setAtivoSelecionadoId] = useState('');
  const [salvandoAtivo, setSalvandoAtivo] = useState(false);
  const [osLocal, setOsLocal] = useState(os);

  // Estados para reagendamento e alteração de data/horário
  const [editandoAgendamento, setEditandoAgendamento] = useState(false);
  const [agendamentoData, setAgendamentoData] = useState('');
  const [agendamentoAgenteId, setAgendamentoAgenteId] = useState('');
  const [agendamentoDuracao, setAgendamentoDuracao] = useState(60);
  const [agendamentoDeslocamento, setAgendamentoDeslocamento] = useState(30);
  const [agendamentoMotivo, setAgendamentoMotivo] = useState('');
  const [listaTecnicos, setListaTecnicos] = useState([]);
  const [carregandoTecnicos, setCarregandoTecnicos] = useState(false);
  const [salvandoAgendamento, setSalvandoAgendamento] = useState(false);

  // Estados para sugestões de técnicos próximos (BI & Despacho inteligente)
  const [sugestoes, setSugestoes] = useState([]);
  const [carregandoSugestoes, setCarregandoSugestoes] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  useEffect(() => {
    setOsLocal(os);
    setEditandoAtivo(false);
    setEditandoAgendamento(false);
    setMostrarSugestoes(false);
    setSugestoes([]);
  }, [os]);

  const copiarRastreio = () => {
    if (!osLocal) return;
    const cod = osLocal.codigoRastreio || `TRK-OS${osLocal.id}`;
    const url = `${window.location.origin}/rastreio/${cod}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  useEffect(() => {
    if (isOpen && osLocal?.id) {
      setCarregandoHistorico(true);
      api.get(`/ordens-servico/${osLocal.id}/historico`)
        .then((res) => {
          setHistorico(res.data || []);
        })
        .catch((err) => {
          console.error('Erro ao buscar histórico da OS:', err);
          setHistorico([]);
        })
        .finally(() => {
          setCarregandoHistorico(false);
        });
    }
  }, [isOpen, osLocal?.id]);

  const abrirEdicaoAtivo = async () => {
    setEditandoAtivo(true);
    setAtivoSelecionadoId(osLocal.equipamento?.id || '');
    if (osLocal.cliente?.id) {
      try {
        setCarregandoEquipamentos(true);
        const res = await api.get('/equipamentos', {
          params: { clienteId: osLocal.cliente.id }
        });
        setEquipamentosCliente(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar equipamentos do cliente:', err);
      } finally {
        setCarregandoEquipamentos(false);
      }
    }
  };

  const salvarAtivo = async () => {
    try {
      setSalvandoAtivo(true);
      const res = await api.patch(`/ordens-servico/${osLocal.id}/equipamento`, {
        equipamentoId: ativoSelecionadoId ? Number(ativoSelecionadoId) : null
      });
      setOsLocal(res.data);
      onOSAtualizada?.(res.data);
      setEditandoAtivo(false);
    } catch (err) {
      console.error('Erro ao vincular ativo:', err);
      alert('Não foi possível vincular o ativo à ordem de serviço.');
    } finally {
      setSalvandoAtivo(false);
    }
  };

  const formatarParaInput = (dataStr) => {
    if (!dataStr) {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
    }
    const d = new Date(dataStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const abrirEdicaoAgendamento = async () => {
    setEditandoAgendamento(true);
    setAgendamentoData(formatarParaInput(osLocal.dataAgendamento));
    setAgendamentoAgenteId(osLocal.agente?.id || '');
    setAgendamentoDuracao(osLocal.duracaoEstimadaMinutos || 60);
    setAgendamentoDeslocamento(osLocal.tempoDeslocamentoMinutos || 30);
    setAgendamentoMotivo('');

    if (listaTecnicos.length === 0) {
      try {
        setCarregandoTecnicos(true);
        const res = await api.get('/usuarios');
        const agentes = (res.data || []).filter((u) => u.perfil === 'AGENTE');
        setListaTecnicos(agentes);
      } catch (err) {
        console.error('Erro ao carregar técnicos:', err);
      } finally {
        setCarregandoTecnicos(false);
      }
    }
  };

  const carregarSugestoesProximidade = async () => {
    if (!osLocal?.id) return;
    try {
      setCarregandoSugestoes(true);
      setMostrarSugestoes(true);
      const res = await api.get(`/ordens-servico/${osLocal.id}/sugestoes-tecnicos`);
      setSugestoes(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar sugestões por proximidade:', err);
    } finally {
      setCarregandoSugestoes(false);
    }
  };

  const aplicarSugestao = (sugestao) => {
    setAgendamentoAgenteId(sugestao.tecnicoId);
    if (sugestao.tempoDeslocamentoMinutos) {
      setAgendamentoDeslocamento(sugestao.tempoDeslocamentoMinutos);
    }
    setAgendamentoMotivo(
      `Reatribuição inteligente por proximidade (${sugestao.distanciaKm != null ? sugestao.distanciaKm.toFixed(1) + ' km' : 'área próxima'})`
    );
  };

  const salvarAgendamento = async () => {
    try {
      setSalvandoAgendamento(true);
      const dataIso = agendamentoData ? new Date(agendamentoData).toISOString() : new Date().toISOString();
      const res = await api.patch(`/ordens-servico/${osLocal.id}/reagendar`, {
        agenteId: agendamentoAgenteId ? Number(agendamentoAgenteId) : null,
        dataAgendamento: dataIso,
        duracaoEstimadaMinutos: Number(agendamentoDuracao) || 60,
        tempoDeslocamentoMinutos: Number(agendamentoDeslocamento) || 30,
        motivo: agendamentoMotivo.trim() || 'Reagendamento operacional'
      });
      setOsLocal(res.data);
      onOSAtualizada?.(res.data);
      setEditandoAgendamento(false);
      setMostrarSugestoes(false);

      const resHist = await api.get(`/ordens-servico/${osLocal.id}/historico`);
      setHistorico(resHist.data || []);
    } catch (err) {
      console.error('Erro ao reagendar OS:', err);
      alert('Não foi possível reagendar a ordem de serviço. Verifique os dados informados.');
    } finally {
      setSalvandoAgendamento(false);
    }
  };

  if (!isOpen || !osLocal) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ABERTA': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ATRIBUIDA': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EM_DESLOCAMENTO': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'EM_ATENDIMENTO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CONCLUIDA': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPrioridadeBadge = (prioridade) => {
    switch (prioridade) {
      case 'CRITICA': return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'ALTA': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'BAIXA': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não registrado';
    try {
      const d = new Date(dataStr);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataStr;
    }
  };

  const catInfo = osLocal.equipamento ? getCategoriaInfo(osLocal.equipamento.categoria) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/50">
                  O.S. #{osLocal.id}
                </span>
                <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getStatusBadge(osLocal.status)}`}>
                  {osLocal.status ? osLocal.status.replace('_', ' ') : 'INDEFINIDO'}
                </span>
                {osLocal.prioridade && (
                  <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getPrioridadeBadge(osLocal.prioridade)}`}>
                    {osLocal.prioridade}
                  </span>
                )}
                {osLocal.quantidadeReagendamentos > 0 && (
                  <span 
                    title={`Reagendada ${osLocal.quantidadeReagendamentos}x. Motivo recente: ${osLocal.motivoUltimoReagendamento || 'Não registrado'}`}
                    className="text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-900/60 text-purple-200 border border-purple-700/60 inline-flex items-center gap-1"
                  >
                    <RefreshCw size={10} />
                    <span>Reagendada ({osLocal.quantidadeReagendamentos}x)</span>
                  </span>
                )}
                {osLocal.houveAtraso && (
                  <span 
                    title={`Atraso registrado: ${osLocal.minutosAtrasoRegistrado || 0} minutos`}
                    className="text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-900/60 text-rose-200 border border-rose-700/60 inline-flex items-center gap-1"
                  >
                    <AlertTriangle size={10} />
                    <span>Atraso ({osLocal.minutosAtrasoRegistrado || 0}m)</span>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{osLocal.titulo}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRelatorioAberto(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Visualizar e Imprimir Relatório Técnico / PDF"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Relatório / PDF</span>
              </button>
              <button
                type="button"
                onClick={copiarRastreio}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Copiar link de rastreio para enviar ao cliente"
              >
                {copiado ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                <span className="hidden sm:inline">{copiado ? 'Copiado!' : 'Rastreio'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Conteúdo com Scroll */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm">
            {/* Descrição & Dados de Serviço */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {osLocal.descricao || 'Nenhuma descrição detalhada informada.'}
              </p>
              
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-2xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Tag size={13} className="text-slate-400" />
                    Tipo: <strong className="text-slate-700 font-semibold">{osLocal.tipoServico || 'PREVENTIVA'}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    Agendado: <strong className="text-slate-700 font-semibold">{formatarData(osLocal.dataAgendamento)}</strong>
                  </span>
                  {osLocal.duracaoEstimadaMinutos && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      Duração: <strong className="text-slate-700 font-semibold">{osLocal.duracaoEstimadaMinutos} min</strong>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => (editandoAgendamento ? setEditandoAgendamento(false) : abrirEdicaoAgendamento())}
                  className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Calendar size={12} />
                  <span>{editandoAgendamento ? 'Cancelar Reagendamento' : 'Reagendar / Mudar Data'}</span>
                </button>
              </div>

              {/* Painel Expansível de Reagendamento */}
              {editandoAgendamento && (
                <div className="p-3.5 bg-white border border-blue-200 rounded-xl space-y-3 shadow-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={14} className="text-blue-600" /> Reagendamento Inteligente
                    </h4>
                    <span className="text-[10px] text-slate-400">Recalcula rotas e buffers automaticamente</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nova Data e Horário
                      </label>
                      <input
                        type="datetime-local"
                        value={agendamentoData}
                        onChange={(e) => setAgendamentoData(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Técnico Atribuído
                      </label>
                      <select
                        value={agendamentoAgenteId}
                        onChange={(e) => setAgendamentoAgenteId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                      >
                        <option value="">{carregandoTecnicos ? 'Carregando...' : 'Nenhum / Fila de Espera'}</option>
                        {listaTecnicos.map((t) => (
                          <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Duração Estimada
                      </label>
                      <select
                        value={agendamentoDuracao}
                        onChange={(e) => setAgendamentoDuracao(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                      >
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>1 hora (Padrão)</option>
                        <option value={90}>1 hora e 30 min</option>
                        <option value={120}>2 horas</option>
                        <option value={180}>3 horas</option>
                        <option value={240}>4 horas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Buffer Deslocamento (Min)
                      </label>
                      <select
                        value={agendamentoDeslocamento}
                        onChange={(e) => setAgendamentoDeslocamento(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos (Padrão)</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>60 minutos</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Motivo do Reagendamento (Auditoria & BI)
                      </label>
                      <input
                        type="text"
                        value={agendamentoMotivo}
                        onChange={(e) => setAgendamentoMotivo(e.target.value)}
                        placeholder="Ex: Trânsito intenso na região, remanejamento de rota, cliente solicitou..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                      />
                    </div>
                  </div>

                  {/* Seção de Sugestão de Técnicos Próximos da Área */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                        <Sparkles size={14} className="text-indigo-600" />
                        <span>Sugestão de Profissionais Próximos</span>
                      </div>
                      <button
                        type="button"
                        onClick={carregarSugestoesProximidade}
                        disabled={carregandoSugestoes}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-white border border-indigo-300 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        <RefreshCw size={11} className={carregandoSugestoes ? 'animate-spin' : ''} />
                        <span>{carregandoSugestoes ? 'Calculando rotas...' : 'Calcular Mais Próximos'}</span>
                      </button>
                    </div>

                    {mostrarSugestoes && (
                      <div className="space-y-1.5 pt-1">
                        {sugestoes.length === 0 && !carregandoSugestoes && (
                          <p className="text-2xs text-slate-500 italic">
                            Nenhum técnico disponível com localização calculada no momento.
                          </p>
                        )}
                        {sugestoes.map((s) => (
                          <div
                            key={s.tecnicoId}
                            className={`p-2 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all ${
                              s.recomendado
                                ? 'bg-white border-indigo-400 ring-1 ring-indigo-300 shadow-2xs'
                                : 'bg-white/80 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{s.nome}</span>
                                {s.recomendado && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                                    ★ Recomendado
                                  </span>
                                )}
                              </div>
                              <p className="text-2xs text-slate-500 flex items-center gap-1">
                                <MapPin size={10} className="text-slate-400 shrink-0" />
                                <span>{s.localizacaoAtualDescricao}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-2xs">
                              <div className="text-right">
                                <span className="font-bold text-indigo-700 block">
                                  {s.distanciaKm != null ? `${s.distanciaKm.toFixed(1)} km` : '-'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ~{s.tempoDeslocamentoMinutos}m trânsito ({s.tarefasHoje} tarefas)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => aplicarSugestao(s)}
                                className={`px-2.5 py-1 text-2xs font-semibold rounded-lg cursor-pointer transition-colors ${
                                  Number(agendamentoAgenteId) === s.tecnicoId
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                {Number(agendamentoAgenteId) === s.tecnicoId ? 'Selecionado ✓' : 'Escolher'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditandoAgendamento(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={salvandoAgendamento}
                      onClick={salvarAgendamento}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer transition-colors disabled:opacity-60"
                    >
                      {salvandoAgendamento ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      <span>Salvar Reagendamento</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Grid de Pessoas / Atores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Building2 size={12} className="text-blue-600" /> Cliente
                </span>
                <p className="font-semibold text-slate-900 truncate">{osLocal.cliente?.nome || 'Não vinculado'}</p>
                {osLocal.cliente?.telefone && (
                  <p className="text-2xs text-slate-500">{osLocal.cliente.telefone}</p>
                )}
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <User size={12} className="text-emerald-600" /> Técnico em Campo
                </span>
                <p className="font-semibold text-slate-900 truncate">{osLocal.agente?.nome || 'Aguardando Atribuição'}</p>
                <p className="text-2xs text-slate-500">{osLocal.agente ? 'Ativo' : 'Não atribuído'}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <User size={12} className="text-indigo-600" /> Gestor Responsável
                </span>
                <p className="font-semibold text-slate-900 truncate">{osLocal.gestor?.nome || 'Admin'}</p>
                <p className="text-2xs text-slate-500">Supervisão</p>
              </div>
            </div>

            {/* Equipamento / Ativo Vinculado com Opção de Vincular/Alterar */}
            <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                  <Wrench size={14} className="text-blue-600" /> Ativo / Equipamento Vinculado
                </span>
                {!editandoAtivo && (
                  <button
                    onClick={abrirEdicaoAtivo}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-0.5 rounded shadow-2xs hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Edit3 size={11} />
                    <span>{osLocal.equipamento ? 'Alterar Ativo' : 'Vincular Ativo'}</span>
                  </button>
                )}
              </div>

              {editandoAtivo ? (
                <div className="space-y-2 pt-1 border-t border-slate-200">
                  <label className="text-2xs font-semibold text-slate-600 block">
                    Selecione o equipamento do cliente:
                  </label>
                  <select
                    value={ativoSelecionadoId}
                    onChange={(e) => setAtivoSelecionadoId(e.target.value)}
                    disabled={carregandoEquipamentos || salvandoAtivo}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nenhum ativo (Serviço Geral)</option>
                    {equipamentosCliente.map((eq) => {
                      const c = getCategoriaInfo(eq.categoria);
                      return (
                        <option key={eq.id} value={eq.id}>
                          {c.emoji} {eq.nome} {eq.numeroSerie ? `(S/N: ${eq.numeroSerie})` : ''} - {eq.localizacao || c.label}
                        </option>
                      );
                    })}
                  </select>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditandoAtivo(false)}
                      disabled={salvandoAtivo}
                      className="px-2.5 py-1 text-2xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={salvarAtivo}
                      disabled={salvandoAtivo}
                      className="inline-flex items-center gap-1 px-3 py-1 text-2xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs cursor-pointer"
                    >
                      {salvandoAtivo ? <Loader2 size={11} className="animate-spin" /> : null}
                      <span>Salvar Ativo</span>
                    </button>
                  </div>
                </div>
              ) : osLocal.equipamento ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                      {catInfo?.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{osLocal.equipamento.nome}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catInfo?.cor}`}>
                          {catInfo?.label.split('/')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {osLocal.equipamento.fabricante || 'Marca N/D'} {osLocal.equipamento.modelo ? `• ${osLocal.equipamento.modelo}` : ''}
                        {osLocal.equipamento.numeroSerie ? ` • S/N: ${osLocal.equipamento.numeroSerie}` : ''}
                      </p>
                      {osLocal.equipamento.localizacao && (
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                          📍 Local: {osLocal.equipamento.localizacao}
                        </p>
                      )}
                    </div>
                  </div>
                  {osLocal.equipamento.codigoQr && (
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Código QR</span>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-1 rounded border border-blue-200 block">
                        {osLocal.equipamento.codigoQr}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic flex items-center justify-between">
                  <span>Nenhum equipamento vinculado a esta ordem de serviço.</span>
                  <button
                    onClick={abrirEdicaoAtivo}
                    className="text-blue-600 hover:underline font-semibold text-2xs cursor-pointer"
                  >
                    + Clique aqui para vincular
                  </button>
                </div>
              )}
            </div>

            {/* Avaliação de Satisfação do Cliente CSAT */}
            {osLocal.avaliacaoNota && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500 fill-amber-500" /> Avaliação do Cliente (CSAT)
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill={i < osLocal.avaliacaoNota ? 'currentColor' : 'none'} />
                    ))}
                    <span className="text-xs font-bold text-amber-900 ml-1">
                      {osLocal.avaliacaoNota}.0 / 5.0
                    </span>
                  </div>
                </div>
                {osLocal.avaliacaoComentario && (
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-amber-200/80 italic">
                    "{osLocal.avaliacaoComentario}"
                  </p>
                )}
              </div>
            )}

            {/* Timestamps Operacionais (Check-in e Check-out) */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" /> Check-in (Início do Atendimento):
                </span>
                <span className="text-blue-800 font-mono text-2xs block">
                  {formatarData(osLocal.dataCheckin)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Check-out (Encerramento):
                </span>
                <span className="text-emerald-800 font-mono text-2xs block">
                  {formatarData(osLocal.dataCheckout)}
                </span>
              </div>
            </div>

            {/* Laudo Técnico Descritivo */}
            {osLocal.laudoTecnico && (
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText size={15} className="text-indigo-600" /> Laudo Técnico do Atendimento
                </h3>
                <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl text-slate-700 leading-relaxed font-normal text-xs whitespace-pre-line">
                  {osLocal.laudoTecnico}
                </div>
              </div>
            )}

            {/* Assinatura Digital do Cliente */}
            {osLocal.assinaturaCliente ? (
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <PenTool size={15} className="text-emerald-600" /> Assinatura Digital do Cliente
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs max-w-xs w-full text-center">
                    <img
                      src={osLocal.assinaturaCliente}
                      alt="Assinatura Digital Coletada"
                      className="h-20 mx-auto object-contain"
                    />
                    <span className="text-2xs text-slate-400 block mt-1">Validação Biométrica em Tela</span>
                  </div>
                  <div className="text-left space-y-1 text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 size={14} /> Assinatura Coletada em Campo
                    </span>
                    <p className="text-slate-500 text-2xs">
                      Coletada diretamente no dispositivo móvel do técnico com registro temporal de checkout.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Linha do Tempo de Auditoria */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <History size={15} className="text-blue-600" /> Linha do Tempo & Auditoria Operacional
              </h3>

              {carregandoHistorico ? (
                <div className="p-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Carregando histórico...</span>
                </div>
              ) : historico.length === 0 ? (
                <p className="text-2xs text-slate-400 italic">Nenhum evento registrado ainda.</p>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historico.map((h) => (
                    <div key={h.id} className="relative flex items-start gap-3">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                      <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800">
                            {h.statusNovo ? h.statusNovo.replace('_', ' ') : 'ATUALIZAÇÃO'}
                          </span>
                          <span className="text-2xs font-mono text-slate-400">
                            {formatarData(h.createdAt)}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-600 font-normal leading-relaxed">{h.observacao}</p>
                        <span className="text-2xs text-slate-400 block pt-0.5">
                          Por: <strong>{h.usuarioNome}</strong> ({h.usuarioPerfil})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Impressão / PDF */}
      <RelatorioOSModal
        os={osLocal}
        isOpen={relatorioAberto}
        onClose={() => setRelatorioAberto(false)}
      />
    </>
  );
}
