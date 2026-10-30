import { useState, useEffect } from 'react';
import api from '../services/api';
import NovaOSModal from '../components/NovaOSModal';
import { Plus, Search, Filter, RotateCw, AlertCircle } from 'lucide-react';

export default function OrdensPage() {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');

  const carregarOrdens = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await api.get('/ordens-servico');
      setOrdens(res.data);
    } catch (err) {
      console.error('Erro ao buscar ordens:', err);
      setErro('Não foi possível carregar as ordens de serviço. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOrdens();
  }, []);

  const ordensFiltradas = ordens.filter((o) => {
    const termo = busca.toLowerCase();
    const titulo = o.titulo?.toLowerCase() || '';
    const cliente = o.cliente?.nome?.toLowerCase() || '';
    const codigo = String(o.id || '');
    return titulo.includes(termo) || cliente.includes(termo) || codigo.includes(termo);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ABERTA':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ATRIBUIDA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'EM_DESLOCAMENTO':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'EM_ATENDIMENTO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONCLUIDA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Ordens de Serviço</h1>
          <p className="text-xs sm:text-sm text-slate-500">Gestão e acompanhamento das tarefas de campo em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={carregarOrdens}
            disabled={carregando}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2.5 rounded-lg text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Nova Ordem</span>
          </button>
        </div>
      </div>

      {erro && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Tabela de Ordens */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-full sm:max-w-sm">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar por código, cliente ou serviço..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full text-slate-700"
            />
          </div>
          <button className="self-end sm:self-auto flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
            <Filter size={15} /> <span>Filtros</span>
          </button>
        </div>

        {carregando ? (
          <div className="text-center py-12 text-sm text-slate-500">
            Carregando ordens de serviço do banco de dados...
          </div>
        ) : ordensFiltradas.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">
            Nenhuma ordem de serviço encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Código</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Título / Descrição</th>
                  <th className="px-6 py-3.5">Técnico</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordensFiltradas.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">#{o.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{o.cliente?.nome || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-700 max-w-xs truncate">{o.titulo}</td>
                    <td className="px-6 py-4 text-slate-600">{o.agente?.nome || 'Não atribuído'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(o.status)}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <NovaOSModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={carregarOrdens}
      />
    </div>
  );
}
