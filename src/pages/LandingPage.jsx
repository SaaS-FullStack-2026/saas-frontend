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
  Lock,
  ChevronRight,
  Sparkles,
  Users,
  Building2,
  Wrench,
  PenTool,
  Check
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
        'Visão em tempo real do status de cada técnico em campo',
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
      desc: 'Cronograma horizontal dinâmico das 07:00 às 20:00 por colaborador, com alertas visuais de trânsito e rebalanceamento inteligente por proximidade.',
      destaques: [
        'Visualização temporal contínua da jornada de cada técnico',
        'Identificação em vermelho de atrasos e sobreposições',
        'Sugestão de colaborador mais próximo via fórmula Haversine',
        'Reatribuição e reagendamento inteligente com 1 clique'
      ],
      previewStats: [
        { label: 'Janela Operacional', val: '07h - 20h', cor: 'text-blue-400' },
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
        'Terminal de telemetria com streaming de logs a cada 3,5s'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. NAVBAR FIXA */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers size={20} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block">FieldOps</span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider block -mt-1 uppercase">SaaS Gestão em Campo</span>
            </div>
          </Link>

          {/* Links Centrais (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#solucao" className="hover:text-blue-400 transition-colors">A Solução</a>
            <a href="#modulos" className="hover:text-blue-400 transition-colors">Módulos</a>
            <a href="#como-funciona" className="hover:text-blue-400 transition-colors">Como Funciona</a>
            <a href="#arquitetura" className="hover:text-blue-400 transition-colors">Arquitetura</a>
            <a href="#banca" className="hover:text-blue-400 transition-colors">Banca Avaliadora</a>
          </nav>

          {/* Ações Direitas */}
          <div className="flex items-center gap-3">
            {/* Status da API */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className={apiOnline ? 'text-emerald-400' : 'text-slate-400'}>
                {apiOnline ? 'API Online' : 'API Conectando...'}
              </span>
            </div>

            {/* Link GitHub */}
            <a
              href="https://github.com/SaaS-FullStack-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors hidden sm:block"
              title="Ver código no GitHub"
            >
              <Code2 size={16} />
            </a>

            {/* Botão de Entrada */}
            {isLogged ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Acessar Dashboard</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Entrar no Sistema</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-purple-600/10 blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag Acadêmica */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 shadow-inner">
              <Sparkles size={14} className="text-amber-400" />
              <span>Projeto de Conclusão de Curso 2026 • Full Stack SaaS</span>
            </div>

            {/* Headline Principal */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              A Revolução na Gestão e Despacho de{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Serviços em Campo
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Elimine o caos de planilhas e mensagens de WhatsApp. Conecte despachantes a colaboradores em trânsito com cálculo de rotas Haversine, telemetria em tempo real, assinatura digital na tela e simulação 24h.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-xl shadow-blue-600/25 transition-all text-sm cursor-pointer group"
              >
                <Zap size={18} className="text-amber-300 group-hover:scale-110 transition-transform" />
                <span>Testar Demonstração ao Vivo</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="https://apifieldopss.up.railway.app/swagger-ui/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold px-5 py-3.5 rounded-xl border border-slate-800 transition-colors text-sm shadow-sm"
              >
                <Server size={17} className="text-emerald-400" />
                <span>Documentação Swagger (API)</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>

              <a
                href="#banca"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 font-semibold px-4 py-3.5 rounded-xl border border-slate-800/60 transition-colors text-sm"
              >
                <span>Guia da Banca</span>
              </a>
            </div>

            {/* Micro Provas / Destaques */}
            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" /> Multi-Tenant por Empresa
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" /> Máquina de Estados Estrita
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" /> 100% Dockerizado
              </span>
            </div>
          </div>

          {/* PREVIEW DO COCKPIT EM MOCKUP */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 p-2 sm:p-3 border border-slate-800 shadow-2xl shadow-blue-950/40 relative">
            {/* Header da Janela */}
            <div className="h-8 bg-slate-900/90 rounded-t-xl px-4 flex items-center justify-between border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">fieldops.up.railway.app/dashboard</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Telemetria Ativa
              </span>
            </div>

            {/* Cockpit Preview Grid */}
            <div className="p-4 sm:p-6 bg-slate-950/90 rounded-b-xl space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pontualidade (BI)</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-400 block mt-0.5">98.4%</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp size={11} /> +4.2% vs mês anterior
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Satisfação CSAT</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block mt-0.5">4.9 ⭐</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Avaliações dos clientes</span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Em Campo Agora</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5">5 Técnicos</span>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5">São Paulo (SP)</span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Digital Twin 24h</span>
                  <span className="text-xl sm:text-2xl font-black text-purple-400 block mt-0.5">Ativo</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Ciclos automáticos</span>
                </div>
              </div>

              {/* Linha Simulada de Chamados em Campo */}
              <div className="p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                    <Truck size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">O.S. #7 • Torre Faria Lima Plaza</span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold uppercase">
                        Em Trânsito
                      </span>
                    </div>
                    <p className="text-2xs text-slate-400 mt-0.5">
                      Técnico: Felipe Rocha • Distância calculada: 1.5 km • Tempo est.: 10 min
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer self-end sm:self-auto"
                >
                  Ver no Mapa ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BARRA DE MÉTRICAS & VALOR DE MERCADO */}
      <section id="solucao" className="border-y border-slate-800/80 bg-slate-900/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-2xl sm:text-4xl font-extrabold text-blue-400 block">-40%</span>
              <span className="text-xs sm:text-sm text-slate-300 font-semibold block mt-1">Tempo em Trânsito</span>
              <span className="text-2xs text-slate-500 block mt-0.5">Despacho por proximidade Haversine</span>
            </div>
            <div>
              <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400 block">100%</span>
              <span className="text-xs sm:text-sm text-slate-300 font-semibold block mt-1">Auditoria Imutável</span>
              <span className="text-2xs text-slate-500 block mt-0.5">Check-in, check-out e laudo digital</span>
            </div>
            <div>
              <span className="text-2xl sm:text-4xl font-extrabold text-purple-400 block">Zero</span>
              <span className="text-xs sm:text-sm text-slate-300 font-semibold block mt-1">Chamados Perdidos</span>
              <span className="text-2xs text-slate-500 block mt-0.5">Roteiro encadeado do dia no mobile</span>
            </div>
            <div>
              <span className="text-2xl sm:text-4xl font-extrabold text-amber-400 block">4.9/5.0</span>
              <span className="text-xs sm:text-sm text-slate-300 font-semibold block mt-1">Satisfação dos Clientes</span>
              <span className="text-2xs text-slate-500 block mt-0.5">Pesquisa CSAT instantânea via link</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOWCASE DE MÓDULOS (ABAS INTERATIVAS) */}
      <section id="modulos" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Ecossistema Completo</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Uma Plataforma, Todos os Ângulos da Operação
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Do planejamento na base à execução na ponta, o FieldOps integra despachantes, técnicos e o cliente final em uma única experiência fluida.
            </p>
          </div>

          {/* Abas dos Módulos */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {modulos.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === activeTab;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  <span>{m.titulo}</span>
                </button>
              );
            })}
          </div>

          {/* Card Detalhado do Módulo Ativo */}
          <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Esquerda: Explicação */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <span>{moduloAtivo.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {moduloAtivo.titulo}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {moduloAtivo.desc}
                </p>

                <div className="space-y-2.5 pt-2">
                  {moduloAtivo.destaques.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                        <Check size={13} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Experimentar na Demonstração</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Direita: Preview Card com Estatísticas */}
              <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Métricas Operacionais
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Ao Vivo
                  </span>
                </div>

                <div className="space-y-3.5">
                  {moduloAtivo.previewStats.map((st, sIdx) => (
                    <div key={sIdx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">{st.label}</span>
                      <span className={`text-sm font-bold font-mono ${st.cor}`}>{st.val}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl text-2xs text-blue-300/80">
                  💡 <strong>Dica para a Banca:</strong> O sistema possui botões de acesso rápido na tela de login para alternar entre a visão Desktop e Mobile instantaneamente.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA (PIPELINE DA MÁQUINA DE ESTADOS) */}
      <section id="como-funciona" className="border-t border-slate-800/80 bg-slate-900/30 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Governança & SLA</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Máquina de Estados Finita e Auditável
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Cada transição de estado é validada estritamente pelo backend Spring Boot, impedindo pulos de etapa e garantindo rastreabilidade jurídica com data, hora e responsável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { passo: '1. Aberta', desc: 'Chamado criado pelo gestor ou cliente com endereço e ativo vinculado.', cor: 'border-amber-500/40 bg-amber-500/5' },
              { passo: '2. Atribuída', desc: 'Despacho inteligente pelo cálculo de menor distância Haversine.', cor: 'border-blue-500/40 bg-blue-500/5' },
              { passo: '3. Em Trânsito', desc: 'Técnico inicia o deslocamento no app. Link público emitido ao cliente.', cor: 'border-indigo-500/40 bg-indigo-500/5' },
              { passo: '4. Atendimento', desc: 'Check-in no local. Inspeção técnica e checklist do equipamento.', cor: 'border-purple-500/40 bg-purple-500/5' },
              { passo: '5. Concluída', desc: 'Laudo técnico preenchido, assinatura touch coletada e avaliação CSAT.', cor: 'border-emerald-500/40 bg-emerald-500/5' }
            ].map((st, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border ${st.cor} flex flex-col justify-between space-y-3`}>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-white block">{st.passo}</span>
                  <p className="text-2xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-semibold block">Passo 0{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ARQUITETURA DE SOFTWARE & ENGENHARIA */}
      <section id="arquitetura" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Engenharia de Software</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Stack Tecnológica & Padrões Arquiteturais
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Construído com base nas melhores práticas do mercado para garantir estabilidade, segurança e facilidade de implantação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Backend */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
                <Server size={22} />
              </div>
              <h4 className="text-base font-bold text-white">Backend Spring Boot 4</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Java 21 com Spring Security, JWT stateless, Spring Data JPA, Hibernate, agendador de tarefas <code className="text-blue-300">@Scheduled</code> e migrações Flyway.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">Java 21</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">Spring Boot</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">JWT Bearer</span>
              </div>
            </div>

            {/* Frontend */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
                <Code2 size={22} />
              </div>
              <h4 className="text-base font-bold text-white">Frontend React 19 + Vite</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single Page Application moderna com Tailwind CSS, Leaflet Maps, Lucide Icons, Canvas Signature Pad e roteamento protegido por perfil RBAC.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">React 19</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">Tailwind CSS</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">Leaflet</span>
              </div>
            </div>

            {/* DevOps & Banco */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                <Database size={22} />
              </div>
              <h4 className="text-base font-bold text-white">PostgreSQL & Docker</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Banco relacional PostgreSQL 15, Neon Serverless na nuvem, Dockerfiles multi-stage e Docker Compose unificado para subir toda a stack com 1 comando.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">PostgreSQL</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">Docker Compose</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-2xs font-mono">Railway</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GUIA DA BANCA AVALIADORA (CREDENCIAIS & ACESSO RÁPIDO) */}
      <section id="banca" className="border-t border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Star size={14} />
                  <span>Área de Avaliação Acadêmica (TCC 2026)</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Acesso Imediato para a Banca
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Utilize as credenciais de teste abaixo para validar todos os módulos. O banco já possui dados pré-carregados e o Modo Simulação pronto para disparo.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Zap size={16} />
                  <span>Ir para Tela de Login</span>
                </button>

                <a
                  href="https://apifieldopss.up.railway.app/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors border border-slate-700"
                >
                  <Server size={15} />
                  <span>Abrir Swagger UI</span>
                </a>
              </div>
            </div>

            {/* Caixa de Credenciais Prontas */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gestor */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Acesso Gestor (Admin)</span>
                  <button
                    onClick={() => copiarTexto('gestor@fieldops.com', 'gestor')}
                    className="text-2xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedGestor ? <Check size={12} className="text-emerald-400" /> : null}
                    <span>{copiedGestor ? 'Copiado!' : 'Copiar E-mail'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 space-y-1">
                  <div><strong>E-mail:</strong> gestor@fieldops.com</div>
                  <div><strong>Senha:</strong> 123456</div>
                </div>
                <p className="text-2xs text-slate-500">
                  Acesso ao Cockpit Desktop, Mapa em Tempo Real, Gantt, Cadastros e Modo Simulação.
                </p>
              </div>

              {/* Técnico */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Acesso Técnico (Mobile)</span>
                  <button
                    onClick={() => copiarTexto('tecnico@fieldops.com', 'tecnico')}
                    className="text-2xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTecnico ? <Check size={12} className="text-emerald-400" /> : null}
                    <span>{copiedTecnico ? 'Copiado!' : 'Copiar E-mail'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 space-y-1">
                  <div><strong>E-mail:</strong> tecnico@fieldops.com</div>
                  <div><strong>Senha:</strong> 123456</div>
                </div>
                <p className="text-2xs text-slate-500">
                  Redirecionamento direto para a visão de campo mobile, roadmap do dia e assinatura touch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Layers size={16} />
            </div>
            <span className="font-bold text-slate-300">FieldOps</span>
            <span>• Projeto de Conclusão de Curso 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/SaaS-FullStack-2026/saas-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub Backend
            </a>
            <a
              href="https://github.com/SaaS-FullStack-2026/saas-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub Frontend
            </a>
            <a
              href="https://apifieldopss.up.railway.app/swagger-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Swagger API
            </a>
            <Link to="/login" className="hover:text-blue-400 transition-colors">
              Login
            </Link>
          </div>

          <div className="text-2xs text-slate-600">
            Licença MIT • Desenvolvido com React 19 & Spring Boot 4
          </div>
        </div>
      </footer>
    </div>
  );
}
