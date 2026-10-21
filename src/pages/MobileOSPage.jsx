import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  RotateCw,
  ChevronRight,
  Clock,
  Navigation,
  Wrench
} from 'lucide-react';

export default function MobileOSPage() {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);

  const carregarOrdens = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/ordens-servico');
      setOrdens(res.data);
    } catch (err) {
      console.error('Erro ao carregar ordens mobile:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOrdens();
  }, []);

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
        return { texto: 'Aceitar e Atribuir O.S.', icon: Clock, bg: 'bg-blue-600 hover:bg-blue-700' };
      case 'ATRIBUIDA': 
        return { texto: 'Iniciar Deslocamento', icon: Navigation, bg: 'bg-indigo-600 hover:bg-indigo-700' };
      case 'EM_DESLOCAMENTO': 
        return { texto: 'Cheguei ao Local (Iniciar)', icon: Wrench, bg: 'bg-amber-600 hover:bg-amber-700' };
      case 'EM_ATENDIMENTO': 
        return { texto: 'Concluir Atendimento', icon: CheckCircle2, bg: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'CONCLUIDA': 
        return { texto: '✓ Atendimento Concluído', icon: CheckCircle2, bg: 'bg-slate-200 text-slate-500' };
      default: 
        return { texto: 'Finalizado', icon: CheckCircle2, bg: 'bg-slate-200 text-slate-500' };
    }
  };

  const avancarStatus = async (id, statusAtual) => {
    const novoStatus = proximoStatus(statusAtual);
    if (!novoStatus) return;

    try {
      setProcessandoId(id);
      await api.patch(`/ordens-servico/${id}/status`, { novoStatus });
      await carregarOrdens();
    } catch (err) {
      alert('Erro na transição: ' + (err.response?.data || err.message));
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ordens em Aberto</h2>
          <p className="text-xs text-slate-500">Toque para atualizar o ciclo da máquina de estados</p>
        </div>
        <button
          onClick={carregarOrdens}
          disabled={carregando}
          className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RotateCw size={16} className={carregando ? 'animate-spin' : ''} />
        </button>
      </div>

      {carregando ? (
        <div className="text-center py-12 text-sm text-slate-400">
          Carregando dados da nuvem...
        </div>
      ) : ordens.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-700">Nenhuma ordem de serviço pendente!</p>
          <p className="text-xs text-slate-400 mt-1">Bom trabalho, todas as tarefas foram atendidas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordens.map((os) => {
            const pStatus = proximoStatus(os.status);
            const acao = getAcaoInfo(os.status);
            const Icon = acao.icon;

            return (
              <div
                key={os.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    #{os.id}
                  </span>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                    {os.status.replace('_', ' ')}
                  </span>
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

                {/* Botão de Avanço de Status */}
                <button
                  onClick={() => avancarStatus(os.id, os.status)}
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
  );
}
