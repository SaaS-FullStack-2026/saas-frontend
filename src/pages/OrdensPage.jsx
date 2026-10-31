import { useState, useEffect } from 'react';
import api from '../services/api';
import NovaOSModal from '../components/NovaOSModal';
import { Plus, Search, Filter, RotateCw, AlertCircle, FileText } from 'lucide-react';

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
      // Timeout defensivo de 5 segundos para evitar travamento da tela
      const res = await api.get('/ordens-servico', { timeout: 5000 });
      setOrdens(res.data);
    } catch (err) {
      console.error('Erro ao buscar ordens:', err);
      setErro('Não foi possível conectar com o servidor. Verifique se o back-end em Spring Boot está em execução.');
    } finally {
      // O bloco finally garante a liberação do estado de carregamento
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
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'ATRIBUIDA':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'EM_DESLOCAMENTO':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'EM_ATENDIMENTO':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'CONCLUIDA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Ordens de Serviço</h1>
          <p className="text-xs sm:text-sm text-slate-500">Gestão e acompanhamento das tarefas de campo em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={carregarOrdens}
            disabled={carregando}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-lg text-xs sm:text-sm shadow-xs transition-all ${
              carregando ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'
            }`}
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
            <span>{carregando ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Nova Ordem</span>
          </button>
        </div>
      </div>

      {/* Alerta de Erro */}
      {erro && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{erro}</span>
          </div>
          <button
            onClick={carregarOrdens}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 underline shrink-0 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabela de Ordens */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Barra de Filtros e Pesquisa */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg w-full sm:max-w-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por código, cliente ou serviço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <button className="self-end sm:self-auto flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <Filter size={15} /> <span>Filtros</span>
          </button>
        </div>

        {/* Conteúdo da Tabela */}
        {carregando ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-none">
                <div className="h-4 bg-slate-200 rounded w-16" />
                <div className="h-4 bg-slate-200 rounded w-28" />
                <div className="h-4 bg-slate-200 rounded w-48 hidden sm:block" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-6 bg-slate-200 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : ordensFiltradas.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="inline-flex p-3 bg-slate-100 text-slate-400 rounded-full">
              <FileText size={28} />
            </div>
            <p className="text-sm font-medium text-slate-700">Nenhuma ordem de serviço encontrada</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {busca ? 'Tente buscar por outro termo ou limpe o campo de pesquisa.' : 'Clique em "Nova Ordem" para cadastrar a primeira tarefa.'}
            </p>
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(o.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {o.status ? o.status.replace('_', ' ') : 'INDEFINIDO'}
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