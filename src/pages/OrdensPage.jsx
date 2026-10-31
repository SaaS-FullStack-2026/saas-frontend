import { useState, useEffect } from 'react';
import api from '../services/api';
import NovaOSModal from '../components/NovaOSModal';
import DetalhesOSModal from '../components/DetalhesOSModal';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';
import { 
  Plus, 
  Search, 
  RotateCw, 
  AlertCircle, 
  FileText, 
  Table as TableIcon, 
  LayoutGrid, 
  User, 
  Building2, 
  Clock, 
  PenTool, 
  Eye,
  CheckCircle2,
  Calendar,
  Share2,
  Check,
  Wrench,
  Star
} from 'lucide-react';

function obterInfoAtivo(os) {
  if (os.equipamento) {
    const cat = getCategoriaInfo(os.equipamento.categoria);
    return {
      emoji: cat.emoji,
      nome: os.equipamento.nome,
      cor: cat.cor,
      vinculado: true
    };
  }
  const t = ((os.titulo || '') + ' ' + (os.descricao || '')).toLowerCase();
  if (t.includes('ar') || t.includes('split') || t.includes('clima')) {
    return { emoji: '❄️', nome: 'Climatização', cor: 'text-cyan-700 bg-cyan-50 border-cyan-200', vinculado: false };
  }
  if (t.includes('roteador') || t.includes('rede') || t.includes('ti') || t.includes('fibra')) {
    return { emoji: '📶', nome: 'TI & Redes', cor: 'text-indigo-700 bg-indigo-50 border-indigo-200', vinculado: false };
  }
  if (t.includes('fria') || t.includes('geladeira') || t.includes('congelad')) {
    return { emoji: '🧊', nome: 'Refrigeração', cor: 'text-blue-700 bg-blue-50 border-blue-200', vinculado: false };
  }
  if (t.includes('dedetiz') || t.includes('praga') || t.includes('isca')) {
    return { emoji: '🛡️', nome: 'Dedetização', cor: 'text-emerald-700 bg-emerald-50 border-emerald-200', vinculado: false };
  }
  if (t.includes('elevador') || t.includes('motor')) {
    return { emoji: '⚙️', nome: 'Elevador / Motor', cor: 'text-amber-700 bg-amber-50 border-amber-200', vinculado: false };
  }
  return { emoji: '🔧', nome: 'Ativo Geral', cor: 'text-slate-700 bg-slate-50 border-slate-200', vinculado: false };
}

