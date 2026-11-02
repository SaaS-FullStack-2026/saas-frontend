import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, QrCode, MapPin, Hash, Check } from 'lucide-react';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';

export default function QRCodeModal({ equipamento, isOpen, onClose }) {
  const [copiado, setCopiado] = useState(false);

  if (!isOpen || !equipamento) return null;

  const catInfo = getCategoriaInfo(equipamento.categoria);

  const imprimirEtiqueta = () => {
    window.print();
  };

  const copiarCodigo = () => {
    if (equipamento.codigoQr) {
      navigator.clipboard.writeText(equipamento.codigoQr);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <>
      {/* Estilo CSS exclusivo para isolar a etiqueta na impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #etiqueta-imprimivel, #etiqueta-imprimivel * {
            visibility: visible;
          }
          #etiqueta-imprimivel {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-150">
          
          {/* Cabeçalho do Modal */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <QrCode size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Etiqueta QR Code do Ativo</h3>
                <p className="text-xs text-slate-500">Identificação para colagem e rastreio em campo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cartão de Etiqueta Imprimível */}
          <div className="p-6 flex flex-col items-center">
            <div 
              id="etiqueta-imprimivel"
              className="w-full bg-gradient-to-b from-white to-slate-50 border-2 border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-center"
            >
              {/* Header da Etiqueta */}
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between gap-2">
                <div className="text-left min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 block">FieldOps FSM</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {equipamento.clienteNome || 'Cliente Não Informado'}
                  </span>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catInfo.cor} flex items-center gap-1 shrink-0`}>
                  <span>{catInfo.emoji}</span>
                  <span>{catInfo.label.split('/')[0]}</span>
                </span>
              </div>

              {/* Informações Centrais do Equipamento */}
              <div className="text-center space-y-0.5">
                <h4 className="font-bold text-base text-slate-900 truncate">{equipamento.nome || 'Ativo Sem Nome'}</h4>
                <p className="text-xs text-slate-600">
                  {equipamento.fabricante || 'Fabricante N/D'} {equipamento.modelo ? `• ${equipamento.modelo}` : ''}
                </p>
                {equipamento.numeroSerie && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    S/N: {equipamento.numeroSerie}
                  </p>
                )}
                {equipamento.localizacao && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-600 mt-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="truncate">{equipamento.localizacao}</span>
                  </div>
                )}
              </div>

              {/* Renderização do QR Code SVG */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block shadow-xs">
                <QRCodeSVG
                  value={equipamento.codigoQr || `EQP-${equipamento.id}`}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Código Alfanumérico */}
              <div className="pt-1">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-block">
                  {equipamento.codigoQr || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Ações */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={copiarCodigo}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              {copiado ? <Check size={14} className="text-emerald-600" /> : <Hash size={14} />}
              <span>{copiado ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={imprimirEtiqueta}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Printer size={14} />
                <span>Imprimir Etiqueta</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}