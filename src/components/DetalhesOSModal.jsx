import { useEffect, useState } from 'react';
import api from '../services/api';
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
  Loader2
} from 'lucide-react';

export default function DetalhesOSModal({ os, isOpen, onClose }) {
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  useEffect(() => {
    if (isOpen && os?.id) {
      setCarregandoHistorico(true);
      api.get(`/ordens-servico/${os.id}/historico`)
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
  }, [isOpen, os?.id]);

  if (!isOpen || !os) return null;

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
      return new Date(dataStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/50">
                O.S. #{os.id}
              </span>
              <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getStatusBadge(os.status)}`}>
                {os.status ? os.status.replace('_', ' ') : 'INDEFINIDO'}
              </span>
              {os.prioridade && (
                <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getPrioridadeBadge(os.prioridade)}`}>
                  {os.prioridade}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{os.titulo}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm">
          {/* Descrição & Dados de Serviço */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {os.descricao || 'Nenhuma descrição detalhada informada.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 text-2xs text-slate-500">
              <span className="flex items-center gap-1">
                <Tag size={13} className="text-slate-400" />
                Tipo: <strong className="text-slate-700 font-semibold">{os.tipoServico || 'PREVENTIVA'}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                Agendado: <strong className="text-slate-700 font-semibold">{formatarData(os.dataAgendamento)}</strong>
              </span>
            </div>
          </div>

          {/* Grid de Pessoas / Atores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Building2 size={12} className="text-blue-600" /> Cliente
              </span>
              <p className="font-semibold text-slate-900 truncate">{os.cliente?.nome || 'Não vinculado'}</p>
              {os.cliente?.telefone && (
                <p className="text-2xs text-slate-500">{os.cliente.telefone}</p>
              )}
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <User size={12} className="text-emerald-600" /> Técnico em Campo
              </span>
              <p className="font-semibold text-slate-900 truncate">{os.agente?.nome || 'Aguardando Atribuição'}</p>
              <p className="text-2xs text-slate-500">{os.agente ? 'Ativo' : 'Não atribuído'}</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <User size={12} className="text-indigo-600" /> Gestor Responsável
              </span>
              <p className="font-semibold text-slate-900 truncate">{os.gestor?.nome || 'Admin'}</p>
              <p className="text-2xs text-slate-500">Supervisão</p>
            </div>
          </div>

          {/* Timestamps Operacionais (Check-in e Check-out) */}
          <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-600" /> Check-in (Início do Atendimento):
              </span>
              <span className="text-blue-800 font-mono text-2xs block">
                {formatarData(os.dataCheckin)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Check-out (Encerramento):
              </span>
              <span className="text-emerald-800 font-mono text-2xs block">
                {formatarData(os.dataCheckout)}
              </span>
            </div>
          </div>

          {/* Laudo Técnico Descritivo */}
          {os.laudoTecnico && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={15} className="text-indigo-600" /> Laudo Técnico do Atendimento
              </h3>
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs text-indigo-950 font-normal leading-relaxed italic">
                "{os.laudoTecnico}"
              </div>
            </div>
          )}

          {/* Assinatura Digital do Cliente */}
          {os.assinaturaCliente && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PenTool size={15} className="text-emerald-600" /> Comprovante de Assinatura Digital do Cliente
              </h3>
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-2">
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 w-full max-w-sm flex items-center justify-center">
                  <img
                    src={os.assinaturaCliente}
                    alt="Assinatura Digital do Cliente"
                    className="max-h-28 object-contain"
                  />
                </div>
                <div className="flex items-center gap-1 text-2xs text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} />
                  <span>Assinatura validada e arquivada para auditoria jurídica</span>
                </div>
              </div>
            </div>
          )}

          {/* Linha do Tempo / Histórico de Auditoria */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History size={15} className="text-slate-600" /> Trilha de Auditoria do Ciclo de Vida
            </h3>

            {carregandoHistorico ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-4 justify-center">
                <Loader2 size={16} className="animate-spin" />
                <span>Carregando trilha de auditoria...</span>
              </div>
            ) : historico.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum evento registrado no histórico.</p>
            ) : (
              <div className="space-y-2.5">
                {historico.map((h) => (
                  <div key={h.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {h.statusAnterior ? `${h.statusAnterior} ➔ ${h.statusNovo}` : `Criada como ${h.statusNovo}`}
                        </span>
                        <span className="text-2xs text-slate-400 font-mono">
                          por {h.usuarioNome}
                        </span>
                      </div>
                      {h.observacao && (
                        <p className="text-2xs text-slate-500 italic">{h.observacao}</p>
                      )}
                    </div>
                    <span className="text-2xs text-slate-400 whitespace-nowrap font-mono">
                      {formatarData(h.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}
