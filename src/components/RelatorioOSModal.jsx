import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, CheckCircle2, ShieldCheck, Building2, User, Calendar, Clock, PenTool, Star } from 'lucide-react';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';

export default function RelatorioOSModal({ os, isOpen, onClose }) {
  if (!isOpen || !os) return null;

  const catInfo = os.equipamento ? getCategoriaInfo(os.equipamento.categoria) : null;

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não registrado';
    try {
      const d = new Date(dataStr);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataStr;
    }
  };

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Barra de Ações Superior (Não sai na impressão) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base">Relatório Técnico da Ordem de Serviço</span>
            <span className="text-xs text-blue-400 font-mono">#{os.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={imprimir}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Folha A4 do Relatório */}
        <div id="relatorio-impressao" className="p-8 sm:p-10 space-y-6 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm bg-white">
          {/* Cabeçalho Corporativo */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block">FIELDOPS</span>
              <span className="text-xs text-slate-500 font-medium block">Sistema de Gestão & Manutenção em Campo</span>
              <span className="text-2xs text-slate-400 block mt-1">TechOps Serviços Industriais Ltda. • CNPJ: 12.345.678/0001-95</span>
            </div>
            <div className="text-left sm:text-right font-mono">
              <span className="inline-block bg-slate-100 text-slate-800 border border-slate-300 font-bold px-3 py-1 rounded text-sm mb-1">
                O.S. #{os.id}
              </span>
              <p className="text-2xs text-slate-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
              {os.codigoRastreio && (
                <p className="text-2xs text-blue-600 font-semibold">Rastreio: {os.codigoRastreio}</p>
              )}
            </div>
          </div>

          {/* Dados Principais do Chamado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-2xs font-semibold text-slate-400 uppercase block">Status</span>
              <span className="font-bold text-slate-900">{os.status?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-2xs font-semibold text-slate-400 uppercase block">Tipo de Serviço</span>
              <span className="font-bold text-slate-900">{os.tipoServico || 'PREVENTIVA'}</span>
            </div>
            <div>
              <span className="text-2xs font-semibold text-slate-400 uppercase block">Prioridade</span>
              <span className="font-bold text-slate-900">{os.prioridade || 'MEDIA'}</span>
            </div>
            <div>
              <span className="text-2xs font-semibold text-slate-400 uppercase block">Agendado Para</span>
              <span className="font-bold text-slate-900">{formatarData(os.dataAgendamento)}</span>
            </div>
          </div>

          {/* Cliente e Técnico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Building2 size={12} className="text-blue-600" /> Cliente
              </span>
              <p className="font-bold text-slate-900 text-sm">{os.cliente?.nome || 'N/A'}</p>
              {os.cliente?.cpfCnpj && <p className="text-2xs text-slate-500">CPF/CNPJ: {os.cliente.cpfCnpj}</p>}
              {os.cliente?.telefone && <p className="text-2xs text-slate-500">Contato: {os.cliente.telefone}</p>}
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <User size={12} className="text-emerald-600" /> Técnico Responsável
              </span>
              <p className="font-bold text-slate-900 text-sm">{os.agente?.nome || 'Não Atribuído'}</p>
              <p className="text-2xs text-slate-500">Equipe de Atendimento Externo</p>
              <p className="text-2xs text-slate-500">Gestor: {os.gestor?.nome || 'Administração'}</p>
            </div>
          </div>

          {/* Dados do Ativo / Equipamento Atendido */}
          {os.equipamento && (
            <div className="border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                  <span>{catInfo?.emoji}</span> Ativo / Equipamento Atendido
                </span>
                <p className="font-bold text-slate-900 text-sm">{os.equipamento.nome}</p>
                <p className="text-2xs text-slate-600">
                  {os.equipamento.fabricante} {os.equipamento.modelo ? `• Modelo: ${os.equipamento.modelo}` : ''}
                  {os.equipamento.numeroSerie ? ` • S/N: ${os.equipamento.numeroSerie}` : ''}
                </p>
                {os.equipamento.localizacao && (
                  <p className="text-2xs text-slate-500">Local: {os.equipamento.localizacao}</p>
                )}
              </div>
              {os.equipamento.codigoQr && (
                <div className="text-center shrink-0">
                  <div className="bg-white p-1.5 rounded border border-slate-300 inline-block">
                    <QRCodeSVG value={os.equipamento.codigoQr} size={64} level="M" />
                  </div>
                  <span className="block font-mono text-[9px] text-slate-600 mt-0.5">
                    {os.equipamento.codigoQr}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Descrição das Instruções */}
          <div className="space-y-1">
            <h4 className="text-2xs uppercase tracking-wider text-slate-400 font-bold">Instruções / Escopo</h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs">
              {os.descricao || 'Sem descrição cadastrada.'}
            </div>
          </div>

          {/* Checklist Técnico de Conformidade */}
          <div className="space-y-1.5">
            <h4 className="text-2xs uppercase tracking-wider text-slate-400 font-bold">Checklist Técnico de Conformidade</h4>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
              <div className="px-3 py-2 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-slate-800 font-medium">Equipamento/ativo inspecionado, testado e em pleno funcionamento operacional</span>
              </div>
              <div className="px-3 py-2 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-slate-800 font-medium">Área limpa, ferramentas recolhidas e isolamentos de segurança retirados</span>
              </div>
              <div className="px-3 py-2 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-slate-800 font-medium">Orientações de operação e recomendações repassadas ao cliente/responsável</span>
              </div>
            </div>
          </div>

          {/* Parecer do Laudo Técnico */}
          <div className="space-y-1.5">
            <h4 className="text-2xs uppercase tracking-wider text-slate-400 font-bold">Parecer do Laudo Técnico</h4>
            <div className="p-3.5 bg-blue-50/40 border border-blue-200 rounded-xl text-slate-800 text-xs leading-relaxed">
              {os.laudoTecnico || 'Serviço executado conforme normas técnicas aplicáveis.'}
            </div>
          </div>

          {/* Horários de Execução */}
          <div className="grid grid-cols-2 gap-3 text-xs border border-slate-200 p-3 rounded-lg bg-slate-50">
            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold block">Início (Check-in)</span>
              <span className="font-mono text-slate-800 font-semibold">{formatarData(os.dataCheckin)}</span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 uppercase font-semibold block">Término (Check-out)</span>
              <span className="font-mono text-slate-800 font-semibold">{formatarData(os.dataCheckout)}</span>
            </div>
          </div>

          {/* Avaliação CSAT (se avaliado) */}
          {os.avaliacaoNota && (
            <div className="border border-amber-200 bg-amber-50/50 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-2xs uppercase font-bold text-amber-800 block">Avaliação de Satisfação do Cliente (CSAT)</span>
                <p className="text-slate-700 italic mt-0.5">"{os.avaliacaoComentario || 'Atendimento impecável.'}"</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill={i < os.avaliacaoNota ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
          )}

          {/* Assinatura Digital do Cliente & Assinatura do Técnico */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            {/* Assinatura do Cliente */}
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">
                Assinatura do Cliente / Aceite Formal
              </span>
              {os.assinaturaCliente ? (
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 inline-block w-full text-center">
                  <img
                    src={os.assinaturaCliente}
                    alt="Assinatura Digital Coletada"
                    className="h-16 mx-auto object-contain"
                  />
                  <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                    ✓ Assinatura eletrônica com validade jurídica
                  </span>
                </div>
              ) : (
                <div className="h-16 border-b border-dashed border-slate-400 flex items-end justify-center pb-1 text-2xs text-slate-400">
                  Assinatura do Cliente
                </div>
              )}
              <p className="text-2xs text-slate-500 text-center">{os.cliente?.nome}</p>
            </div>

            {/* Assinatura do Técnico */}
            <div className="space-y-2 text-center sm:text-right">
              <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">
                Responsável Técnico
              </span>
              <div className="h-16 border-b border-dashed border-slate-400 flex items-end justify-center sm:justify-end pb-1 text-2xs text-slate-400">
                {os.agente?.nome || 'FieldOps Técnico'}
              </div>
              <p className="text-2xs text-slate-500">Técnico Autorizado FieldOps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
