import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import DetalhesOSModal from '../components/DetalhesOSModal';
import NavegacaoOperacional from '../components/layout/NavegacaoOperacional';
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
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Route as RouteIcon,
  Truck,
  Home,
  X,
  Sparkles,
  Compass
} from 'lucide-react';

// Coordenadas centrais padrão (São Paulo) e Sede Operacional (Prefeitura de SP - Viaduto do Chá, 15)
const CENTRO_PADRAO = [-23.55052, -46.633308];
const COORDENADAS_SEDE = [-23.5489, -46.6388];

function obterDataLocalHoje() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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

// Ícone customizado da Sede Operacional
function criarIconeSede() {
  return L.divIcon({
    className: 'custom-sede-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
        <span style="position: absolute; width: 48px; height: 48px; border-radius: 9999px; background-color: #1e3a8a; opacity: 0.25; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="background: linear-gradient(135deg, #1e3a8a, #0f172a); color: white; width: 38px; height: 38px; border-radius: 12px; border: 2.5px solid #fbbf24; box-shadow: 0 4px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 18px;">
          🏛️
        </div>
        <div style="position: absolute; bottom: -4px; background: #1e3a8a; color: #fbbf24; border: 1px solid #fbbf24; border-radius: 4px; padding: 0 4px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 1px 2px rgba(0,0,0,0.3); font-family: sans-serif;">
          SEDE
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  });
}

// Ícone customizado de Colaborador em Campo com status dinâmico
function criarIconeTecnico(tecnico, statusInfo, isSelecionado) {
  const corBorda = statusInfo.tipo === 'EM_ATENDIMENTO' 
    ? '#9333ea' 
    : statusInfo.tipo === 'EM_DESLOCAMENTO' 
    ? '#6366f1' 
    : statusInfo.tipo === 'CONCLUIDA'
    ? '#059669'
    : '#2563eb';

  const isPulsando = statusInfo.tipo === 'EM_ATENDIMENTO' || statusInfo.tipo === 'EM_DESLOCAMENTO';
  const inicial = (tecnico.nome || 'T').charAt(0).toUpperCase();

  return L.divIcon({
    className: 'custom-tecnico-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; cursor: pointer;">
        ${isPulsando ? `<span style="position: absolute; width: 46px; height: 46px; border-radius: 9999px; background-color: ${corBorda}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
        <div style="background-color: ${isSelecionado ? '#0f172a' : '#ffffff'}; color: ${isSelecionado ? '#38bdf8' : '#0f172a'}; width: 34px; height: 34px; border-radius: 9999px; border: 3px solid ${corBorda}; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; font-family: sans-serif; ${isSelecionado ? 'transform: scale(1.15); border-color: #38bdf8;' : ''}">
          ${inicial}
        </div>
        <div style="position: absolute; bottom: 0px; right: 0px; background: white; border-radius: 9999px; width: 17px; height: 17px; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); border: 1px solid #cbd5e1;">
          ${statusInfo.tipo === 'EM_DESLOCAMENTO' ? '🚗' : statusInfo.tipo === 'EM_ATENDIMENTO' ? '⚡' : '📍'}
        </div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23]
  });
}

// Gerador de ícones Leaflet para Ordens de Serviço (com suporte a número sequencial na rota)
function criarIconeStatus(status, codigo, os, sequenciaRota = null) {
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
        ${sequenciaRota != null ? `
          <div title="${sequenciaRota}ª Parada da Rota" style="position: absolute; top: -5px; left: -5px; background: #2563eb; color: white; border-radius: 9999px; width: 19px; height: 19px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid white; font-family: sans-serif;">
            ${sequenciaRota}º
          </div>
        ` : ''}
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

// Componente para recentralizar o mapa suavemente
function RecenterController({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapaPage() {
  const [ordens, setOrdens] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Filtros de Data (Hoje por padrão em tempo real)
  const [dataSelecionada, setDataSelecionada] = useState(obterDataLocalHoje());
  const [verTodasAsDatas, setVerTodasAsDatas] = useState(false);

  // Filtros de Camadas (Layers) e Status
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [exibirTecnicos, setExibirTecnicos] = useState(true);
  const [exibirOrdens, setExibirOrdens] = useState(true);
  const [exibirSede, setExibirSede] = useState(true);

  // Rota Encadeada do Técnico Selecionado
  const [tecnicoRotaSelecionado, setTecnicoRotaSelecionado] = useState(null);

  const [osSelecionada, setOsSelecionada] = useState(null);
  const [mapCenter, setMapCenter] = useState(CENTRO_PADRAO);
  const [mapZoom, setMapZoom] = useState(12);
  const [copiadoId, setCopiadoId] = useState(null);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const [resOrdens, resUsuarios] = await Promise.all([
        api.get('/ordens-servico', { timeout: 8000 }),
        api.get('/usuarios', { timeout: 8000 }).catch(() => ({ data: [] }))
      ]);

      setOrdens(resOrdens.data || []);
      const agentes = (resUsuarios.data || []).filter(
        (u) => (u.perfil || '').toUpperCase() === 'AGENTE'
      );
      setTecnicos(agentes.length > 0 ? agentes : (resUsuarios.data || []));
    } catch (err) {
      console.error('Erro ao buscar dados do mapa:', err);
      setErro('Não foi possível carregar as ordens e equipe no mapa. Verifique a conexão.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Navegação de Datas
  const mudarDataRelativa = (dias) => {
    setVerTodasAsDatas(false);
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia + dias, 12, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    setDataSelecionada(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  const irParaHoje = () => {
    setVerTodasAsDatas(false);
    setDataSelecionada(obterDataLocalHoje());
  };

  // Filtragem das Ordens por Data
  const ordensFiltradasData = useMemo(() => {
    if (verTodasAsDatas) return ordens;
    const pad = (n) => String(n).padStart(2, '0');
    return ordens.filter((o) => {
      if (!o.dataAgendamento) return false;
      const d = new Date(o.dataAgendamento);
      const dataLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return dataLocal === dataSelecionada;
    });
  }, [ordens, verTodasAsDatas, dataSelecionada]);

  // Associação determinística ou real de coordenadas geográficas
  const ordensComCoordenadas = useMemo(() => {
    return ordensFiltradasData.map((os) => {
      const latOffset = (((os.id * 19) % 100) - 50) * 0.0018;
      const lngOffset = (((os.id * 31) % 100) - 50) * 0.0022;

      const pos = (os.cliente?.latitude && os.cliente?.longitude)
        ? [os.cliente.latitude, os.cliente.longitude]
        : [CENTRO_PADRAO[0] + latOffset, CENTRO_PADRAO[1] + lngOffset];

      return {
        ...os,
        posicao: pos
      };
    });
  }, [ordensFiltradasData]);

  // Filtro de Ordens por Status
  const ordensExibidas = useMemo(() => {
    if (filtroStatus === 'TODOS') return ordensComCoordenadas;
    return ordensComCoordenadas.filter((o) => (o.status || 'ABERTA') === filtroStatus);
  }, [ordensComCoordenadas, filtroStatus]);

  // Cálculo da Posição dos Colaboradores em Campo em Tempo Real
  const tecnicosComPosicao = useMemo(() => {
    return tecnicos.map((t) => {
      // Ordens do técnico na data selecionada
      const ordensDoTecnico = ordensComCoordenadas
        .filter((o) => o.agente?.id === t.id)
        .sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));

      const emAtendimento = ordensDoTecnico.find((o) => o.status === 'EM_ATENDIMENTO');
      const emDeslocamento = ordensDoTecnico.find((o) => o.status === 'EM_DESLOCAMENTO');
      const concluidas = ordensDoTecnico.filter((o) => o.status === 'CONCLUIDA');

      if (emAtendimento) {
        return {
          tecnico: t,
          posicao: emAtendimento.posicao,
          status: 'EM_ATENDIMENTO',
          textoStatus: `Em atendimento: ${emAtendimento.cliente?.nome || 'Cliente'} (OS #${emAtendimento.id})`,
          tipo: 'EM_ATENDIMENTO',
          cor: '#9333ea',
          ordensHoje: ordensDoTecnico,
          osAtual: emAtendimento
        };
      }

      if (emDeslocamento) {
        return {
          tecnico: t,
          posicao: emDeslocamento.posicao,
          status: 'EM_DESLOCAMENTO',
          textoStatus: `A caminho de: ${emDeslocamento.cliente?.nome || 'Cliente'} (OS #${emDeslocamento.id})`,
          tipo: 'EM_DESLOCAMENTO',
          cor: '#6366f1',
          ordensHoje: ordensDoTecnico,
          osAtual: emDeslocamento
        };
      }

      if (concluidas.length > 0) {
        const ultima = concluidas[concluidas.length - 1];
        return {
          tecnico: t,
          posicao: ultima.posicao,
          status: 'CONCLUIDA',
          textoStatus: `Último local: ${ultima.cliente?.nome || 'Cliente'} (OS #${ultima.id})`,
          tipo: 'CONCLUIDA',
          cor: '#059669',
          ordensHoje: ordensDoTecnico,
          osAtual: ultima
        };
      }

      // Na sede com pequeno desvio radial proporcional ao ID para não sobrepor
      const rad = (t.id * 1.25);
      const sedeOffsetLat = Math.sin(rad) * 0.0016;
      const sedeOffsetLng = Math.cos(rad) * 0.0016;

      return {
        tecnico: t,
        posicao: [COORDENADAS_SEDE[0] + sedeOffsetLat, COORDENADAS_SEDE[1] + sedeOffsetLng],
        status: 'NA_SEDE',
        textoStatus: 'Na Sede Operacional (Base de Despacho)',
        tipo: 'NA_SEDE',
        cor: '#2563eb',
        ordensHoje: ordensDoTecnico,
        osAtual: null
      };
    });
  }, [tecnicos, ordensComCoordenadas]);

  // Dados da Rota Encadeada do Técnico Selecionado
  const rotaTecnicoSelecionado = useMemo(() => {
    if (!tecnicoRotaSelecionado) return null;

    const ordensDaRota = ordensComCoordenadas
      .filter((o) => o.agente?.id === tecnicoRotaSelecionado.id)
      .sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));

    const pontos = [COORDENADAS_SEDE, ...ordensDaRota.map((o) => o.posicao)];
    const distanciaTotalKm = ordensDaRota.reduce((acc, o) => acc + (o.distanciaDeslocamentoKm || 5.2), 0);
    const tempoTotalMin = ordensDaRota.reduce((acc, o) => acc + (o.tempoDeslocamentoMinutos || 30), 0);

    return {
      tecnico: tecnicoRotaSelecionado,
      ordens: ordensDaRota,
      pontos,
      distanciaTotalKm,
      tempoTotalMin
    };
  }, [tecnicoRotaSelecionado, ordensComCoordenadas]);

  // Centralizar na localização do usuário
  const obterMinhaLocalizacao = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapZoom(13);
        },
        (err) => {
          console.warn('GPS não autorizado ou indisponível:', err);
        }
      );
    }
  };

  const centralizarSede = () => {
    setMapCenter(COORDENADAS_SEDE);
    setMapZoom(14);
  };

  const copiarLinkRastreio = (os) => {
    const cod = os.codigoRastreio || `TRK-OS${os.id}`;
    const url = `${window.location.origin}/rastreio/${cod}`;
    navigator.clipboard.writeText(url);
    setCopiadoId(os.id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  const isHoje = dataSelecionada === obterDataLocalHoje() && !verTodasAsDatas;

  return (
    <div className="space-y-4">
      {/* Barra de Navegação da Tríade Operacional */}
      <NavegacaoOperacional />

      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="text-blue-600" size={24} />
            <span>Mapa Operacional em Tempo Real</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhe a geolocalização ao vivo dos colaboradores, rotas de entrega e chamados em campo.
          </p>
        </div>

        {/* Controles de Navegação da Data & Ações */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor Rápido de Data */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-xs">
            <button
              onClick={() => mudarDataRelativa(-1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Dia anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={irParaHoje}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isHoje ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Hoje (Ao Vivo)
            </button>
            <button
              onClick={() => mudarDataRelativa(1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Próximo dia"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => {
              setVerTodasAsDatas(false);
              setDataSelecionada(e.target.value);
            }}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button
            onClick={() => setVerTodasAsDatas(!verTodasAsDatas)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              verTodasAsDatas
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {verTodasAsDatas ? '✓ Todas as Datas' : 'Ver Todas Datas'}
          </button>

          <button
            onClick={centralizarSede}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            title="Centralizar na Sede Operacional (Prefeitura de SP)"
          >
            <Home size={14} className="text-amber-600" />
            <span className="hidden sm:inline">Sede</span>
          </button>

          <button
            onClick={obterMinhaLocalizacao}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-2.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            title="Recentralizar no meu GPS"
          >
            <Navigation size={14} className="text-blue-600" />
            <span className="hidden sm:inline">Meu GPS</span>
          </button>

          <button
            onClick={carregarDados}
            disabled={carregando}
            className="p-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer transition-all"
            title="Atualizar dados"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Alerta de erro */}
      {erro && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{erro}</span>
          </div>
          <button onClick={carregarDados} className="underline font-semibold cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Barra de Filtros Rápidos, Camadas e Seletor de Rota */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Toggles de Camadas (Layers) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-bold uppercase text-[10px] px-1 flex items-center gap-1 shrink-0 tracking-wider">
            <Layers size={13} /> Camadas:
          </span>

          <button
            onClick={() => setExibirSede(!exibirSede)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              exibirSede
                ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs font-semibold'
                : 'bg-slate-50 text-slate-400 border border-slate-200'
            }`}
          >
            <span>🏛️ Sede</span>
          </button>

          <button
            onClick={() => setExibirTecnicos(!exibirTecnicos)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              exibirTecnicos
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs font-semibold'
                : 'bg-slate-50 text-slate-400 border border-slate-200'
            }`}
          >
            <User size={12} />
            <span>Técnicos ({tecnicosComPosicao.length})</span>
          </button>

          <button
            onClick={() => setExibirOrdens(!exibirOrdens)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              exibirOrdens
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-semibold'
                : 'bg-slate-50 text-slate-400 border border-slate-200'
            }`}
          >
            <MapPin size={12} />
            <span>Chamados ({ordensComCoordenadas.length})</span>
          </button>
        </div>

        {/* Seletor de Rota por Colaborador */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-semibold text-xs shrink-0 flex items-center gap-1">
            <RouteIcon size={14} className="text-blue-600" /> Traçar Rota:
          </span>
          <select
            value={tecnicoRotaSelecionado ? String(tecnicoRotaSelecionado.id) : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setTecnicoRotaSelecionado(null);
              } else {
                const tec = tecnicos.find((t) => String(t.id) === val);
                setTecnicoRotaSelecionado(tec || null);
                if (tec) {
                  // Centraliza no técnico
                  const tecPos = tecnicosComPosicao.find((tp) => tp.tecnico.id === tec.id);
                  if (tecPos) {
                    setMapCenter(tecPos.posicao);
                    setMapZoom(13);
                  }
                }
              }
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-56 cursor-pointer"
          >
            <option value="">Nenhuma rota selecionada</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} ({ordensComCoordenadas.filter((o) => o.agente?.id === t.id).length} paradas hoje)
              </option>
            ))}
          </select>
          {tecnicoRotaSelecionado && (
            <button
              onClick={() => setTecnicoRotaSelecionado(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Limpar traçado de rota"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Container do Mapa Leaflet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative h-[70vh] min-h-[500px]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <RecenterController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 1. Marcador da Sede Operacional */}
          {exibirSede && (
            <Marker position={COORDENADAS_SEDE} icon={criarIconeSede()}>
              <Popup>
                <div className="p-1 space-y-2 min-w-[220px] text-slate-800">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-base">🏛️</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">Sede Operacional</h4>
                      <span className="text-[10px] text-blue-600 font-semibold uppercase">Base de Despacho</span>
                    </div>
                  </div>
                  <p className="text-2xs text-slate-600 leading-snug">
                    Prefeitura de São Paulo • Viaduto do Chá, 15 - Centro Histórico
                  </p>
                  <div className="bg-blue-50 border border-blue-200/60 rounded-lg p-2 text-2xs text-blue-900 space-y-1">
                    <span className="font-semibold block">Ponto de Partida Diário</span>
                    <p className="text-blue-700">
                      Origem das rotas calculadas para os {tecnicos.length} colaboradores de campo.
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* 2. Traçado de Rota do Colaborador Selecionado (Polyline) */}
          {rotaTecnicoSelecionado && rotaTecnicoSelecionado.pontos.length > 1 && (
            <Polyline
              positions={rotaTecnicoSelecionado.pontos}
              pathOptions={{
                color: '#2563eb',
                weight: 4.5,
                opacity: 0.85,
                dashArray: '8, 8',
                lineJoin: 'round'
              }}
            />
          )}

          {/* 3. Marcadores dos Colaboradores em Campo */}
          {exibirTecnicos && tecnicosComPosicao.map((item) => {
            const isSelecionado = tecnicoRotaSelecionado?.id === item.tecnico.id;

            return (
              <Marker
                key={`tec-${item.tecnico.id}`}
                position={item.posicao}
                icon={criarIconeTecnico(item.tecnico, item, isSelecionado)}
              >
                <Popup>
                  <div className="p-1 space-y-2 min-w-[220px] text-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {item.tecnico.nome.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-slate-900">{item.tecnico.nome}</span>
                      </div>
                      <span 
                        className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase"
                        style={{ backgroundColor: `${item.cor}20`, color: item.cor }}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-2xs text-slate-600 space-y-1">
                      <p className="font-semibold flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        <span>{item.textoStatus}</span>
                      </p>
                      <p className="text-slate-500">
                        {item.ordensHoje.length} ordens de serviço agendadas para hoje.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTecnicoRotaSelecionado(item.tecnico)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      <RouteIcon size={13} />
                      <span>{isSelecionado ? 'Rota Já Ativa' : 'Ver Rota do Dia no Mapa'}</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 4. Marcadores das Ordens de Serviço */}
          {exibirOrdens && ordensExibidas.map((o) => {
            const statusKey = o.status || 'ABERTA';
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ABERTA;

            // Identifica se faz parte da rota selecionada e qual o número da parada
            let sequenciaRota = null;
            if (rotaTecnicoSelecionado) {
              const idx = rotaTecnicoSelecionado.ordens.findIndex((ro) => ro.id === o.id);
              if (idx !== -1) {
                sequenciaRota = idx + 1;
              }
            }

            return (
              <Marker
                key={`os-${o.id}`}
                position={o.posicao}
                icon={criarIconeStatus(statusKey, o.id, o, sequenciaRota)}
              >
                <Popup>
                  <div className="p-1 space-y-2 min-w-[230px] text-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-blue-600">OS #{o.id}</span>
                        {sequenciaRota != null && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                            {sequenciaRota}ª Parada
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <p className="font-semibold text-xs text-slate-900 leading-tight">
                      {o.titulo}
                    </p>

                    {o.equipamento && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{getCategoriaInfo(o.equipamento.categoria).emoji}</span>
                          <span className="truncate">{o.equipamento.nome}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{o.cliente?.nome || 'Cliente não informado'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{o.agente?.nome || 'Sem técnico atribuído'}</span>
                      </div>
                      {o.dataAgendamento && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                          <Clock size={12} className="text-slate-400 shrink-0" />
                          <span>
                            {new Date(o.dataAgendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>

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

        {/* Painel Flutuante Lateral da Rota Encadeada do Técnico */}
        {rotaTecnicoSelecionado && (
          <div className="absolute top-3 right-3 z-20 w-80 max-h-[85%] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col space-y-3 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
                  <RouteIcon size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 leading-tight">
                    Rota: {rotaTecnicoSelecionado.tecnico.nome}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {rotaTecnicoSelecionado.ordens.length} paradas • ~{rotaTecnicoSelecionado.distanciaTotalKm.toFixed(1)} km
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTecnicoRotaSelecionado(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Lista Sequencial dos Nós da Rota */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
              {/* Ponto 0: Sede */}
              <div 
                onClick={centralizarSede}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏛️</span>
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">Sede Operacional (Base)</span>
                    <span className="text-[10px] text-slate-400">Ponto de Partida • 08:00</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Início</span>
              </div>

              {/* Paradas 1..N */}
              {rotaTecnicoSelecionado.ordens.length === 0 ? (
                <p className="text-2xs text-slate-500 italic text-center py-4">
                  Nenhuma ordem agendada para este colaborador na data selecionada.
                </p>
              ) : (
                rotaTecnicoSelecionado.ordens.map((o, idx) => {
                  const paradaNum = idx + 1;
                  const dataAg = new Date(o.dataAgendamento);
                  const horaStr = dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.ABERTA;

                  return (
                    <div
                      key={o.id}
                      onClick={() => {
                        setMapCenter(o.posicao);
                        setMapZoom(15);
                      }}
                      className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {paradaNum}º
                          </span>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 truncate max-w-[130px]">
                            {o.cliente?.nome || 'Cliente'}
                          </span>
                        </div>
                        <span className="font-mono font-semibold text-[10px] text-slate-600">{horaStr}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 pl-6.5 truncate">
                        OS #{o.id} • {o.titulo}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setTecnicoRotaSelecionado(null)}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center"
              >
                Ocultar Rota
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes Completo da OS */}
      <DetalhesOSModal
        os={osSelecionada}
        isOpen={Boolean(osSelecionada)}
        onClose={() => setOsSelecionada(null)}
        onOSAtualizada={carregarDados}
      />
    </div>
  );
}
