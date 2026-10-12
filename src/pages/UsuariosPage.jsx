import { UserCheck, Shield } from 'lucide-react';

export default function UsuariosPage() {
  const users = [
    { nome: 'Lucas Sant', email: 'lukadsant@fieldops.com', role: 'ADMIN', status: 'Ativo' },
    { nome: 'Carlos Mendes', email: 'carlos.mendes@fieldops.com', role: 'GESTOR', status: 'Ativo' },
    { nome: 'Rodrigo Silva', email: 'rodrigo.campo@fieldops.com', role: 'TECNICO', status: 'Em campo' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe e Usuários</h1>
        <p className="text-sm text-slate-500">Gerencie o controle de acesso por papéis (RBAC) e usuários da organização.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {users.map((u, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-slate-100 rounded-lg text-slate-700">
                <UserCheck size={20} />
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                <Shield size={12} /> {u.role}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{u.nome}</h3>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Status:</span>
              <span className="font-medium text-emerald-600">{u.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
