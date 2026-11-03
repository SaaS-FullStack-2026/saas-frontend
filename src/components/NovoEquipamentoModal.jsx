import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Wrench, Building2, MapPin, Tag, Hash, Loader2, AlertCircle } from 'lucide-react';
import { CATEGORIAS_EQUIPAMENTO } from '../utils/equipamentoCategorias';

export default function NovoEquipamentoModal({ isOpen, onClose, onSuccess, preSelectedClienteId }) {
  const [clientes, setClientes] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const [form, setForm] = useState({
    clienteId: preSelectedClienteId || '',
    nome: '',
    categoria: 'CLIMATIZACAO',
    fabricante: '',
    modelo: '',
    numeroSerie: '',
    localizacao: ''
  });

  useEffect(() => {
    if (isOpen) {
      setErro(null);
      api.get('/clientes')
        .then((res) => {
          setClientes(res.data || []);
          if (!form.clienteId && res.data?.length > 0) {
            setForm((prev) => ({ ...prev, clienteId: res.data[0].id }));
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar clientes:', err);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (preSelectedClienteId) {
      setForm((prev) => ({ ...prev, clienteId: preSelectedClienteId }));
    }
  }, [preSelectedClienteId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clienteId) {
      setErro('Selecione um cliente para vincular o equipamento.');
      return;
    }
    if (!form.nome.trim()) {
      setErro('Informe o nome ou identificação do equipamento.');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);
      await api.post('/equipamentos', {
        ...form,
        clienteId: Number(form.clienteId)
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao cadastrar equipamento:', err);
      setErro(err.response?.data?.message || err.response?.data || 'Erro ao cadastrar equipamento.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto modal-backdrop">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col modal-surface">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">Novo Ativo / Equipamento</h3>
              <p className="text-[11px] text-slate-500">Cadastre máquinas ou pontos de controle do cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-press p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{erro}</span>
            </div>
          )}

          {/* Cliente */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cliente Proprietário *
            </label>
            <select
              value={form.clienteId}
              onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              required
            >
              <option value="">Selecione um cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.cpfCnpj ? `(${c.cpfCnpj})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Nome / Identificação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome / Identificação do Ativo *
            </label>
            <input
              type="text"
              placeholder="Ex: Ar Split 12k Sala Reunião, Roteador Mikrotik, Gerador Principal"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Categoria do Ativo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Categoria / Segmento *
            </label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
            >
              {Object.values(CATEGORIAS_EQUIPAMENTO).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.label} ({cat.descricao})
                </option>
              ))}
            </select>
          </div>

          {/* Fabricante e Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fabricante / Marca
              </label>
              <input
                type="text"
                placeholder="Ex: Daikin, Cisco, Otis, Schneider"
                value={form.fabricante}
                onChange={(e) => setForm({ ...form, fabricante: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                placeholder="Ex: Inverter Eco, RB4011, Gen2"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Número de Série e Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Série / Tag
              </label>
              <input
                type="text"
                placeholder="Ex: SN-9842841"
                value={form.numeroSerie}
                onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono tabular-nums placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Localização / Setor no Cliente
              </label>
              <input
                type="text"
                placeholder="Ex: 2º Andar - Sala TI, CPD"
                value={form.localizacao}
                onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Rodapé de Ações */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="btn-press px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="btn-press inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer disabled:opacity-70"
            >
              {salvando ? <Loader2 size={14} className="animate-spin text-white" /> : null}
              <span>{salvando ? 'Salvando...' : 'Cadastrar Equipamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
