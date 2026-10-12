import { Plus, Search, Filter } from 'lucide-react';

export default function OrdensPage() {
  const ordens = [
    { id: '#OS-1024', cliente: 'TechCorp Brasil', titulo: 'Manutenção em Nobreak Principal', status: 'EM ATENDIMENTO', prioridade: 'Alta', data: '12/10/2026' },
    { id: '#OS-1025', cliente: 'Logística Alfa', titulo: 'Instalação de Antena Starlink', status: 'ATRIBUÍDA', prioridade: 'Média', data: '12/10/2026' },
    { id: '#OS-1026', cliente: 'Supermercado Central', titulo: 'Troca de PDV Caixa 04', status: 'ABERTA', prioridade: 'Crítica', data: '12/10/2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-slate-500">Gestão e acompanhamento das tarefas de campo da equipe.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-xs transition-colors self-start sm:self-auto cursor-pointer">
          <Plus size={18} />
          Nova Ordem
        </button>
      </div>

      {/* Tabela de Ordens */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex-1 max-w-sm">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por código, cliente ou serviço..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full text-slate-700"
            />
          </div>
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <Filter size={16} /> Filtros
          </button>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Código</th>
              <th className="px-6 py-3.5">Cliente</th>
              <th className="px-6 py-3.5">Título / Descrição</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ordens.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-blue-600">{o.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{o.cliente}</td>
                <td className="px-6 py-4 text-slate-700">{o.titulo}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{o.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
