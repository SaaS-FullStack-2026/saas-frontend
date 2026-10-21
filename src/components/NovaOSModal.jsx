import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, ClipboardPlus, Building2, User } from 'lucide-react';

export default function NovaOSModal({ isOpen, onClose, onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [agenteId, setAgenteId] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [agentes, setAgentes] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/clientes')
        .then((res) => setClientes(res.data))
        .catch((err) => console.error('Erro ao buscar clientes:', err));

      api.get('/usuarios')
        .then((res) => {
          const apenasAgentes = res.data.filter((u) => u.perfil === 'AGENTE');
          setAgentes(apenasAgentes);
        })
        .catch((err) => console.error('Erro ao buscar agentes:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/ordens-servico', {
        titulo,
        descricao,
        empresaId: 1, // Empresa padrão
        gestorId: 1,  // Gestor padrão
        clienteId: Number(clienteId),
        agenteId: agenteId ? Number(agenteId) : null,
      });

      // Limpar formulário
      setTitulo('');
      setDescricao('');
      setClienteId('');
      setAgenteId('');
      
      onSuccess();
      onClose();
    } catch (err) {
      alert('Erro ao criar Ordem de Serviço: ' + (err.response?.data || err.message));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <ClipboardPlus size={22} className="text-blue-600" />
            <h3>Nova Ordem de Serviço</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Título do Serviço *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Manutenção Preventiva em Nobreak"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 size={13} className="text-slate-400" /> Cliente *
              </label>
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={13} className="text-slate-400" /> Técnico (Opcional)
              </label>
              <select
                value={agenteId}
                onChange={(e) => setAgenteId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">Deixar em Aberto</option>
                {agentes.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descrição Detalhada das Instruções
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as tarefas e orientações para a execução em campo..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {salvando ? 'Criando...' : 'Criar Ordem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
