import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  PhoneCall
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [apiOnline, setApiOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('cockpit');
  const [copiedGestor, setCopiedGestor] = useState(false);
  const [copiedTecnico, setCopiedTecnico] = useState(false);

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
      titulo: 'Cockpit de Comando',
      icon: Activity,
      badge: 'Gestão Executiva',
      desc: 'Central unificada com KPIs de pontualidade em tempo real, monitoramento da frota de campo, alertas de ordens críticas e cálculo de SLA.',
      destaques: [
        'Indicadores de SLA, CSAT e Pontualidade em tempo real',
        'Detecção imediata de ordens com risco de atraso viário',
        'Visão instantânea do status de cada técnico em campo',
        'Atalhos operacionais com abertura rápida de novas O.S.'
      ],
      previewStats: [
        { label: 'Pontualidade BI', val: '98.4%', cor: 'text-blue-400' },
        { label: 'Satisfação CSAT', val: '4.9 ⭐', cor: 'text-amber-400' },
        { label: 'Técnicos em Campo', val: '5 ativos', cor: 'text-emerald-400' }
      ]
    },
    {
      id: 'mapa',
      titulo: 'Mapa ao Vivo & Rotas',
      icon: MapPin,
      badge: 'Geolocalização Leaflet',
      desc: 'Rastreamento geográfico em tempo real com mapas de rua e satélite, exibindo a sede central de despacho, colaboradores e rotas encadeadas em São Paulo.',
      destaques: [
        'Cálculo de rotas encadeadas para cada colaborador no dia',
        'Marcadores pulsantes de colaboradores e clientes com GPS',
        'Isolamento da rota individual com filtro por colaborador',
        'Alternância dinâmica entre camada de ruas e satélite'
      ],
      previewStats: [
        { label: 'Base de Despacho', val: 'Av. Paulista, SP', cor: 'text-purple-400' },
        { label: 'Raio Médio', val: '3.8 km', cor: 'text-blue-400' },
        { label: 'Rotas Traçadas', val: '100% ativas', cor: 'text-emerald-400' }
      ]
    },
    {
      id: 'gantt',
      titulo: 'Linha do Tempo Gantt',
      icon: Clock,
      badge: 'Despacho Visual',
      desc: 'Cronograma horizontal dinâmico por colaborador com auto-foco na hora atual (3h antes / 5h depois), navegação por setas e rebalanceamento inteligente.',
      destaques: [
        'Visualização temporal contínua da jornada de cada técnico',
        'Auto-scroll inteligente que foca no horário de trabalho atual',
        'Coluna de colaboradores fixada (sticky) durante a navegação',
        'Reatribuição e reagendamento inteligente com 1 clique'
      ],
      previewStats: [
        { label: 'Janela em Foco', val: '3h antes / 5h depois', cor: 'text-blue-400' },
        { label: 'Atrasos Viários', val: 'Auditados', cor: 'text-amber-400' },
        { label: 'Rebalanceamento', val: 'Proximidade', cor: 'text-emerald-400' }
      ]
    },
    {
      id: 'mobile',
      titulo: 'Modo Técnico Mobile',
      icon: Smartphone,
      badge: 'PWA de Campo',
      desc: 'Experiência focada para smartphones: roadmap encadeado das entregas do dia, check-in no cliente, laudo de conformidade e assinatura touch na tela.',
      destaques: [
        'Roteiro do dia ordenado com navegação integrada ao Waze/Maps',
        'Avanço de estados com 1 toque (Deslocamento ➔ Atendimento)',
        'Check-in e check-out automáticos com timestamp imutável',
        'Assinatura digital do cliente coletada diretamente na tela'
      ],
      previewStats: [
        { label: 'Interface', val: 'Mobile-first Touch', cor: 'text-indigo-400' },
        { label: 'Assinatura', val: 'Canvas Digital', cor: 'text-emerald-400' },
        { label: 'Laudo Técnico', val: 'Estruturado', cor: 'text-blue-400' }
      ]
    },
    {
      id: 'rastreio',
      titulo: 'Rastreio Público & CSAT',
      icon: Truck,
      badge: 'Experiência do Cliente',
      desc: 'Link público compartilhado com o cliente final (estilo Uber/iFood), permitindo acompanhar o deslocamento do técnico no radar e avaliar o serviço.',
      destaques: [
        'Acesso direto e seguro sem necessidade de login',
        'Radar dinâmico com estimativa de chegada em minutos',
        'Identificação do técnico com foto, contato e número da O.S.',
        'Pesquisa de satisfação CSAT de 1 a 5 estrelas com comentário'
      ],
      previewStats: [
        { label: 'Acesso', val: 'Público / Seguro', cor: 'text-emerald-400' },
        { label: 'Estilo', val: 'Uber / iFood', cor: 'text-purple-400' },
        { label: 'Feedback', val: '1 a 5 ⭐ CSAT', cor: 'text-amber-400' }
      ]
    },
    {
      id: 'simulador',
      titulo: 'Digital Twin Autônomo',
      icon: Bot,
      badge: 'Simulação 24/7',
      desc: 'Motor com agentes autônomos (Bot Despachante e Bots Técnicos) que simula uma operação real ininterrupta com auto-provisionamento em São Paulo.',
      destaques: [
        'Bot Despachante: cria O.S. e aloca por proximidade Haversine',
        'Bots Técnicos: aceitam chamados e injetam imprevistos viários',
        'Auto-provisionamento automático de 5 técnicos e 8 clientes em SP',
        'Terminal de telemetria com streaming de logs e reset ultra-rápido'
      ],
      previewStats: [
        { label: 'Execução', val: '24h Background', cor: 'text-emerald-400' },
        { label: 'Cadência', val: '1m a 1h ajustável', cor: 'text-blue-400' },
        { label: 'Imprevistos', val: '~20% tráfego SP', cor: 'text-amber-400' }
      ]
    }
  ];

  const moduloAtivo = modulos.find((m) => m.id === activeTab) || modulos[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* =========================================================================
          1. HERO EM TELA CHEIA (FULLSCREEN 100VH / 100VW - SEM CARD)
      ========================================================================= */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
        
        {/* Imagem de Fundo Cenográfica 3D em Tela Cheia (Operações em Campo) */}
        <img
          src="/hero-fieldops-city.jpg"
          alt="FieldOps - Operações de Campo Inteligentes na Cidade"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Gradiente Escuro Suave para Alto Contraste Tipográfico no Topo e na Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/35 to-slate-950/90 pointer-events-none" />

        {/* Top Navbar em Pílula Translúcida */}
        <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 flex items-center justify-between">
          {/* Logo FieldOps */}
          <Link to="/" className="flex items-center gap-2.5 text-white group drop-shadow-md">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white drop-shadow-sm">fieldops</span>
          </Link>

          {/* Menu Central em Pílula de Vidro Fosco (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 glass-pill px-6 py-2.5 rounded-full text-xs font-semibold text-white/95 shadow-lg border border-white/20">
            <button onClick={() => scrollToSection('gestao')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Gestão
            </button>
            <button onClick={() => scrollToSection('pilares')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Diferenciais
            </button>
            <button onClick={() => scrollToSection('modulos')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Funcionalidades
            </button>
            <button onClick={() => scrollToSection('banca')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Acesso Rápido
            </button>
            <button onClick={() => scrollToSection('arquitetura')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Arquitetura
            </button>
          </nav>

          {/* Botão de Ação Direita */}
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

        {/* Conteúdo Central do Hero (Tipografia Editorial Ondro + Estilo RepareCar) */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pt-8 sm:pt-14 pb-8 space-y-5 sm:space-y-6">
          {/* Micro-badge de Introdução */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-medium shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Roteirização & Despacho de Campo em Tempo Real</span>
          </div>

          {/* Headline Principal Editorial */}
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.06] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            Dê à sua <span className="italic font-normal text-amber-300 drop-shadow-sm">operação de campo</span><br />
            um destino certo.
          </h1>

          {/* Subtítulo Assertivo */}
          <p className="text-white/90 text-sm sm:text-base md:text-lg font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Orquestre rotas, técnicos e ordens de serviço em tempo real. Veja onde cada colaborador está, elimine atrasos viários e colete aprovações na hora direto pelo smartphone.
          </p>

          {/* CTAs Duplos */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/login')}
              className="btn-press bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-7 py-3.5 rounded-full flex items-center gap-2.5 text-sm sm:text-base shadow-2xl shadow-amber-500/40 cursor-pointer"
            >
              <span>Experimentar agora</span>
              <span className="w-6 h-6 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center text-xs font-black">
                ✦
              </span>
            </button>

            <button
              onClick={() => scrollToSection('gestao')}
              className="btn-press glass-pill hover:bg-white/25 text-white font-semibold px-6 py-3.5 rounded-full text-sm sm:text-base shadow-lg cursor-pointer transition-colors flex items-center gap-2 border border-white/20"
            >
              <span>Ver Funcionalidades</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Subline de Garantia / Sem Instalação (Estilo RepareCar) */}
          <div className="pt-1 text-xs text-white/80 font-medium tracking-wide flex items-center justify-center gap-1.5 drop-shadow-sm">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Sem necessidade de instalação • Acesso imediato no navegador e PWA mobile</span>
          </div>
        </div>

        {/* Rodapé da Dobra 1: Indicador de Scroll e Telemetria */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex items-end justify-between">
          {/* Status da API em Pill Glassmorphic */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md">
            <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{apiOnline ? 'API Online no Railway' : 'API Conectando...'}</span>
          </div>

          {/* Indicador Animado Convidando ao Scroll Down */}
          <button
            onClick={() => scrollToSection('gestao')}
            className="flex flex-col items-center gap-1 text-white/85 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold tracking-wider uppercase drop-shadow-sm">Role para explorar</span>
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center group-hover:bg-white/25 group-hover:translate-y-0.5 transition-all">
              <ChevronDown size={16} className="animate-bounce" />
            </div>
          </button>

          {/* Telemetria de Frota */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-medium shadow-md">
            <Truck size={14} className="text-amber-300" />
            <span>São Paulo, SP • Frota & Despacho Ativos</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SEÇÃO PÓS-HERO 1: GESTÃO INTELIGENTE & PROPOSTA DE VALOR (ESTILO REPARECAR)
      ========================================================================= */}
      <section id="gestao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Lado Esquerdo: Headline & Propósito */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <Activity size={13} className="text-blue-600" />
              <span>Gestão Inteligente</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Mais que despacho: é sua operação de campo orquestrada em tempo real
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              O <strong>FieldOps</strong> foi desenvolvido para solucionar a rotina imprevisível das equipes externas de rua: trânsito denso, clientes aguardando e ordens de serviço que se perdem em conversas soltas.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Você recebe as ferramentas completas para organizar rotas, cumprir prazos de SLA e tomar decisões com base em dados de telemetria reais, tudo na palma da sua mão.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/login')}
                className="btn-press bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer inline-flex items-center gap-2"
              >
                <span>Acessar o Painel Operacional</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Lado Direito: Lista de Benefícios com Checkmarks (Estilo RepareCar Section-3) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>O que muda no seu dia a dia</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% integrado
              </span>
            </h3>

            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Visão clara da pontualidade, rotas e SLA da equipe</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Painel executivo com métricas em tempo real sobre quem está pontual, ordens atrasadas e índice de satisfação do cliente.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Linha do Tempo Gantt com foco na hora atual</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Cronograma horizontal contínuo com coluna de técnicos fixa e centralização automática em 3 horas antes e 5 horas depois da hora presente.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Alocação inteligente por Haversine (menos km rodados)</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                    O sistema calcula a distância geodésica exata do técnico mais próximo ao endereço do cliente, minimizando custos de combustível e tráfego.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Rastreio público e pesquisa CSAT para o cliente final</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                    O cliente acompanha o deslocamento do técnico no radar sem login e avalia o atendimento com notas de 1 a 5 estrelas.
                  </p>
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Não precisa instalar nada: use direto no navegador</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Compatível com qualquer desktop, tablet ou smartphone Android/iOS com modo PWA e assinatura digital na tela.
                  </p>
                </div>
              </div>
            </div>

            {/* Micro Box Informativo Inferior */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
              <Sparkles size={16} className="text-amber-500 shrink-0" />
              <span>Sem complicações de infraestrutura: toda a solução está hospedada na nuvem Railway e Neon Postgres.</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. SEÇÃO PÓS-HERO 2: PILARES DA EFICIÊNCIA OPERACIONAL (ESTILO REPARECAR SECTION-4)
      ========================================================================= */}
      <section id="pilares" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10 sm:mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Fundamentos de Gestão</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Como o FieldOps transforma sua rotina de campo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Desenvolvido para eliminar gargalos e garantir previsibilidade em operações com múltiplos técnicos e clientes diários.
          </p>
        </div>

        {/* Grid de 3 Cards de Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Processo Visual */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <Clock size={24} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Processo Visual</span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Mostra o que precisa da sua atenção
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Linha do tempo contínua e Kanban de triagem arrastável. O despachante enxerga imediatamente sobreposições, tempo ocioso e ordens sem técnico atribuído.
              </p>
            </div>
          </div>

          {/* Card 2: Alertas Inteligentes */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Alertas Inteligentes</span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Avisam antes que o atraso vire problema
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Monitoramento contínuo com detecção de ordens críticas e imprevistos no trânsito. O sistema sugere rebalanceamento automático antes do SLA estourar.
              </p>
            </div>
          </div>

          {/* Card 3: Organização Pensada */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
              <Compass size={24} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Organização Pensada</span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Cada técnico na rota certa, sem confusão
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Roteiros diários encadeados no mapa e no celular do técnico. Elimina viagens desnecessárias de ponta a ponta na cidade e garante ordem cronológica clara.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. SEÇÃO PÓS-HERO 3: VITRINE INTERATIVA DOS 6 MÓDULOS OPERACIONAIS
      ========================================================================= */}
      <section id="modulos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Ecossistema FieldOps</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Uma Plataforma, Todos os Ângulos da Operação
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Do planejamento na base à execução em campo, o FieldOps integra despachantes, técnicos e o cliente final em uma única experiência fluida.
          </p>
        </div>

        {/* Segmented Control Unificado */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl inline-flex gap-1 shadow-inner">
            {modulos.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === activeTab;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`btn-press inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                  <span>{m.titulo}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Detalhado do Módulo Ativo */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Esquerda: Explicação */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span>{moduloAtivo.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {moduloAtivo.titulo}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {moduloAtivo.desc}
              </p>

              {/* Destaques em Bullets */}
              <div className="space-y-2 pt-2">
                {moduloAtivo.destaques.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-press bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Experimentar Módulo</span>
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => scrollToSection('banca')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer underline"
                >
                  Ver credenciais de teste
                </button>
              </div>
            </div>

            {/* Direita: Preview Visual Mockup */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-2xs font-mono text-slate-400 ml-2">fieldops.app/{moduloAtivo.id}</span>
                </div>
                <span className="text-2xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                {moduloAtivo.previewStats.map((st, i) => (
                  <div key={i} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                    <span className="text-2xs text-slate-400 block truncate">{st.label}</span>
                    <span className={`text-xs sm:text-sm font-extrabold ${st.cor} block mt-0.5`}>
                      {st.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40 text-2xs space-y-1.5 font-mono text-slate-300">
                <div className="text-slate-400 font-semibold mb-1 flex items-center justify-between">
                  <span>TELEMETRIA DE CAMPO</span>
                  <span className="text-emerald-400">● ATIVO</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Despacho:</span>
                  <span className="text-white">Av. Paulista, 1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Técnicos Online:</span>
                  <span className="text-emerald-300">5 operadores</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de SLA:</span>
                  <span className="text-blue-300">98.4% no prazo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SEÇÃO PÓS-HERO 4: ACESSO RÁPIDO PARA A BANCA AVALIADORA
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
                Copie as credenciais abaixo ou entre com 1 clique para testar o sistema já pré-povoado com rotas, colaboradores e o simulador autônomo.
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

          {/* Cards de Login Rápido (Gestor vs Técnico) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            {/* Card Gestor */}
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

            {/* Card Técnico */}
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
          6. SEÇÃO PÓS-HERO 5: ARQUITETURA TÉCNICA & ENGENHARIA DE SOFTWARE
      ========================================================================= */}
      <section id="arquitetura" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Engenharia de Software</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Arquitetura Moderna & Escalável
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Stack tecnológica robusta com separação estrita de camadas e microsserviço de simulação em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Server size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Backend Spring Boot 4</h4>
            <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
              Java 21, Spring Security com JWT stateless, Spring Data JPA e documentação interativa OpenAPI 3.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Database size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">PostgreSQL Neon & Flyway</h4>
            <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
              Banco relacional serverless com migrações automáticas versionadas e queries em batch ultra-rápidas.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Navigation size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Geolocalização & Haversine</h4>
            <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
              Cálculo geodésico de distâncias em quilômetros para despacho do técnico mais próximo em milissegundos.
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
          7. RODAPÉ INSTITUCIONAL
      ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Layers size={16} />
              </div>
              <span className="font-bold text-lg text-white">fieldops</span>
              <span className="text-2xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full ml-1">v2.4.0</span>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <button onClick={() => scrollToSection('gestao')} className="hover:text-white transition-colors cursor-pointer">
                Gestão
              </button>
              <button onClick={() => scrollToSection('pilares')} className="hover:text-white transition-colors cursor-pointer">
                Diferenciais
              </button>
              <button onClick={() => scrollToSection('modulos')} className="hover:text-white transition-colors cursor-pointer">
                Módulos
              </button>
              <button onClick={() => scrollToSection('banca')} className="hover:text-white transition-colors cursor-pointer">
                Acesso Rápido
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
            <p>© 2026 FieldOps - Plataforma de Gestão de Ordens de Serviço & Equipes em Campo. Trabalho de Graduação.</p>
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
