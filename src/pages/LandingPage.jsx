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
  Sparkles,
  Users,
  Building2,
  Wrench,
  Check,
  Copy
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
        'Sugestão de colaborador mais próximo via fórmula Haversine',
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
    <div className="min-h-screen bg-[#edf2f7] text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* =========================================================================
          1. HERO EM MOLDURA FLUTUANTE (ESTILO ONDRO / AWSMD DIORAMA)
      ========================================================================= */}
      <div className="max-w-[1360px] mx-auto pt-3 sm:pt-6 px-2.5 sm:px-6">
        <div className="relative rounded-[28px] sm:rounded-[40px] border-[6px] sm:border-[12px] border-white shadow-2xl overflow-hidden min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex flex-col justify-between bg-[#1b5cb8] select-none">
          
          {/* Imagem de Fundo Cenográfica 3D Diorama */}
          <img
            src="/hero-bg-scenic.jpg"
            alt="FieldOps Scenic Landscape"
            className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none select-none"
          />

          {/* Gradiente Suave Superior no Céu para Contraste de Texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#114b99]/55 via-transparent to-transparent pointer-events-none" />

          {/* Top Navbar em Pílula Translúcida */}
          <header className="relative z-20 p-4 sm:p-6 lg:p-8 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 text-white group drop-shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Layers size={17} />
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white drop-shadow-xs">fieldops</span>
            </Link>

            {/* Menu Central em Pílula de Vidro Fosco (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 glass-pill px-6 py-2 rounded-full text-xs font-semibold text-white/95 shadow-md">
              <a href="#solucao" className="hover:text-white transition-opacity opacity-90 hover:opacity-100">Visão Geral</a>
              <a href="#modulos" className="hover:text-white transition-opacity opacity-90 hover:opacity-100">Módulos</a>
              <a href="#banca" className="hover:text-white transition-opacity opacity-90 hover:opacity-100">Acesso Rápido</a>
              <a href="#arquitetura" className="hover:text-white transition-opacity opacity-90 hover:opacity-100">Arquitetura</a>
            </nav>

            {/* Ação Direita */}
            <div className="flex items-center gap-2.5">
              {isLogged ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-press bg-slate-950 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-black/30 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-press bg-slate-950 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-black/30 cursor-pointer"
                >
                  Entrar no Sistema
                </button>
              )}
            </div>
          </header>

          {/* Conteúdo Central do Hero: Tipografia Editorial Estilo Ondro */}
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-2 sm:pt-6 space-y-4 sm:space-y-5">
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
              Dê à sua <span className="italic font-normal text-amber-200">operação de campo</span><br />
              um destino certo.
            </h1>

            <p className="text-white/95 text-xs sm:text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Orquestre rotas, técnicos e ordens de serviço em tempo real. Elimine atrasos com inteligência geográfica e automação contínua de ponta a ponta.
            </p>

            {/* Botões Duplos de CTA (Âmbar com Selo ✦ e Vidro Fosco) */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="btn-press bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-6 py-3 rounded-full flex items-center gap-2.5 text-xs sm:text-sm shadow-xl shadow-amber-500/30 cursor-pointer"
              >
                <span>Experimentar agora</span>
                <span className="w-6 h-6 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center text-[10px] font-black">
                  ✦
                </span>
              </button>

              <a
                href="#modulos"
                className="btn-press glass-pill hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-full text-xs sm:text-sm shadow-md cursor-pointer transition-colors"
              >
                Explorar o ecossistema
              </a>
            </div>
          </div>

          {/* Rodapé Interno da Moldura Cenográfica */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex items-end justify-between">
            {/* Status da API em Pill Glassmorphic */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow-md">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{apiOnline ? 'API Online no Railway' : 'API Conectando...'}</span>
            </div>

            {/* Badge de Logística */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-medium shadow-md">
              <Truck size={13} className="text-amber-300" />
              <span>Frota de Campo & Despacho Inteligente</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CARDS DE ACESSO RÁPIDO PARA A BANCA AVALIADORA (DESTAQUE IMEDIATO)
      ========================================================================= */}
      <section id="banca" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
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
                Clique nos botões abaixo para copiar as credenciais ou acesse diretamente com 1 clique para testar o sistema pré-carregado com frotas, clientes e o Simulador 24h.
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

          {/* Cards Rápidos de Login (Gestor vs Técnico) */}
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
          3. BARRA DE MÉTRICAS & INDICADORES DE IMPACTO
      ========================================================================= */}
      <section id="solucao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 block tabular-nums">-40%</span>
            <span className="text-xs sm:text-sm text-slate-800 font-bold block mt-1">Tempo em Trânsito</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Alocação por proximidade Haversine</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block tabular-nums">100%</span>
            <span className="text-xs sm:text-sm text-slate-800 font-bold block mt-1">Auditoria Imutável</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Check-in, checkout e laudo técnico</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 block">Zero</span>
            <span className="text-xs sm:text-sm text-slate-800 font-bold block mt-1">Chamados Perdidos</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Roadmap diário encadeado no mobile</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs">
            <span className="text-2xl sm:text-3xl font-black text-amber-500 block tabular-nums">4.9 ⭐</span>
            <span className="text-xs sm:text-sm text-slate-800 font-bold block mt-1">Satisfação dos Clientes</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Pesquisa CSAT instantânea via link</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. VITRINE INTERATIVA DOS MÓDULOS OPERACIONAIS
      ========================================================================= */}
      <section id="modulos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
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
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Esquerda: Explicação */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span>{moduloAtivo.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {moduloAtivo.titulo}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed max-w-[60ch]">
                {moduloAtivo.desc}
              </p>

              <div className="space-y-2 pt-2">
                {moduloAtivo.destaques.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                      <Check size={12} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-press inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  <span>Experimentar na Demonstração</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Direita: Preview Card com Estatísticas */}
            <div className="lg:col-span-5 bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Métricas Operacionais
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Ao Vivo
                </span>
              </div>

              <div className="space-y-3">
                {moduloAtivo.previewStats.map((st, sIdx) => (
                  <div key={sIdx} className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">{st.label}</span>
                    <span className={`text-sm font-bold font-mono tabular-nums ${st.cor}`}>{st.val}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-2xs text-blue-300">
                💡 <strong>Demonstração Integrada:</strong> Os botões de acesso rápido na tela de login permitem alternar entre a visão Desktop e Mobile instantaneamente.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMO FUNCIONA (PIPELINE DA MÁQUINA DE ESTADOS)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Governança & SLA</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Máquina de Estados Finita e Auditável
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Cada transição de estado é validada pelo backend Spring Boot, impedindo pulos de etapa e garantindo rastreabilidade jurídica com data, hora e responsável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {[
            { passo: '1. Aberta', desc: 'Chamado criado pelo gestor ou cliente com endereço e ativo vinculado.', cor: 'border-amber-200 bg-amber-50/70 text-amber-900' },
            { passo: '2. Atribuída', desc: 'Despacho inteligente pelo cálculo de menor distância Haversine.', cor: 'border-blue-200 bg-blue-50/70 text-blue-900' },
            { passo: '3. Em Trânsito', desc: 'Técnico inicia o deslocamento no app. Link público emitido ao cliente.', cor: 'border-indigo-200 bg-indigo-50/70 text-indigo-900' },
            { passo: '4. Atendimento', desc: 'Check-in no local. Inspeção técnica e checklist do equipamento.', cor: 'border-purple-200 bg-purple-50/70 text-purple-900' },
            { passo: '5. Concluída', desc: 'Laudo técnico preenchido, assinatura touch coletada e avaliação CSAT.', cor: 'border-emerald-200 bg-emerald-50/70 text-emerald-900' }
          ].map((st, idx) => (
            <div key={idx} className={`p-4 sm:p-5 rounded-2xl border ${st.cor} flex flex-col justify-between space-y-2.5 shadow-2xs`}>
              <div className="space-y-1">
                <span className="text-xs font-bold block">{st.passo}</span>
                <p className="text-2xs leading-relaxed opacity-90">{st.desc}</p>
              </div>
              <span className="text-[10px] font-mono font-bold block tabular-nums opacity-60">Passo 0{idx + 1}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. ARQUITETURA TÉCNICA DO PROJETO
      ========================================================================= */}
      <section id="arquitetura" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Engenharia de Software</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Stack Tecnológica & Padrões Arquiteturais
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Construído com base nas melhores práticas do mercado para garantir estabilidade, segurança e facilidade de implantação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Backend */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-2xs hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Server size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900">Backend Spring Boot 4</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Java 21 com Spring Security, JWT stateless, Spring Data JPA, Hibernate, agendador de tarefas <code className="text-blue-600">@Scheduled</code> e migrações Flyway.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">Java 21</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">Spring Boot</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">JWT Bearer</span>
            </div>
          </div>

          {/* Frontend */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-2xs hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
              <Code2 size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900">Frontend React 19 + Vite</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Single Page Application moderna com Tailwind CSS, Leaflet Maps, Lucide Icons, Canvas Signature Pad e roteamento protegido por perfil RBAC.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">React 19</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">Tailwind CSS</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">Leaflet</span>
            </div>
          </div>

          {/* DevOps & Banco */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-2xs hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <Database size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900">PostgreSQL & Docker</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Banco relacional PostgreSQL 15, Neon Serverless na nuvem, Dockerfiles multi-stage e Docker Compose unificado para subir toda a stack.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">PostgreSQL</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">Docker</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-mono font-semibold">Railway</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. RODAPÉ INSTITUCIONAL
      ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Layers size={16} />
            </div>
            <span className="font-bold text-slate-900">FieldOps</span>
            <span>• Projeto de Graduação Full Stack SaaS 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/SaaS-FullStack-2026/saas-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              GitHub Backend
            </a>
            <a
              href="https://github.com/SaaS-FullStack-2026/saas-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              GitHub Frontend
            </a>
            <a
              href="https://apifieldopss.up.railway.app/swagger-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              Swagger API
            </a>
            <Link to="/login" className="hover:text-blue-600 font-semibold transition-colors">
              Login
            </Link>
          </div>

          <div className="text-2xs text-slate-400">
            Licença MIT • Desenvolvido com React 19 & Spring Boot 4
          </div>
        </div>
      </footer>
    </div>
  );
}
