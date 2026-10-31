import { useRef, useState, useEffect } from 'react';
import { Eraser, Check } from 'lucide-react';

export default function AssinaturaCanvas({ onSalvarAssinatura }) {
  const canvasRef = useRef(null);
  const [desenhando, setDesenhando] = useState(false);
  const [temAssinatura, setTemAssinatura] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900
  }, []);

  const obterPosicao = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const iniciarDesenho = (e) => {
    e.preventDefault();
    const pos = obterPosicao(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDesenhando(true);
  };

  const desenhar = (e) => {
    if (!desenhando) return;
    e.preventDefault();
    const pos = obterPosicao(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setTemAssinatura(true);
  };

  const finalizarDesenho = () => {
    if (!desenhando) return;
    setDesenhando(false);
    if (onSalvarAssinatura) {
      onSalvarAssinatura(canvasRef.current.toDataURL('image/png'));
    }
  };

  const limparCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTemAssinatura(false);
    if (onSalvarAssinatura) {
      onSalvarAssinatura(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium flex items-center gap-1">
          {temAssinatura ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check size={14} /> Assinatura coletada
            </span>
          ) : (
            'Assinatura do Cliente (com o dedo ou caneta):'
          )}
        </span>
        {temAssinatura && (
          <button
            type="button"
            onClick={limparCanvas}
            className="text-2xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Eraser size={12} /> Limpar
          </button>
        )}
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden touch-none relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={160}
          className="w-full h-36 cursor-crosshair block"
          onMouseDown={iniciarDesenho}
          onMouseMove={desenhar}
          onMouseUp={finalizarDesenho}
          onMouseLeave={finalizarDesenho}
          onTouchStart={iniciarDesenho}
          onTouchMove={desenhar}
          onTouchEnd={finalizarDesenho}
        />
        {!temAssinatura && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-300 select-none">
            Toque e assine aqui
          </div>
        )}
      </div>
    </div>
  );
}
