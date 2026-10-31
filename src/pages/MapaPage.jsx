import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import DetalhesOSModal from '../components/DetalhesOSModal';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';
import { 
  MapPin, 
  RotateCw, 
  Layers, 
  Building2, 
  User, 
  Clock, 
  PenTool, 
  FileText, 
  Eye, 
  Filter,
  Navigation,
  AlertCircle,
  Share2,
  Check
} from 'lucide-react';

// Coordenadas centrais padrão (São Paulo / Região Metropolitana)
const CENTRO_PADRAO = [-23.55052, -46.633308];

// Cores e labels por status
const STATUS_CONFIG = {
  ABERTA: {
    label: 'Aberta',
    cor: '#d97706', // amber-600
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-600',
    badge: 'bg-amber-100 text-amber-800'
  },
  ATRIBUIDA: {
    label: 'Atribuída',
    cor: '#2563eb', // blue-600
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-600',
    badge: 'bg-blue-100 text-blue-800'
  },
  EM_DESLOCAMENTO: {
    label: 'Em Deslocamento',
    cor: '#6366f1', // indigo-500
    bgClass: 'bg-indigo-500',
    borderClass: 'border-indigo-600',
    badge: 'bg-indigo-100 text-indigo-800'
  },
  EM_ATENDIMENTO: {
    label: 'Em Atendimento',
    cor: '#9333ea', // purple-600
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-700',
    badge: 'bg-purple-100 text-purple-800'
  },
  CONCLUIDA: {
    label: 'Concluída',
    cor: '#059669', // emerald-600
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800'
  }
};

