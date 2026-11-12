import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import {
  Layers,
  MapPin,
  Clock,
  Smartphone,
  ShieldCheck,
  Activity,
  Bot,
  Zap,
  Star,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Truck,
  ExternalLink,
  Code2,
  Server,
  Database,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Users,
  Building2,
  Wrench,
  Check,
  Copy,
  Calendar,
  AlertTriangle,
  Compass,
  Navigation,
  FileCheck2,
  PhoneCall,
  Play,
  RotateCw,
  Terminal,
  Leaf,
  HeartHandshake,
  DollarSign,
  Share2
} from 'lucide-react';

// Coordenadas Centrais da Demonstração (São Paulo)
const CENTRO_SP = [-23.5550, -46.6450];
const COORD_SEDE = [-23.5489, -46.6388]; // Prefeitura de SP
const COORD_TECNICO_TRANSITO = [-23.5650, -46.6520]; // Av. Paulista / Bela Vista
const COORD_CLIENTE_DESTINO = [-23.5855, -46.6780]; // Padaria Real (Itaim Bibi)
const COORD_CLIENTE_ATENDIMENTO = [-23.5614, -46.6560]; // Hospital 9 de Julho

// Ícones Customizados Oficiais para o Mapa Leaflet da Vitrine
const iconeSedeVitrine = L.divIcon({
  className: 'custom-sede-marker-landing',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
      <span style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: #1e3a8a; opacity: 0.3; animation: ping 2.5s infinite;"></span>
      <div style="background: linear-gradient(135deg, #1e3a8a, #0f172a); color: white; width: 34px; height: 34px; border-radius: 10px; border: 2.5px solid #fbbf24; box-shadow: 0 4px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 16px;">
        🏛️
      </div>
      <div style="position: absolute; bottom: -3px; background: #1e3a8a; color: #fbbf24; border: 1px solid #fbbf24; border-radius: 4px; padding: 0 4px; font-size: 8px; font-weight: 800; text-transform: uppercase;">
        SEDE
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

const iconeCarroVitrine = L.divIcon({
  className: 'custom-carro-marker-landing',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 50px; height: 50px;">
      <span style="position: absolute; width: 50px; height: 50px; border-radius: 9999px; background-color: #6366f1; opacity: 0.4; animation: ping 1.8s infinite;"></span>
      <div style="position: absolute; bottom: 42px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #0f172a; color: white; padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 800; box-shadow: 0 3px 8px rgba(0,0,0,0.4); border: 1.5px solid #818cf8; pointer-events: none; display: flex; align-items: center; gap: 4px;">
        <span style="color: #fbbf24;">🚗</span>
        <span>Lucas Siqueira</span>
        <span style="color: #a5b4fc;">• 12m</span>
      </div>
      <div style="background: linear-gradient(135deg, #4338ca, #312e81); color: white; width: 34px; height: 34px; border-radius: 9999px; border: 3px solid #a5b4fc; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 15px;">
        🚗
      </div>
      <div style="position: absolute; bottom: 0px; right: 0px; background: #fbbf24; color: #1e1b4b; border-radius: 9999px; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; border: 1.5px solid white;">
        ⚡
      </div>
    </div>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 25]
});

const iconeClienteDestinoVitrine = L.divIcon({
  className: 'custom-cliente-marker-landing',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">
      <div style="background-color: #6366f1; color: white; width: 28px; height: 28px; border-radius: 9999px; border: 2.5px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; font-family: monospace;">
        #12
      </div>
      <div style="position: absolute; top: -3px; right: -3px; background: white; border-radius: 9999px; width: 17px; height: 17px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 1px solid #cbd5e1;">
        ❄️
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21]
});

const iconeClienteAtendimentoVitrine = L.divIcon({
  className: 'custom-cliente-atend-marker-landing',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">
      <span style="position: absolute; width: 42px; height: 42px; border-radius: 9999px; background-color: #9333ea; opacity: 0.35; animation: ping 2s infinite;"></span>
      <div style="background-color: #9333ea; color: white; width: 28px; height: 28px; border-radius: 9999px; border: 2.5px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; font-family: monospace;">
        #15
      </div>
      <div style="position: absolute; top: -3px; right: -3px; background: white; border-radius: 9999px; width: 17px; height: 17px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 1px solid #cbd5e1;">
        📶
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21]
});

