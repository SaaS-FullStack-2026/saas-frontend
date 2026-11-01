import { useSearchParams } from 'react-router-dom';
import UsuariosPage from './UsuariosPage';
import ClientesPage from './ClientesPage';
import EquipamentosPage from './EquipamentosPage';
import { Users, Building2, Wrench, Database } from 'lucide-react';

export default function CadastrosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabAtual = searchParams.get('tab') || 'equipe';

  const abas = [
    {
      id: 'equipe',
      label: 'Equipe & Colaboradores',
      sub: 'Técnicos e Gestores',
      icon: Users,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'clientes',
      label: 'Clientes & Unidades',
      sub: 'Empresas e Endereços',
      icon: Building2,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'ativos',
      label: 'Ativos & Equipamentos',
      sub: 'Inventário e QR Code',
      icon: Wrench,
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  ];

  const handleMudarAba = (id) => {
    setSearchParams({ tab: id });
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Central de Cadastros */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                <Database size={18} />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Central de Cadastros Gerais
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gestão mestre unificada de colaboradores, clientes corporativos e ativos de campo com QR Code.
            </p>
          </div>
        </div>

        {/* Abas Unificadas de Navegação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          {abas.map((aba) => {
            const Icon = aba.icon;
            const isAtiva = tabAtual === aba.id;

            return (
              <button
                key={aba.id}
                type="button"
                onClick={() => handleMudarAba(aba.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isAtiva
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  isAtiva ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="truncate">
                  <span className={`text-xs font-bold block truncate ${
                    isAtiva ? 'text-blue-900' : 'text-slate-800'
                  }`}>
                    {aba.label}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {aba.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      <div className="animate-in fade-in duration-150">
        {tabAtual === 'equipe' && <UsuariosPage isTab />}
        {tabAtual === 'clientes' && <ClientesPage isTab />}
        {tabAtual === 'ativos' && <EquipamentosPage isTab />}
      </div>
    </div>
  );
}