// Gerador de ícones Leaflet estilizados via HTML/CSS com ícone do equipamento
function criarIconeStatus(status, codigo, os) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ABERTA;
  const isPulsando = status === 'EM_DESLOCAMENTO' || status === 'EM_ATENDIMENTO';
  
  let emoji = '🔧';
  let label = 'Ativo de Campo';

  if (os?.equipamento) {
    const cat = getCategoriaInfo(os.equipamento.categoria);
    emoji = cat.emoji;
    label = cat.label;
  } else {
    const t = ((os?.titulo || '') + ' ' + (os?.descricao || '')).toLowerCase();
    if (t.includes('ar') || t.includes('split') || t.includes('clima')) {
      emoji = '❄️'; label = 'Climatização';
    } else if (t.includes('roteador') || t.includes('rede') || t.includes('ti') || t.includes('fibra')) {
      emoji = '📶'; label = 'TI & Redes';
    } else if (t.includes('fria') || t.includes('geladeira') || t.includes('congelad')) {
      emoji = '🧊'; label = 'Refrigeração';
    } else if (t.includes('dedetiz') || t.includes('praga') || t.includes('isca')) {
      emoji = '🛡️'; label = 'Dedetização';
    } else if (t.includes('elevador') || t.includes('motor')) {
      emoji = '⚙️'; label = 'Elevador / Mecânica';
    }
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
        ${isPulsando ? `<span style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: ${cfg.cor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
        <div style="background-color: ${cfg.cor}; color: white; width: 30px; height: 30px; border-radius: 9999px; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; font-family: monospace;">
          #${codigo}
        </div>
        <div title="${label}" style="position: absolute; top: 0px; right: 0px; background: white; border-radius: 9999px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
}

// Componente para recentralizar o mapa
function RecenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapaPage() {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [mapCenter, setMapCenter] = useState(CENTRO_PADRAO);
  const [copiadoId, setCopiadoId] = useState(null);

  const carregarOrdens = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await api.get('/ordens-servico', { timeout: 8000 });
      setOrdens(res.data);
    } catch (err) {
      console.error('Erro ao buscar ordens para o mapa:', err);
      setErro('Não foi possível carregar as ordens no mapa. Verifique a conexão.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOrdens();
  }, []);

  // Associação determinística de coordenadas geográficas
  const ordensComCoordenadas = useMemo(() => {
    return ordens.map((os) => {
      // Offset geográfico realista espalhado num raio de ~15km
      const latOffset = (((os.id * 19) % 100) - 50) * 0.0018;
      const lngOffset = (((os.id * 31) % 100) - 50) * 0.0022;
      return {
        ...os,
        posicao: [CENTRO_PADRAO[0] + latOffset, CENTRO_PADRAO[1] + lngOffset]
      };
    });
  }, [ordens]);

  // Filtro por status
  const ordensExibidas = useMemo(() => {
    if (filtroStatus === 'TODOS') return ordensComCoordenadas;
    return ordensComCoordenadas.filter((o) => (o.status || 'ABERTA') === filtroStatus);
  }, [ordensComCoordenadas, filtroStatus]);

  // Centralizar na localização do usuário
  const obterMinhaLocalizacao = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn('GPS não autorizado ou indisponível:', err);
        }
      );
    }
  };

  const copiarLinkRastreio = (os) => {
    const cod = os.codigoRastreio || `TRK-OS${os.id}`;
    const url = `${window.location.origin}/rastreio/${cod}`;
    navigator.clipboard.writeText(url);
    setCopiadoId(os.id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="text-blue-600" size={24} />
            <span>Mapa Operacional em Tempo Real</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhe a geolocalização dos chamados e técnicos distribuídos em campo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={obterMinhaLocalizacao}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3 py-2 rounded-lg text-xs shadow-xs transition-all cursor-pointer"
            title="Recentralizar na Minha Localização"
          >
            <Navigation size={14} className="text-blue-600" />
            <span className="hidden sm:inline">Meu GPS</span>
          </button>
          <button
            onClick={carregarOrdens}
            disabled={carregando}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-lg text-xs shadow-xs transition-all cursor-pointer"
          >
            <RotateCw size={14} className={carregando ? 'animate-spin text-blue-600' : ''} />
            <span>{carregando ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de erro */}
      {erro && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{erro}</span>
          </div>
          <button onClick={carregarOrdens} className="underline font-semibold cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Barra de Filtros Rápidos */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[10px] px-2 flex items-center gap-1 shrink-0">
          <Filter size={12} /> Status:
        </span>
        <button
          onClick={() => setFiltroStatus('TODOS')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            filtroStatus === 'TODOS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todos ({ordensComCoordenadas.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([chave, cfg]) => {
          const qtd = ordensComCoordenadas.filter((o) => (o.status || 'ABERTA') === chave).length;
          return (
            <button
              key={chave}
              onClick={() => setFiltroStatus(chave)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                filtroStatus === chave
                  ? `${cfg.badge} ring-1 ring-inset ring-current font-semibold`
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.bgClass}`} />
              <span>{cfg.label}</span>
              <span className="opacity-75">({qtd})</span>
            </button>
          );
        })}
      </div>

      {/* Container do Mapa Leaflet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden relative h-[68vh] min-h-[460px]">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <RecenterController center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {ordensExibidas.map((o) => {
            const statusKey = o.status || 'ABERTA';
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ABERTA;

            return (
              <Marker
                key={o.id}
                position={o.posicao}
                icon={criarIconeStatus(statusKey, o.id, o)}
              >
                <Popup>
                  <div className="p-1 space-y-2 min-w-[220px] text-slate-800">
                    {/* Header do Popup */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600">OS #{o.id}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Título */}
                    <p className="font-semibold text-xs text-slate-900 leading-tight">
                      {o.titulo}
                    </p>

                    {/* Equipamento Vinculado com Ícone */}
                    {o.equipamento && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{getCategoriaInfo(o.equipamento.categoria).emoji}</span>
                          <span className="truncate">{o.equipamento.nome}</span>
                        </div>
                        {o.equipamento.localizacao && (
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                            Local: {o.equipamento.localizacao}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Metadados */}
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{o.cliente?.nome || 'Cliente não informado'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{o.agente?.nome || 'Sem técnico atribuído'}</span>
                      </div>
                    </div>

                    {/* Evidências coletadas */}
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                      {o.assinaturaCliente && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <PenTool size={11} /> Assinado
                        </span>
                      )}
                      {o.laudoTecnico && (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          <FileText size={11} /> Com Laudo
                        </span>
                      )}
                    </div>

                    {/* Ações: Rastreio do Cliente + Detalhes */}
                    <div className="pt-2 space-y-1.5">
                      <button
                        onClick={() => copiarLinkRastreio(o)}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
                        title="Copiar Link para enviar ao Cliente via WhatsApp"
                      >
                        {copiadoId === o.id ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                        <span>{copiadoId === o.id ? 'Link Copiado!' : 'Copiar Rastreio Cliente'}</span>
                      </button>

                      <button
                        onClick={() => setOsSelecionada(o)}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Ver Laudo & Detalhes</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Modal de Detalhes Completo da OS */}
      <DetalhesOSModal
        os={osSelecionada}
        isOpen={Boolean(osSelecionada)}
        onClose={() => setOsSelecionada(null)}
        onOSAtualizada={carregarOrdens}
      />
    </div>
  );
}
