import { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Phone, Mail, RotateCw } from 'lucide-react';

export default function ClientesPage({ isTab = false }) {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  return (
    <div className="space-y-4">
      {!isTab ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Clientes Corporativos</h1>
            <p className="text-xs sm:text-sm text-slate-500">Base cadastral de empresas e pontos de atendimento atendidos.</p>
          </div>
          <button
            onClick={carregarClientes}
            disabled={carregando}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-lg text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-700">Clientes & Unidades Cadastradas ({clientes.length})</span>
          <button
            onClick={carregarClientes}
            disabled={carregando}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
            title="Atualizar lista"
          >
            <RotateCw size={14} className={carregando ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      )}

      {carregando ? (
        <div className="text-center py-12 text-sm text-slate-500">
          Carregando clientes do sistema...
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
          Nenhum cliente cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clientes.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">{c.nome}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Doc: {c.cpfCnpj || 'Não informado'}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span>{c.email || 'E-mail não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
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
