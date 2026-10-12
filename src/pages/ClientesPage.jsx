import { Building2, Phone, Mail } from 'lucide-react';

export default function ClientesPage() {
  const clientes = [
    { nome: 'TechCorp Brasil', cnpj: '12.345.678/0001-90', email: 'contato@techcorp.com.br', telefone: '(11) 4002-8922' },
    { nome: 'Logística Alfa', cnpj: '98.765.432/0001-11', email: 'suporte@alfa.com.br', telefone: '(21) 3344-5566' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clientes Corporativos</h1>
        <p className="text-sm text-slate-500">Cadastro de empresas atendidas e seus pontos de contato.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clientes.map((c, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{c.nome}</h3>
                <p className="text-xs text-slate-400 font-mono">CNPJ: {c.cnpj}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <span>{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <span>{c.telefone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
