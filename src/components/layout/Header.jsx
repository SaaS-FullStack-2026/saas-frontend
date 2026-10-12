import { Bell, UserCircle, Building } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
      {/* Tenant / Empresa Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200">
          <Building size={14} className="text-slate-500" />
          <span>Tenant: <strong className="font-semibold text-slate-900">FieldOps Matriz</strong></span>
        </div>
      </div>

      {/* User & Notifications */}
      <div className="flex items-center gap-4">
        <button 
          title="Notificações" 
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <UserCircle size={32} className="text-slate-400" />
          <div className="hidden sm:block text-left">
            <span className="block text-sm font-semibold text-slate-800 leading-tight">Admin do Sistema</span>
            <span className="block text-xs text-slate-500 leading-tight">Administrador</span>
          </div>
        </div>
      </div>
    </header>
  );
}