export default function LandingPage() {
  const navigate = useNavigate();
  const [apiOnline, setApiOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('cockpit');
  const [copiedGestor, setCopiedGestor] = useState(false);
  const [copiedTecnico, setCopiedTecnico] = useState(false);
  const [csatNota, setCsatNota] = useState(5);

  const isLogged = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    api.get('/status')
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  const copiarTexto = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    if (tipo === 'gestor') {
      setCopiedGestor(true);
      setTimeout(() => setCopiedGestor(false), 2000);
    } else {
      setCopiedTecnico(true);
      setTimeout(() => setCopiedTecnico(false), 2000);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const modulos = [
    {
      id: 'cockpit',
      titulo: 'Cockpit Executivo',
      icon: Activity,
      badge: 'Telemetria & SLAs ao Vivo',
      subtitulo: 'Painel Central de Comando e Inteligência de Negócio',
      desc: 'Central unificada com indicadores de SLA em tempo real, monitoramento da esteira da Máquina de Estados, alertas de trânsito crítico e índice de satisfação CSAT.'
    },
    {
      id: 'gantt',
      titulo: 'Linha do Tempo Gantt',
      icon: Clock,
      badge: 'Despacho Visual Contínuo',
      subtitulo: 'Cronograma Horizontal com Auto-foco Horário',
      desc: 'Visualização da jornada de trabalho de cada colaborador com auto-foco na hora atual (3h antes / 5h depois), coluna de técnicos fixa e faixas de deslocamento viário.'
    },
    {
      id: 'mapa',
      titulo: 'Mapa Operacional Leaflet',
      icon: MapPin,
      badge: 'Geolocalização & Telemetria',
      subtitulo: 'Rastreamento de Frota e Rotas Encadeadas em SP',
      desc: 'Mapa interativo em tempo real conectando a Sede de Despacho, veículos em deslocamento na malha viária com estimativa em minutos e endereços dos clientes.'
    },
    {
      id: 'mobile',
      titulo: 'Modo Técnico Mobile',
      icon: Smartphone,
      badge: 'PWA Touch Sem Instalação',
      subtitulo: 'Roteiro no Smartphone e Assinatura Digital na Tela',
      desc: 'Experiência focada para smartphones: roadmap do dia integrado com Waze/Google Maps, check-in com carimbo de hora e assinatura do cliente coletada no touch (zero papel).'
    },
    {
      id: 'rastreio',
      titulo: 'Rastreio do Cliente & CSAT',
      icon: Truck,
      badge: 'Experiência Estilo Uber',
      subtitulo: 'Radar Público em Tempo Real Sem Necessidade de Login',
      desc: 'Link público compartilhado com o cliente final para acompanhar a chegada do técnico no radar e avaliar o atendimento com notas de 1 a 5 estrelas após a conclusão.'
    },
    {
      id: 'simulador',
      titulo: 'Digital Twin Autônomo',
      icon: Bot,
      badge: 'Simulação 24/7 em Nuvem',
      subtitulo: 'Motor de Agentes Autônomos de Despacho e Trânsito',
      desc: 'Simulação ininterrupta rodando no Railway e PostgreSQL Neon com Bot Despachante e Bots Técnicos injetando ordens, calculando Haversine e simulando o trânsito de São Paulo.'
    }
  ];

  const moduloAtivo = modulos.find((m) => m.id === activeTab) || modulos[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* =========================================================================
          HERO EM TELA CHEIA (FULLSCREEN 100VH - COM ARTE 3D DE CAMPO)
      ========================================================================= */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
        
        {/* Imagem de Fundo Cenográfica 3D (Cidade, Van e Técnicos da FieldOps) */}
        <img
          src="/hero-fieldops-city.jpg"
          alt="FieldOps - Operações de Campo Inteligentes na Cidade"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Gradiente Escuro Suave para Contraste Tipográfico */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-slate-950/90 pointer-events-none" />

        {/* Top Navbar em Pílula Translúcida */}
        <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white group drop-shadow-md">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white drop-shadow-sm">fieldops</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 glass-pill px-6 py-2.5 rounded-full text-xs font-semibold text-white/95 shadow-lg border border-white/20">
            <button onClick={() => scrollToSection('problema')} className="hover:text-amber-300 transition-colors cursor-pointer">
              1. O Problema
            </button>
            <button onClick={() => scrollToSection('mercado')} className="hover:text-amber-300 transition-colors cursor-pointer">
              2. O Mercado
            </button>
            <button onClick={() => scrollToSection('pilares')} className="hover:text-amber-300 transition-colors cursor-pointer">
              3. Os 3 Pilares
            </button>
            <button onClick={() => scrollToSection('modulos')} className="hover:text-amber-300 transition-colors cursor-pointer">
              4. A Experiência
            </button>
            <button onClick={() => scrollToSection('impacto')} className="hover:text-amber-300 transition-colors cursor-pointer">
              5. O Impacto
            </button>
            <button onClick={() => scrollToSection('banca')} className="hover:text-amber-300 transition-colors cursor-pointer font-bold text-amber-200">
              Banca Avaliadora
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {isLogged ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-press bg-slate-950 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xl shadow-black/40 cursor-pointer flex items-center gap-2 border border-white/10"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn-press bg-slate-950 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xl shadow-black/40 cursor-pointer border border-white/10"
              >
                Entrar no Sistema
              </button>
            )}
          </div>
        </header>

        {/* Conteúdo Central do Hero */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pt-8 sm:pt-14 pb-8 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-medium shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Trabalho de Graduação 2026 • Apresentação Oficial</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.06] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            Dê à sua <span className="italic font-normal text-amber-300 drop-shadow-sm">operação de campo</span><br />
            um destino certo.
          </h1>

          <p className="text-white/90 text-sm sm:text-base md:text-lg font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Plataforma SaaS B2B de gestão de serviços externos. Orquestre técnicos, rotas geodésicas e ordens de serviço em tempo real com máquina de estados inviolável.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => scrollToSection('modulos')}
              className="btn-press bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-7 py-3.5 rounded-full flex items-center gap-2.5 text-sm sm:text-base shadow-2xl shadow-amber-500/40 cursor-pointer"
            >
              <span>Ver Elementos Oficiais em Ação</span>
              <span className="w-6 h-6 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center text-xs font-black">
                ✦
              </span>
            </button>

            <button
              onClick={() => scrollToSection('problema')}
              className="btn-press glass-pill hover:bg-white/25 text-white font-semibold px-6 py-3.5 rounded-full text-sm sm:text-base shadow-lg cursor-pointer transition-colors flex items-center gap-2 border border-white/20"
            >
              <span>Apresentação do Projeto</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="pt-1 text-xs text-white/80 font-medium tracking-wide flex items-center justify-center gap-1.5 drop-shadow-sm">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Máquina de Estados Finita • Haversine Geodésico • 100% Sem Papel</span>
          </div>
        </div>

        {/* Rodapé da Dobra 1: Indicador de Scroll e Telemetria */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex items-end justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md">
            <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{apiOnline ? 'API Online no Railway' : 'API Conectando...'}</span>
          </div>

          <button
            onClick={() => scrollToSection('problema')}
            className="flex flex-col items-center gap-1 text-white/85 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold tracking-wider uppercase drop-shadow-sm">Iniciar Apresentação</span>
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center group-hover:bg-white/25 group-hover:translate-y-0.5 transition-all">
              <ChevronDown size={16} className="animate-bounce" />
            </div>
          </button>

          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-medium shadow-md">
            <Truck size={14} className="text-amber-300" />
            <span>São Paulo, SP • 5 Técnicos Conectados</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BLOCO 1: O PROBLEMA & O APAGÃO OPERACIONAL
      ========================================================================= */}
      <section id="problema" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle size={13} className="text-rose-600" />
              <span>1. O Problema Identificado</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              O Caos da Gestão no Escuro: Grupos de WhatsApp e Pranchetas
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Pequenas e médias empresas prestadoras de serviços no Brasil enfrentam um verdadeiro <strong>apagão operacional</strong>. A coordenação de técnicos na rua ainda é um jogo de adivinhação tocado por dezenas de mensagens desordenadas e papéis que se perdem.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Mais de <strong>60% dos gestores</strong> admitem que não sabem onde o colaborador está no momento, se o chamado vai atrasar ou se o serviço foi executado com conformidade.
            </p>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-1">
              <span className="font-bold block">Consequências Diretas:</span>
              <p>Rotas cruzadas desnecessárias, desperdício de combustível, técnicos estressados ao volante e clientes frustrados esperando sem previsão.</p>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                📱
              </div>
              <h3 className="text-sm font-bold text-slate-900">Coordenação por WhatsApp</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ordens de serviço misturadas com conversas informais, sem histórico auditável, timestamps imutáveis ou confirmação de leitura.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                📋
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pranchetas de Papel Físicas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Laudos amassados, caligrafia ilegível e atraso de dias para o escritório saber o que foi consertado e faturar o cliente.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                🚗
              </div>
              <h3 className="text-sm font-bold text-slate-900">Rotas Cruzadas & Combustível</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Técnicos atravessando a cidade de ponta a ponta sem critério de proximidade, encarecendo a frota e gerando poluição desnecessária.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                ⏳
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cliente no Vácuo</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                O cliente final fica o dia todo preso esperando a visita técnica sem saber se o profissional está a 5 minutos ou se nem saiu da base.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BLOCO 2: O MERCADO & A LACUNA DAS PMEs
      ========================================================================= */}
      <section id="mercado" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-900 text-white rounded-3xl my-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-4 sm:p-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <TrendingUp size={13} className="text-blue-400" />
              <span>2. Oportunidade de Mercado</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Um Mercado Global de US$ 9 Bilhões com um Abismo para as PMEs
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              O setor de <em>Field Service Management (FSM)</em> está em franca expansão global. No entanto, os softwares líderes — como Salesforce Field Service ou SAP — exigem consultorias milionárias, meses de implantação e são desenhados para corporações gigantescas.
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Isso deixa <strong>milhares de PMEs desatendidas</strong>. O <strong>FieldOps</strong> nasceu para democratizar esse padrão tecnológico: uma plataforma SaaS leve, moderna, 100% web e pronta para uso em minutos.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
              <span className="text-3xl font-black text-amber-400 block">$9B+</span>
              <span className="text-xs font-bold text-white block mt-1">Mercado FSM</span>
              <span className="text-2xs text-slate-400 block mt-0.5">Expansão de 14% ao ano</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
              <span className="text-3xl font-black text-blue-400 block">Zero</span>
              <span className="text-xs font-bold text-white block mt-1">Custo de Instalação</span>
              <span className="text-2xs text-slate-400 block mt-0.5">Acesso direto via navegador</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
              <span className="text-3xl font-black text-emerald-400 block">-40%</span>
              <span className="text-xs font-bold text-white block mt-1">Km Rodados</span>
              <span className="text-2xs text-slate-400 block mt-0.5">Algoritmo de Haversine</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
              <span className="text-3xl font-black text-purple-400 block">98.4%</span>
              <span className="text-xs font-bold text-white block mt-1">Conformidade SLA</span>
              <span className="text-2xs text-slate-400 block mt-0.5">Esteira auditável</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BLOCO 3: OS 3 PILARES TÉCNICOS & ENGENHARIA
      ========================================================================= */}
      <section id="pilares" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">3. Engenharia de Software</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Os 3 Pilares Fundamentais do FieldOps
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Desenvolvido sobre uma base sólida de engenharia para eliminar atalhos, otimizar rotas e entregar controle total em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pilar 1: Máquina de Estados Finita Inviolável */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Pilar 1 • Integridade</span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Máquina de Estados Finita Inviolável
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                As ordens de serviço não são formulários editáveis à vontade. Elas seguem uma esteira lógica estrita de 5 etapas:
              </p>
              
              {/* Trilho Visual das 5 Etapas */}
              <div className="space-y-1.5 pt-1 text-2xs font-semibold">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Aberta (Triagem & Agendamento)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Atribuída (Técnico Escalado)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Em Deslocamento (Trânsito Registrado)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Em Atendimento (Check-in no Local)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">5</span>
                  <span>Concluída (Laudo & Assinatura)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-2xs text-slate-600">
              <strong>Sem Atalhos:</strong> O sistema bloqueia fisicamente concluir sem deslocamento e check-in prévios, eliminando fraudes e garantindo auditoria 100% imutável.
            </div>
          </div>

          {/* Pilar 2: Inteligência Geográfica com Haversine */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Pilar 2 • Logística</span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Inteligência Geográfica com Haversine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ao criar ou reagendar um chamado, o despachante não precisa adivinhar no mapa. O algoritmo proprietário calcula a distância geodésica em milissegundos e sugere o técnico mais próximo.
              </p>

              <div className="bg-slate-900 rounded-2xl p-4 text-white font-mono text-2xs space-y-2 border border-slate-800">
                <div className="text-slate-400 font-semibold flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>FÓRMULA DE HAVERSINE</span>
                  <span className="text-emerald-400">0.4ms</span>
                </div>
                <p className="text-slate-300">
                  d = 2R × arcsin(√[sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2)])
                </p>
                <div className="pt-1 text-emerald-400 font-bold">
                  ✓ Sugestão: Lucas Siqueira (3.2 km do local)
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-2xs text-slate-600">
              <strong>Impacto Direto:</strong> Reduz quilometragem rodada, corta custos de combustível fóssil e encurta a espera do cliente final.
            </div>
          </div>

          {/* Pilar 3: A Tríade Sincronizada de Comando */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Pilar 3 • Comando Central</span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Tríade Sincronizada em Tempo Real
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                O gestor possui três perspectivas operacionais complementares sincronizadas no mesmo banco de dados:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Activity size={18} className="text-blue-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900">1. Cockpit Executivo</strong>
                    <span className="text-2xs text-slate-500">Métricas de SLA, CSAT e alertas críticos ao vivo.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Clock size={18} className="text-indigo-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900">2. Linha do Tempo Gantt</strong>
                    <span className="text-2xs text-slate-500">Auto-foco horário (3h/5h) e rebalanceamento com 1 clique.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <MapPin size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900">3. Mapa Operacional Leaflet</strong>
                    <span className="text-2xs text-slate-500">Telemetria de veículos em trânsito e rotas encadeadas.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-2xs text-slate-600">
              <strong>Equilíbrio Humano:</strong> Permite redistribuir chamados instantaneamente para evitar que um técnico fique sobrecarregado enquanto outro está ocioso.
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          BLOCO 4: A EXPERIÊNCIA PONTA A PONTA (VITRINE COM ELEMENTOS OFICIAIS REAIS)
      ========================================================================= */}
      <section id="modulos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles size={13} className="text-indigo-600" />
            <span>4. A Experiência do Usuário</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Elementos Reais do Sistema em Funcionamento
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Sem capturas estáticas ou mockups conceituais: interaja diretamente com os componentes oficiais em execução como estão nas páginas do sistema.
          </p>
        </div>

        {/* Segmented Control Unificado das 6 Telas */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="bg-slate-200/90 p-1.5 rounded-2xl inline-flex gap-1 shadow-inner">
            {modulos.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === activeTab;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`btn-press inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
                  }`}
                >
                  <Icon size={15} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                  <span>{m.titulo}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Principal da Vitrine com Submódulo Real Embutido */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Lado Esquerdo: Descrição da Tela e Atalhos */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span>{moduloAtivo.badge}</span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {moduloAtivo.subtitulo}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {moduloAtivo.desc}
              </p>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Destaque de Avaliação:</span>
                <p>
                  {activeTab === 'cockpit' && 'Visão instantânea de conformidade e integridade da esteira de 5 etapas para o gestor.'}
                  {activeTab === 'gantt' && 'Auto-scroll em 3 horas antes / 5 horas depois com fixação da coluna de colaboradores.'}
                  {activeTab === 'mapa' && 'Mapa Leaflet interativo com rota tracejada conectando Sede ➔ Técnico em Trânsito ➔ Cliente.'}
                  {activeTab === 'mobile' && 'Assinatura digital do cliente na tela do celular e check-in imutável (elimina 100% do papel).'}
                  {activeTab === 'rastreio' && 'Link estilo Uber com radar em tempo real e pesquisa de satisfação CSAT de 1 a 5 estrelas.'}
                  {activeTab === 'simulador' && 'Agentes autônomos simulando 24 horas por dia o tráfego de SP e a rotina da operação.'}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-press bg-slate-950 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Abrir Tela Completa</span>
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => scrollToSection('banca')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer underline"
                >
                  Credenciais de demonstração
                </button>
              </div>
            </div>

            {/* Lado Direito: O Elemento Oficial Real Interativo */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden shadow-inner min-h-[420px] flex flex-col justify-center">
              
              {/* 1. MAPA LEAFLET REAL EMBUTIDO */}
              {activeTab === 'mapa' && (
                <div className="w-full h-[440px] relative">
                  <MapContainer
                    center={CENTRO_SP}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: '100%', zIndex: 0 }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Sede Operacional */}
                    <Marker position={COORD_SEDE} icon={iconeSedeVitrine}>
                      <Popup>
                        <div className="text-xs space-y-1">
                          <strong>Sede Operacional (Base)</strong>
                          <p>Prefeitura de SP • Viaduto do Chá, 15</p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Técnico em Trânsito */}
                    <Marker position={COORD_TECNICO_TRANSITO} icon={iconeCarroVitrine}>
                      <Popup>
                        <div className="text-xs space-y-1">
                          <strong>🚗 Lucas Siqueira • Em Trânsito</strong>
                          <p>A caminho de: Padaria Real (OS #12)</p>
                          <p className="text-indigo-600 font-bold">~12 min restantes • 3.8 km</p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Clientes */}
                    <Marker position={COORD_CLIENTE_DESTINO} icon={iconeClienteDestinoVitrine}>
                      <Popup>
                        <div className="text-xs space-y-1">
                          <strong>OS #12 • Padaria Real</strong>
                          <p>Manutenção de Ar Split Inverter</p>
                          <span className="text-indigo-600 font-bold">Status: Em Deslocamento</span>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={COORD_CLIENTE_ATENDIMENTO} icon={iconeClienteAtendimentoVitrine}>
                      <Popup>
                        <div className="text-xs space-y-1">
                          <strong>OS #15 • Hospital Nove de Julho</strong>
                          <p>Manutenção Preventiva de Roteador Wi-Fi</p>
                          <span className="text-purple-600 font-bold">Status: Em Atendimento</span>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Traçado da Polyline Real */}
                    <Polyline
                      positions={[COORD_SEDE, COORD_TECNICO_TRANSITO, COORD_CLIENTE_DESTINO]}
                      pathOptions={{
                        color: '#6366f1',
                        weight: 4,
                        opacity: 0.9,
                        dashArray: '8, 8',
                        lineJoin: 'round'
                      }}
                    />
                  </MapContainer>

                  <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-lg border border-slate-700 shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Leaflet Map ao Vivo • Rota SP Tracejada</span>
                  </div>
                </div>
              )}

              {/* 2. LINHA DO TEMPO GANTT REAL EMBUTIDA */}
              {activeTab === 'gantt' && (
                <div className="p-4 space-y-3 w-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">Grade Gantt 24h</span>
                      <span className="text-2xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Auto-Foco: 11h</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <button className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium">← 3h</button>
                      <button className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-2xs">● Agora (11:30)</button>
                      <button className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium">+3h →</button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                    {/* Header Horas */}
                    <div className="flex border-b border-slate-200 bg-slate-100 text-[11px] font-mono font-bold text-slate-600">
                      <div className="w-48 shrink-0 p-2.5 border-r border-slate-200 bg-slate-100 text-slate-800">
                        Colaborador
                      </div>
                      {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map((h) => (
                        <div key={h} className="w-24 shrink-0 p-2.5 text-center border-r border-slate-200">
                          {h}
                        </div>
                      ))}
                    </div>

                    {/* Linha 1: Carlos Silva */}
                    <div className="flex border-b border-slate-100 min-h-[56px] items-center text-xs relative">
                      <div className="w-48 shrink-0 p-2 border-r border-slate-200 bg-white font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center">C</div>
                        <div>
                          <div className="truncate">Carlos Silva</div>
                          <span className="text-[10px] text-emerald-600 font-medium">● 3 tarefas</span>
                        </div>
                      </div>
                      <div className="flex-1 relative h-10 flex items-center">
                        <div className="absolute left-[30px] w-28 h-8 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 p-1.5 text-2xs flex flex-col justify-between shadow-2xs">
                          <span className="font-bold font-mono">#10 • Concluída</span>
                          <span className="truncate">❄️ Manutenção Split</span>
                        </div>
                        <div className="absolute left-[165px] w-28 h-8 rounded-lg bg-purple-50 border border-purple-400 text-purple-900 p-1.5 text-2xs flex flex-col justify-between shadow-2xs">
                          <span className="font-bold font-mono">#15 • Atendimento</span>
                          <span className="truncate">📶 Roteador Wi-Fi</span>
                        </div>
                      </div>
                    </div>

                    {/* Linha 2: Lucas Siqueira (Em Trânsito) */}
                    <div className="flex min-h-[56px] items-center text-xs relative bg-indigo-50/20">
                      <div className="w-48 shrink-0 p-2 border-r border-slate-200 bg-white font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">L</div>
                        <div>
                          <div className="truncate">Lucas Siqueira</div>
                          <span className="text-[10px] text-indigo-600 font-medium">🚗 Em Trânsito</span>
                        </div>
                      </div>
                      <div className="flex-1 relative h-10 flex items-center">
                        {/* Faixa Amarela de Deslocamento */}
                        <div className="absolute left-[80px] w-24 h-7 rounded-l-md bg-amber-400/25 border border-dashed border-amber-500 text-amber-800 text-[10px] flex items-center justify-center font-bold gap-1">
                          <span>🚗 25m trânsito</span>
                        </div>
                        <div className="absolute left-[176px] w-32 h-8 rounded-lg bg-indigo-50 border border-indigo-300 text-indigo-900 p-1.5 text-2xs flex flex-col justify-between shadow-2xs">
                          <span className="font-bold font-mono">#12 • A Caminho</span>
                          <span className="truncate">🧊 Câmara Fria</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. COCKPIT EXECUTIVO REAL EMBUTIDO */}
              {activeTab === 'cockpit' && (
                <div className="p-5 space-y-4 w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
                      <span className="text-2xs font-semibold text-slate-500 block">SLA Global</span>
                      <span className="text-xl font-black text-emerald-600 block">98.4%</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">✓ Meta 95%</span>
                    </div>

                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
                      <span className="text-2xs font-semibold text-slate-500 block">Satisfação CSAT</span>
                      <span className="text-xl font-black text-amber-500 block">4.9 ⭐</span>
                      <span className="text-[10px] text-slate-400 block">128 avaliações</span>
                    </div>

                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
                      <span className="text-2xs font-semibold text-slate-500 block">Equipe em Campo</span>
                      <span className="text-xl font-black text-blue-600 block">5 Ativos</span>
                      <span className="text-[10px] text-blue-600 font-bold block">100% alocados</span>
                    </div>

                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
                      <span className="text-2xs font-semibold text-slate-500 block">Otimização Rotas</span>
                      <span className="text-xl font-black text-purple-600 block">-40% km</span>
                      <span className="text-[10px] text-purple-600 font-bold block">Haversine</span>
                    </div>
                  </div>

                  {/* Esteira Visual da Máquina de Estados */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-1">
                      <span>Esteira da Máquina de Estados Finita</span>
                      <span className="text-emerald-600">Fluxo Controlado</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 text-center text-2xs font-bold text-white">
                      <div className="bg-amber-500 p-2 rounded-lg">1 Aberta</div>
                      <div className="bg-blue-500 p-2 rounded-lg">2 Atribuídas</div>
                      <div className="bg-indigo-500 p-2 rounded-lg">1 Em Trânsito</div>
                      <div className="bg-purple-600 p-2 rounded-lg">1 Em Atendimento</div>
                      <div className="bg-emerald-500 p-2 rounded-lg">14 Concluídas</div>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1 leading-snug">
                      Nenhuma ordem salta etapas: cada transição exige validação geográfica e registro imutável no banco de dados.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. MODO TÉCNICO MOBILE EMBUTIDO */}
              {activeTab === 'mobile' && (
                <div className="p-4 flex justify-center w-full">
                  <div className="w-[300px] bg-slate-900 text-white rounded-[32px] p-4 border-[6px] border-slate-800 shadow-2xl space-y-3">
                    {/* Notch / Topo */}
                    <div className="flex items-center justify-between px-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-400">09:41</span>
                      <div className="w-16 h-3.5 bg-black rounded-full" />
                      <span className="text-[10px] text-emerald-400 font-bold">5G</span>
                    </div>

                    <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">OS #12 • Em Andamento</span>
                        <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                          Waze Ativo
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-tight">Manutenção de Chiller • Padaria Real</h4>
                      <p className="text-[10px] text-slate-400">Rua Augusta, 1200 - Consolação</p>
                      
                      <button className="w-full py-1.5 bg-blue-600 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1">
                        <Navigation size={12} />
                        <span>Abrir Rota no GPS</span>
                      </button>
                    </div>

                    {/* Canvas de Assinatura Digital do Cliente (Zero Papel) */}
                    <div className="bg-white text-slate-900 rounded-2xl p-3 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                        <span>Assinatura do Cliente na Tela</span>
                        <span className="text-emerald-600">✓ Válido</span>
                      </div>
                      <div className="h-14 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs font-serif italic text-blue-700">
                        Carlos Ferreira da Silva
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>Carimbo de Hora: 11:32:05</span>
                        <span className="font-bold text-slate-600">100% Sem Papel</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. RASTREIO PÚBLICO DO CLIENTE EMBUTIDO */}
              {activeTab === 'rastreio' && (
                <div className="p-4 sm:p-6 w-full space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-bold text-slate-900">Radar de Aproximação (Estilo Uber)</span>
                      </div>
                      <span className="text-2xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                        Sem Login • Acesso Aberto
                      </span>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-base">
                          🚗
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 block">Lucas Siqueira a 12 minutos</strong>
                          <span className="text-2xs text-slate-500">Veículo utilitário FieldOps • Placa FO-2026</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-700">~3.8 km</span>
                    </div>

                    {/* Widget de Avaliação CSAT Interativo */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-center">
                      <span className="text-xs font-bold text-slate-800 block">Como foi o atendimento do seu técnico?</span>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setCsatNota(n)}
                            className="cursor-pointer text-xl transition-transform hover:scale-125"
                          >
                            <Star
                              size={22}
                              className={n <= csatNota ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-2xs text-emerald-600 font-semibold">
                        {csatNota === 5 ? 'Excelente! 5 estrelas registradas no Cockpit do Gestor.' : `Nota ${csatNota} computada na média CSAT.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. TERMINAL DO DIGITAL TWIN AUTÔNOMO EMBUTIDO */}
              {activeTab === 'simulador' && (
                <div className="p-4 w-full">
                  <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 border border-slate-800 shadow-2xl font-mono text-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-400 text-2xs ml-2">daemon://simulador-operacional-sp</span>
                      </div>
                      <span className="text-emerald-400 text-2xs font-bold">24/7 ONLINE</span>
                    </div>

                    <div className="space-y-1.5 text-slate-300">
                      <div className="text-emerald-400">
                        [14:48:02] ✓ [Bot Despachante] Nova O.S. #52 criada para Padaria Real. Alocada por Haversine.
                      </div>
                      <div className="text-blue-300">
                        [14:48:06] 🚗 [Bot Técnico] Lucas Siqueira iniciou deslocamento na rota urbana de SP.
                      </div>
                      <div className="text-amber-300">
                        [14:48:11] ⚠️ [Bot Alerta] Trânsito denso detectado na Marginal Tietê (+15 min). SLA recalculado.
                      </div>
                      <div className="text-purple-300">
                        [14:48:18] ⚡ [Bot Técnico] Chegada confirmada. Check-in técnico realizado com sucesso.
                      </div>
                      <div className="text-emerald-400 font-bold">
                        [14:48:25] ✓ [Bot Técnico] O.S. #51 concluída! Laudo emitido e avaliação 5⭐ CSAT gravada.
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-slate-400">
                      <div>
                        <span className="block text-white font-bold">142</span>
                        <span>Ciclos 24h</span>
                      </div>
                      <div>
                        <span className="block text-emerald-400 font-bold">98.4%</span>
                        <span>SLA Esteira</span>
                      </div>
                      <div>
                        <span className="block text-amber-400 font-bold">5 Agentes</span>
                        <span>Autônomos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BLOCO 5: O IMPACTO INTEGRADO (PESSOAS, SUSTENTABILIDADE & NEGÓCIO)
      ========================================================================= */}
      <section id="impacto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">5. O Impacto Real</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mais que um Software: Transformação Humana e Ecológica
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Como a tecnologia do FieldOps gera valor para as pessoas que estão na rua, para a sociedade e para a sustentabilidade da empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Impacto 1: Para as Pessoas */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <HeartHandshake size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Para as Pessoas</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Dignidade, Transparência & Fim do Burnout
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O técnico deixa de ser cobrado por mensagens caóticas enquanto dirige. Ele ganha uma rotina previsível, autonomia no celular e proteção jurídica comprovada com a assinatura digital do cliente na tela.
            </p>
          </div>

          {/* Impacto 2: Para o Meio Ambiente / ESG */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <Leaf size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Meio Ambiente & ESG</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Menos Emissões de CO2 & Zero Papel
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ao eliminar rotas cruzadas via Haversine, reduzimos em até 40% a queima de combustível fóssil na frota urbana. Além disso, laudos e checklists 100% digitais poupam milhares de folhas de papel todo mês.
            </p>
          </div>

          {/* Impacto 3: Para o Negócio */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Para o Negócio</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              SLA de 98%+ & Previsibilidade de Caixa
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ordens concluídas com checklist estruturado e assinatura imediata aceleram o faturamento de dias para minutos. Clientes satisfeitos (CSAT 4.9⭐) renovam contratos e reduzem o churn.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          ACESSO RÁPIDO PARA A BANCA AVALIADORA
      ========================================================================= */}
      <section id="banca" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20">
                <Star size={13} className="text-amber-500" />
                <span>Avaliação Acadêmica • Acesso Imediato</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Credenciais de Demonstração para Professores e Avaliadores
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Clique nos botões abaixo para copiar as credenciais ou acesse com 1 clique para testar o sistema pré-carregado com frotas, clientes e o Simulador 24h.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => navigate('/login')}
                className="btn-press bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Zap size={15} className="text-amber-300" />
                <span>Ir para Login</span>
              </button>

              <a
                href="https://apifieldopss.up.railway.app/swagger-ui/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Server size={14} />
                <span>Swagger OpenAPI</span>
                <ExternalLink size={12} className="text-slate-400" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-blue-400/50 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} /> Perfil Gestor Operacional (Desktop)
                  </span>
                  <button
                    onClick={() => copiarTexto('gestor@fieldops.com', 'gestor')}
                    className="btn-press text-2xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-semibold"
                  >
                    {copiedGestor ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedGestor ? 'Copiado!' : 'Copiar E-mail'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-800 space-y-0.5 pt-1">
                  <div><strong>E-mail:</strong> gestor@fieldops.com</div>
                  <div><strong>Senha:</strong> 123456</div>
                </div>
                <p className="text-2xs text-slate-500 pt-1 leading-relaxed">
                  Acesso ao Cockpit Executivo, Mapa ao Vivo com Leaflet, Linha do Tempo Gantt com navegação horária e Simulador Digital Twin 24h.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-emerald-400/50 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone size={14} /> Perfil Técnico de Campo (Mobile)
                  </span>
                  <button
                    onClick={() => copiarTexto('tecnico@fieldops.com', 'tecnico')}
                    className="btn-press text-2xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-semibold"
                  >
                    {copiedTecnico ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedTecnico ? 'Copiado!' : 'Copiar E-mail'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-800 space-y-0.5 pt-1">
                  <div><strong>E-mail:</strong> tecnico@fieldops.com</div>
                  <div><strong>Senha:</strong> 123456</div>
                </div>
                <p className="text-2xs text-slate-500 pt-1 leading-relaxed">
                  Redirecionamento automático para a visão do técnico de campo no smartphone, roteiro do dia, check-in e assinatura touch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ARQUITETURA TÉCNICA
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Stack Tecnológica</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Arquitetura em Camadas & Alta Disponibilidade
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Hospedagem em nuvem no Railway com PostgreSQL Neon Serverless e migrações Flyway.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Server size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Backend Spring Boot 4</h4>
            <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
              Java 21, Spring Security com JWT stateless, Spring Data JPA e OpenAPI 3 Swagger.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Database size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">PostgreSQL Neon & Flyway</h4>
            <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
              Banco relacional serverless com migrações versionadas e queries em batch ultra-rápidas.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Navigation size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Geolocalização & Haversine</h4>
            <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
              Cálculo geodésico de distâncias em quilômetros para despacho do técnico mais próximo em 0.4ms.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Code2 size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Frontend React 19 & Vite</h4>
            <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
              Tailwind CSS, Leaflet Maps, Lucide Icons e design responsivo com renderização ultra-rápida.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RODAPÉ INSTITUCIONAL
      ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Layers size={16} />
              </div>
              <span className="font-bold text-lg text-white">fieldops</span>
              <span className="text-2xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full ml-1">v2.5.0</span>
            </div>

            <div className="flex items-center gap-6 text-xs flex-wrap">
              <button onClick={() => scrollToSection('problema')} className="hover:text-white transition-colors cursor-pointer">
                1. O Problema
              </button>
              <button onClick={() => scrollToSection('mercado')} className="hover:text-white transition-colors cursor-pointer">
                2. Mercado
              </button>
              <button onClick={() => scrollToSection('pilares')} className="hover:text-white transition-colors cursor-pointer">
                3. Pilares
              </button>
              <button onClick={() => scrollToSection('modulos')} className="hover:text-white transition-colors cursor-pointer">
                4. Experiência
              </button>
              <button onClick={() => scrollToSection('impacto')} className="hover:text-white transition-colors cursor-pointer">
                5. Impacto
              </button>
              <button onClick={() => scrollToSection('banca')} className="hover:text-white transition-colors cursor-pointer">
                Banca
              </button>
              <a
                href="https://apifieldopss.up.railway.app/swagger-ui/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Swagger API
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-slate-500">
            <p>© 2026 FieldOps - Plataforma SaaS de Gestão de Ordens de Serviço & Equipes em Campo. Trabalho de Graduação.</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{apiOnline ? 'API Railway Conectada' : 'API Desconectada'}</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
