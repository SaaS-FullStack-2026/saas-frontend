import { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, Shield, RotateCw } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe e Usuários</h1>
          <p className="text-sm text-slate-500">Membros cadastrados com controle de acesso baseado em papéis (RBAC).</p>
        </div>
        <button
          onClick={carregarUsuarios}
          disabled={carregando}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2.5 rounded-lg text-sm shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCw size={16} className={carregando ? 'animate-spin' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {carregando ? (
        <div className="text-center py-12 text-sm text-slate-500">
          Carregando usuários do sistema...
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
          Nenhum usuário cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {usuarios.map((u) => (
            <div key={u.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                  <UserCheck size={20} />
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Shield size={12} /> {u.perfil}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{u.nome}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Status da Conta:</span>
                <span className={`font-semibold ${u.ativo ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
