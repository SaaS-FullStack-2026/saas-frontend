import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import DetalhesOSModal from '../components/DetalhesOSModal';
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
  AlertCircle, 
  GripVertical, 
  Layers, 
  Filter, 
  Check, 
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';

const HORAS_TIMELINE = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const LARGURA_HORA_PX = 120; // 120px por hora para clareza visual

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

export default function LinhaDoTempoPage() {
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [tecnicos, setTecnicos] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Drag and Drop & Interações
  const [draggedOS, setDraggedOS] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null); // { tecnicoId, hora }
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [feedbackRecalculo, setFeedbackRecalculo] = useState(null);
  const [exibirFilaEspera, setExibirFilaEspera] = useState(true);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const [resUsuarios, resOrdens] = await Promise.all([
        api.get('/usuarios'),
        api.get('/ordens-servico')
      ]);

      const apenasAgentes = (resUsuarios.data || []).filter((u) => u.perfil === 'AGENTE');
      setTecnicos(apenasAgentes);
      setOrdens(resOrdens.data || []);
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
    const d = new Date(dataSelecionada + 'T12:00:00');
    d.setDate(d.getDate() + dias);
    setDataSelecionada(d.toISOString().split('T')[0]);
  };

  const irParaHoje = () => {
    setDataSelecionada(new Date().toISOString().split('T')[0]);
  };

  // Separação de Ordens: do Dia vs Fila de Espera (Sem Técnico)
  const ordensDoDia = useMemo(() => {
    return ordens.filter((o) => {
      if (!o.dataAgendamento) return false;
      const dataOS = o.dataAgendamento.split('T')[0];
      return dataOS === dataSelecionada;
    });
  }, [ordens, dataSelecionada]);

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
      // Monta nova data de agendamento na hora solta (fuso local)
      const horaStr = String(hora).padStart(2, '0');
      const novaDataIso = `${dataSelecionada}T${horaStr}:00:00`;

      // Chamada à API com recálculo inteligente no backend
      const res = await api.patch(`/ordens-servico/${draggedOS.id}/reagendar`, {
        agenteId: tecnicoId,
        dataAgendamento: novaDataIso,
        duracaoEstimadaMinutos: draggedOS.duracaoEstimadaMinutos || 60,
        tempoDeslocamentoMinutos: draggedOS.tempoDeslocamentoMinutos || 30
      });

      const osAtualizada = res.data;
      const horaEfetiva = new Date(osAtualizada.dataAgendamento).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Feedback de recálculo inteligente
      setFeedbackRecalculo({
        titulo: `OS #${osAtualizada.id} Reagendada com Sucesso!`,
        mensagem: `Alocada para ${osAtualizada.agente?.nome} às ${horaEfetiva} com buffer de deslocamento calculado.`
      });
      setTimeout(() => setFeedbackRecalculo(null), 5000);

      // Atualiza estado local
      setOrdens((prev) => prev.map((o) => (o.id === osAtualizada.id ? osAtualizada : o)));
    } catch (err) {
      console.error('Erro ao reagendar OS:', err);
      alert('Não foi possível reagendar a ordem de serviço. Tente novamente.');
    } finally {
      setDraggedOS(null);
    }
  };

  // Posição da "Linha do Agora" (se a data selecionada for hoje)
  const isHoje = dataSelecionada === new Date().toISOString().split('T')[0];
  const agora = new Date();
  const horaAgoraFloat = agora.getHours() + agora.getMinutes() / 60;
  const linhaAgoraLeftPx = (horaAgoraFloat - 8) * LARGURA_HORA_PX;

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            <span>Linha do Tempo Operacional</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Planejamento diário da equipe de campo, monitoramento de deslocamento e despacho inteligente.
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
              Arraste um chamado para o horário do técnico desejado na grade abaixo
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
                    className="bg-white border border-amber-300/80 hover:border-amber-500 rounded-xl p-3 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing shrink-0 w-64 space-y-2 group"
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
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Duração: ~60m</span>
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
            <span>Faixa de Deslocamento Pré-Atendimento</span>
          </div>
        </div>

        {/* Scroll Horizontal da Matriz de Técnicos */}
        <div className="overflow-x-auto relative">
          <div style={{ minWidth: `${260 + HORAS_TIMELINE.length * LARGURA_HORA_PX}px` }}>
            {/* Header das Horas */}
            <div className="flex items-center border-b border-slate-200 bg-slate-100/70 font-semibold text-xs text-slate-600 sticky top-0 z-20">
              {/* Coluna de Colaboradores */}
              <div className="w-[260px] shrink-0 p-3.5 border-r border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                Colaboradores em Campo ({tecnicos.length})
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
            {isHoje && horaAgoraFloat >= 8 && horaAgoraFloat <= 19 && (
              <div
                style={{ left: `${260 + linhaAgoraLeftPx}px` }}
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none"
              >
                <div className="absolute -top-1 -left-2 bg-rose-600 text-white font-mono text-[9px] font-bold px-1 rounded shadow-xs">
                  Agora
                </div>
              </div>
            )}

            {/* Linhas de Cada Técnico */}
            <div className="divide-y divide-slate-100">
              {tecnicos.map((tecnico) => {
                const ordensTecnicoHoje = ordensDoDia.filter((o) => o.agente?.id === tecnico.id);
                const minutosTotais = ordensTecnicoHoje.reduce(
                  (acc, o) => acc + (o.duracaoEstimadaMinutos || 60),
                  0
                );
                const horasTotaisStr = `${Math.floor(minutosTotais / 60)}h ${minutosTotais % 60}m`;

                return (
                  <div key={tecnico.id} className="flex min-h-[92px] hover:bg-slate-50/50 transition-colors">
                    {/* Painel Fixo do Técnico (Esquerda) */}
                    <div className="w-[260px] shrink-0 p-3.5 border-r border-slate-200 flex flex-col justify-between bg-white z-10 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {tecnico.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{tecnico.nome}</h4>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {tecnico.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
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
                      {ordensTecnicoHoje.map((o) => {
                        const dataAg = new Date(o.dataAgendamento);
                        const horaInicioFloat = dataAg.getHours() + dataAg.getMinutes() / 60;
                        const duracaoMinutos = o.duracaoEstimadaMinutos || 60;
                        const deslocamentoMinutos = o.tempoDeslocamentoMinutos || 30;

                        // Cálculos posicionais proporcionais em pixels
                        const offsetLeftPx = (horaInicioFloat - 8) * LARGURA_HORA_PX;
                        const widthPx = Math.max((duracaoMinutos / 60) * LARGURA_HORA_PX, 90);

                        const deslocamentoWidthPx = (deslocamentoMinutos / 60) * LARGURA_HORA_PX;
                        const deslocamentoLeftPx = offsetLeftPx - deslocamentoWidthPx;

                        const horaFim = new Date(dataAg.getTime() + duracaoMinutos * 60000);
                        const horaInicioStr = dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        const horaFimStr = horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                        const ativo = obterInfoAtivo(o);

                        const corStatus = (() => {
                          switch (o.status) {
                            case 'EM_DESLOCAMENTO': return 'bg-indigo-50 border-indigo-300 text-indigo-900';
                            case 'EM_ATENDIMENTO': return 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-300';
                            case 'CONCLUIDA': return 'bg-emerald-50 border-emerald-300 text-emerald-900';
                            default: return 'bg-blue-50 border-blue-300 text-blue-900';
                          }
                        })();

                        return (
                          <div key={o.id}>
                            {/* Faixa Visual de Deslocamento (Trânsito Pré-Atendimento) */}
                            {deslocamentoLeftPx >= 0 && (
                              <div
                                style={{
                                  left: `${deslocamentoLeftPx}px`,
                                  width: `${deslocamentoWidthPx}px`,
                                  top: '16px',
                                  height: '60px'
                                }}
                                title={`Deslocamento estimado: ${deslocamentoMinutos} min até o cliente`}
                                className="absolute rounded-l-lg bg-amber-400/20 border-y border-l border-dashed border-amber-400 flex items-center justify-center text-[10px] text-amber-800 font-semibold pointer-events-none z-10 px-1"
                              >
                                <span className="truncate flex items-center gap-1">
                                  <Truck size={12} className="shrink-0" />
                                  <span className="hidden sm:inline">{deslocamentoMinutos}m</span>
                                </span>
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
                              className={`absolute rounded-xl border p-2 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all z-20 flex flex-col justify-between overflow-hidden group ${corStatus}`}
                            >
                              <div className="flex items-center justify-between gap-1 leading-tight">
                                <span className="font-mono text-[10px] font-bold text-blue-700">
                                  #{o.id}
                                </span>
                                <span className="text-[10px] font-semibold truncate flex items-center gap-0.5">
                                  <span>{ativo.emoji}</span>
                                  <span className="truncate">{ativo.nome.split(' ')[0]}</span>
                                </span>
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
          </div>
        </div>
      </div>

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
