import { useState } from 'react';
import { X, CheckCircle2, ClipboardCheck, FileText, Loader2, PenTool } from 'lucide-react';
import AssinaturaCanvas from './AssinaturaCanvas';

export default function ConcluirOSModal({ os, isOpen, onClose, onConcluir, salvando }) {
  const [laudoTecnico, setLaudoTecnico] = useState('');
  const [assinaturaCliente, setAssinaturaCliente] = useState(null);
  const [checklist, setChecklist] = useState({
    equipamentoTestado: true,
    areaLimpa: true,
    clienteOrientado: true,
  });

  if (!isOpen || !os) return null;

  const toggleCheck = (item) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const todosChecados = checklist.equipamentoTestado && checklist.areaLimpa && checklist.clienteOrientado;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!todosChecados) {
      alert('Por favor, confirme todos os itens de checklist de conformidade antes de encerrar.');
      return;
    }

    onConcluir?.({
      laudoTecnico: laudoTecnico.trim() || 'Serviço concluído conforme especificações técnicas.',
      assinaturaCliente,
      observacao: `Atendimento finalizado com sucesso. Laudo técnico registrado. ${
        assinaturaCliente ? 'Assinatura digital coletada.' : 'Sem assinatura presencial.'
      }`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 modal-backdrop">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] modal-surface">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base tracking-tight">Conclusão de Atendimento</h3>
              <p className="text-2xs text-slate-400 tabular-nums">O.S. #{os.id} — {os.titulo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="btn-press p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm">
          {/* Cliente Info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-0.5">
            <span className="font-semibold text-slate-700 block">Ponto de Atendimento:</span>
            <span className="text-slate-600 block">{os.cliente?.nome || 'Cliente não informado'}</span>
          </div>

          {/* 1. Checklist Técnico de Conformidade */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ClipboardCheck size={14} className="text-blue-600" /> Checklist de Qualidade (Obrigatório)
            </label>
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.equipamentoTestado}
                  onChange={() => toggleCheck('equipamentoTestado')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Equipamentos testados e em pleno funcionamento</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.areaLimpa}
                  onChange={() => toggleCheck('areaLimpa')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Área limpa, ferramentas recolhidas e isolamentos retirados</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.clienteOrientado}
                  onChange={() => toggleCheck('clienteOrientado')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Orientações de operação e manutenção transmitidas</span>
              </label>
            </div>
          </div>

          {/* 2. Laudo Técnico / Parecer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText size={14} className="text-indigo-600" /> Laudo Técnico do Serviço
            </label>
            <textarea
              rows={3}
              value={laudoTecnico}
              onChange={(e) => setLaudoTecnico(e.target.value)}
              placeholder="Descreva as causas identificadas, peças trocadas e o procedimento executado..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none bg-slate-50/70 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 3. Assinatura Digital do Cliente */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <PenTool size={14} className="text-emerald-600" /> Assinatura Digital do Cliente
            </label>
            <AssinaturaCanvas onSalvarAssinatura={setAssinaturaCliente} />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="btn-press w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || !todosChecados}
              className="btn-press w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-slate-300 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {salvando ? (
                <>
                  <Loader2 size={15} className="animate-spin text-white" />
                  <span>Finalizando O.S...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Validar e Concluir O.S.</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