const KANBAN_COLUNAS = [
  { id: 'ABERTA', label: 'Aberta', color: 'border-amber-400 bg-amber-500/10 text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  { id: 'ATRIBUIDA', label: 'Atribuída', color: 'border-blue-400 bg-blue-500/10 text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  { id: 'EM_DESLOCAMENTO', label: 'Em Deslocamento', color: 'border-indigo-400 bg-indigo-500/10 text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
  { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', color: 'border-purple-400 bg-purple-500/10 text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  { id: 'CONCLUIDA', label: 'Concluída', color: 'border-emerald-400 bg-emerald-500/10 text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' }
];

export default function OrdensPage() {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [modoVisualizacao, setModoVisualizacao] = useState('kanban'); // 'tabela' ou 'kanban'
  const [copiadoId, setCopiadoId] = useState(null);

  const copiarLinkRastreio = (os, e) => {
    if (e) e.stopPropagation();
    const cod = os.codigoRastreio || `TRK-OS${os.id}`;
    const url = `${window.location.origin}/rastreio/${cod}`;
    navigator.clipboard.writeText(url);
    setCopiadoId(os.id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  const carregarOrdens = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await api.get('/ordens-servico', { timeout: 8000 });
      setOrdens(res.data);
    } catch (err) {
      console.error('Erro ao buscar ordens:', err);
      setErro('Não foi possível conectar com o servidor. Verifique se o back-end está ativo.');
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
    const tecnico = o.agente?.nome?.toLowerCase() || '';
    const codigo = String(o.id || '');
    const tipo = o.tipoServico?.toLowerCase() || '';
    const prioridade = o.prioridade?.toLowerCase() || '';
    return (
      titulo.includes(termo) || 
      cliente.includes(termo) || 
      tecnico.includes(termo) || 
      codigo.includes(termo) ||
      tipo.includes(termo) ||
      prioridade.includes(termo)
    );
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

  const getPrioridadeBadge = (prioridade) => {
    switch (prioridade) {
      case 'CRITICA':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ALTA':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BAIXA':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Ordens de Serviço</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Painel visual da esteira operacional em campo com visão Tabela e Kanban.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Alternador Tabela / Kanban */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center shrink-0">
            <button
              onClick={() => setModoVisualizacao('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                modoVisualizacao === 'kanban'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualizar em Quadro Kanban"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setModoVisualizacao('tabela')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                modoVisualizacao === 'tabela'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualizar em Lista / Tabela"
            >
              <TableIcon size={14} />
              <span className="hidden sm:inline">Tabela</span>
            </button>
          </div>

          <button
            onClick={carregarOrdens}
            disabled={carregando}
            className={`inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all ${
              carregando ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'
            }`}
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
            <span className="hidden sm:inline">{carregando ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
          <button
            onClick={() => setModalNovaAberto(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
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

      {/* Barra de Filtro de Busca */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg w-full sm:max-w-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por código, cliente, técnico, tipo ou prioridade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>Total: <strong>{ordensFiltradas.length}</strong> ordens</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-600 font-medium">
            {ordensFiltradas.filter((o) => o.status === 'CONCLUIDA').length} concluídas
          </span>
        </div>
      </div>

      {/* Visualização KANBAN */}
      {modoVisualizacao === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {KANBAN_COLUNAS.map((coluna) => {
            const ordensColuna = ordensFiltradas.filter((o) => (o.status || 'ABERTA') === coluna.id);
            return (
              <div
                key={coluna.id}
                className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-col min-h-[480px]"
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${coluna.color.split(' ')[1]}`} />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{coluna.label}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${coluna.badge}`}>
                    {ordensColuna.length}
                  </span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[72vh] pr-1">
                  {ordensColuna.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
                      Nenhuma ordem
                    </div>
                  ) : (
                    ordensColuna.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => setOsSelecionada(o)}
                        className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer active:scale-[0.99] group space-y-2.5"
                      >
                        {/* Linha superior: Código + Prioridade */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-600">#{o.id}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPrioridadeBadge(o.prioridade)}`}>
                            {o.prioridade || 'MEDIA'}
                          </span>
                        </div>

                        {/* Título */}
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {o.titulo}
                        </h4>

                        {/* Equipamento / Ativo Vinculado com Ícone */}
                        {(() => {
                          const ativo = obterInfoAtivo(o);
                          return (
                            <div className={`border rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] shadow-2xs ${ativo.cor}`}>
                              <span className="flex items-center gap-1.5 font-semibold truncate">
                                <span className="text-sm">{ativo.emoji}</span>
                                <span className="truncate">{ativo.nome}</span>
                              </span>
                              {!ativo.vinculado && (
                                <span className="text-[9px] uppercase font-bold tracking-wider opacity-70 bg-white/70 px-1 rounded">
                                  Auto
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        {/* Metadados: Cliente e Técnico */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{o.cliente?.nome || 'Cliente não informado'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <User size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{o.agente?.nome || 'Sem técnico'}</span>
                          </div>
                        </div>

                        {/* Linha Inferior: Tipo de Serviço + Rastreio + Evidências */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {o.tipoServico || 'PREVENTIVA'}
                            </span>
                            {o.avaliacaoNota && (
                              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                                <Star size={10} className="fill-amber-500 text-amber-500" />
                                {o.avaliacaoNota}.0
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <button
                              onClick={(e) => copiarLinkRastreio(o, e)}
                              className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 cursor-pointer"
                              title="Copiar link de rastreio para o cliente"
                            >
                              {copiadoId === o.id ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                            </button>
                            {o.assinaturaCliente && (
                              <span title="Assinatura Coletada" className="text-emerald-600">
                                <PenTool size={13} />
                              </span>
                            )}
                            {o.laudoTecnico && (
                              <span title="Laudo Técnico Preenchido" className="text-blue-600">
                                <FileText size={13} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visualização TABELA */}
      {modoVisualizacao === 'tabela' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
                    <th className="px-5 py-3.5">Código</th>
                    <th className="px-5 py-3.5">Cliente</th>
                    <th className="px-5 py-3.5">Título</th>
                    <th className="px-5 py-3.5">Tipo / Prioridade</th>
                    <th className="px-5 py-3.5">Técnico</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordensFiltradas.map((o) => (
                    <tr 
                      key={o.id} 
                      onClick={() => setOsSelecionada(o)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-blue-600">#{o.id}</td>
                      <td className="px-5 py-4 font-medium text-slate-900">{o.cliente?.nome || 'N/A'}</td>
                      <td className="px-5 py-4">
                        <div className="text-slate-700 max-w-xs truncate font-medium">{o.titulo}</div>
                        {(() => {
                          const ativo = obterInfoAtivo(o);
                          return (
                            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
                              <span>{ativo.emoji}</span>
                              <span className="truncate max-w-[160px] font-medium">{ativo.nome}</span>
                              {o.avaliacaoNota && (
                                <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold ml-1 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  <Star size={10} className="fill-amber-500" />
                                  {o.avaliacaoNota}.0
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {o.tipoServico || 'PREVENTIVA'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPrioridadeBadge(o.prioridade)}`}>
                            {o.prioridade || 'MEDIA'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{o.agente?.nome || 'Não atribuído'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(o.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {o.status ? o.status.replace('_', ' ') : 'INDEFINIDO'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => copiarLinkRastreio(o, e)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                            title="Copiar link de rastreio para o cliente"
                          >
                            {copiadoId === o.id ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                            <span className="hidden sm:inline">{copiadoId === o.id ? 'Copiado!' : 'Rastreio'}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOsSelecionada(o);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Ver</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação */}
      <NovaOSModal
        isOpen={modalNovaAberto}
        onClose={() => setModalNovaAberto(false)}
        onSuccess={carregarOrdens}
      />

      {/* Modal Administrativo de Detalhes da OS (Onda 1 & 2) */}
      <DetalhesOSModal
        os={osSelecionada}
        isOpen={Boolean(osSelecionada)}
        onClose={() => setOsSelecionada(null)}
        onOSAtualizada={carregarOrdens}
      />
    </div>
  );
}
