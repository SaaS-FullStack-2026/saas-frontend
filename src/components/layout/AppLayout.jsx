import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* Backdrop escuro para fechar o menu mobile ao tocar fora */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Barra de Navegação Lateral (Drawer no Mobile, Fixa no Desktop) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Área Central de Conteúdo */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Cabeçalho Fixo com Botão Hambúrguer no Mobile */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Conteúdo Dinâmico das Páginas com scroll e padding responsivo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
