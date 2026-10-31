import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, ClipboardPlus, Building2, User, AlertCircle, Loader2, Tag, AlertTriangle } from 'lucide-react';

export default function NovaOSModal({ isOpen, onClose, onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [agenteId, setAgenteId] = useState('');
  const [tipoServico, setTipoServico] = useState('PREVENTIVA');
  const [prioridade, setPrioridade] = useState('MEDIA');

  const [clientes, setClientes] = useState([]);
  const [agentes, setAgentes] = useState([]);
  
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErro(null);
      setCarregandoDados(true);

      // Buscar Clientes e Usuários/Agentes em paralelo
      Promise.all([
        api.get('/clientes'),
        api.get('/usuarios')
      ])
        .then(([resClientes, resUsuarios]) => {
          setClientes(resClientes.data || []);
          const apenasAgentes = (resUsuarios.data || []).filter((u) => u.perfil === 'AGENTE');
          setAgentes(apenasAgentes);
        })
        .catch((err) => {
          console.error('Erro ao carregar selects do modal:', err);
          setErro('Não foi possível carregar a lista de clientes e técnicos. Verifique a conexão.');
        })
        .finally(() => {
          setCarregandoDados(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetFormulario = () => {
    setTitulo('');
    setDescricao('');
    setClienteId('');
    setAgenteId('');
    setTipoServico('PREVENTIVA');
    setPrioridade('MEDIA');
    setErro(null);
  };

  const handleFechar = () => {
    resetFormulario();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clienteId) {
      setErro('Por favor, selecione um cliente.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const user = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();

      await api.post('/ordens-servico', {
        titulo,
        descricao,
        empresaId: user.empresaId || 1,
        gestorId: user.id || 1,
        clienteId: Number(clienteId),
        agenteId: agenteId ? Number(agenteId) : null,
        tipoServico,
        prioridade,
      });

      resetFormulario();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar Ordem de Serviço:', err);
      const mensagemServidor = err.response?.data?.message || err.response?.data || err.message;
      setErro(`Falha ao criar Ordem de Serviço: ${mensagemServidor}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
        
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base sm:text-lg">
            <ClipboardPlus size={20} className="text-blue-600 sm:w-[22px] sm:h-[22px]" />
            <h3>Nova Ordem de Serviço</h3>
          </div>
          <button
            type="button"
            onClick={handleFechar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerta de Erro Interno */}
        {erro && (
          <div className="mx-5 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 shrink-0">
            <AlertCircle size={17} className="shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{erro}</div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Título do Serviço *
            </label>
            <input
              type="text"
              required
              disabled={salvando}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Manutenção Preventiva em Nobreak"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
            />
          </div>

          {/* Grid de Seleção (Cliente e Técnico) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 size={13} className="text-slate-400" /> Cliente *
              </label>
              <select
                required
                disabled={carregandoDados || salvando}
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
              >
                <option value="">{carregandoDados ? 'Carregando...' : 'Selecione...'}</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Select Técnico */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={13} className="text-slate-400" /> Técnico (Opcional)
              </label>
              <select
                disabled={carregandoDados || salvando}
                value={agenteId}
                onChange={(e) => setAgenteId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
              >
                <option value="">{carregandoDados ? 'Carregando...' : 'Deixar em Aberto'}</option>
                {agentes.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Tipo de Serviço e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Serviço */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag size={13} className="text-slate-400" /> Tipo de Serviço
              </label>
              <select
                disabled={salvando}
                value={tipoServico}
                onChange={(e) => setTipoServico(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
              >
                <option value="PREVENTIVA">Manutenção Preventiva</option>
                <option value="CORRETIVA">Manutenção Corretiva</option>
                <option value="INSTALACAO">Instalação de Ativo</option>
                <option value="VISTORIA">Vistoria / Inspeção</option>
              </select>
            </div>

            {/* Nível de Prioridade */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle size={13} className="text-slate-400" /> Prioridade
              </label>
              <select
                disabled={salvando}
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica / Urgente</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descrição Detalhada das Instruções
            </label>
            <textarea
              rows={3}
              disabled={salvando}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as tarefas e orientações para a execução em campo..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none disabled:opacity-60"
            />
          </div>

          {/* Rodapé / Ações */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleFechar}
              disabled={salvando}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || carregandoDados}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Criando...</span>
                </>
              ) : (
                <span>Criar Ordem</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
