import { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Phone, Mail, RotateCw, AlertCircle, Inbox } from 'lucide-react';

export default function ClientesPage({ isTab = false }) {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      setErro(null);
      // Timeout defensivo de 5s para evitar travamento da tela
      const res = await api.get('/clientes', { timeout: 5000 });
      setClientes(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setErro('Não foi possível carregar a lista de clientes. Verifique a conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Página / Aba */}
      {!isTab ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Clientes Corporativos</h1>
            <p className="text-xs sm:text-sm text-slate-500">Base cadastral de empresas e pontos de atendimento atendidos.</p>
          </div>
          <button
            onClick={carregarClientes}
            disabled={carregando}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-60 active:scale-95"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
            <span>{carregando ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-700">
            Clientes & Unidades Cadastradas ({carregando ? '...' : clientes.length})
          </span>
          <button
            onClick={carregarClientes}
            disabled={carregando}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
            title="Atualizar lista"
          >
            <RotateCw size={14} className={carregando ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      )}

      {/* Banner de Erro da API */}
      {erro && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="font-medium">{erro}</span>
          </div>
          <button
            onClick={carregarClientes}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Lista de Clientes, Skeletons ou Empty State */}
      {carregando ? (
        /* Skeleton Loaders durante o carregamento */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-2/3" />
                  <div className="h-3 bg-slate-150 rounded-md w-1/3" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="h-3 bg-slate-150 rounded-md w-1/2" />
                <div className="h-3 bg-slate-150 rounded-md w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : clientes.length === 0 && !erro ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-slate-200 text-center">
          <div className="p-3 bg-slate-100 text-slate-400 rounded-full mb-3">
            <Inbox size={28} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Nenhum cliente cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            A base de clientes corporativos está vazia no momento.
          </p>
        </div>
      ) : (
        /* Grid de Cards dos Clientes */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clientes.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Building2 size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 text-base truncate">{c.nome}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Doc: {c.cpfCnpj || 'Não informado'}
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{c.email || 'E-mail não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span>{c.telefone || 'Telefone não informado'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}