import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Barra de Navegação Lateral */}
      <Sidebar />

      {/* Área Central de Conteúdo */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Cabeçalho Fixo */}
        <Header />

        {/* Conteúdo Dinâmico das Páginas com scroll independente */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
