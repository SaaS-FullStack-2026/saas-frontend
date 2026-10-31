import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Wrench, 
  Truck, 
  ShieldCheck, 
  RotateCw, 
  AlertCircle, 
  Layers,
  FileText,
  PenTool,
  Calendar
} from 'lucide-react';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';

// Base URL dinâmica para requisição pública direta
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apifieldopss.up.railway.app';

const ETAPAS = [
  { id: 'ABERTA', label: 'Chamado Aberto', desc: 'Aguardando atribuição de técnico' },
  { id: 'ATRIBUIDA', label: 'Técnico Agendado', desc: 'Profissional escalado para o atendimento' },
  { id: 'EM_DESLOCAMENTO', label: 'Técnico a Caminho', desc: 'Em deslocamento até o seu endereço' },
  { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', desc: 'Executando o serviço no local' },
  { id: 'CONCLUIDA', label: 'Concluído', desc: 'Atendimento finalizado com sucesso' }
];

export default function RastreioPublicoPage() {
  const { codigo } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarRastreio = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await axios.get(`${API_BASE_URL}/api/ordens-servico/rastreio/${codigo}`, {
        timeout: 8000
      });
      setDados(res.data);
    } catch (err) {
      console.error('Erro ao buscar rastreio:', err);
      setErro('Não foi possível localizar este chamado. Verifique o link enviado ou tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (codigo) {
      carregarRastreio();
    }
  }, [codigo]);

  const getEtapaIndex = (status) => {
    const idx = ETAPAS.findIndex((e) => e.id === status);
    return idx >= 0 ? idx : 0;
  };

  const etapaAtualIndex = dados ? getEtapaIndex(dados.status) : 0;
  const catInfo = dados ? getCategoriaInfo(dados.equipamentoCategoria) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Topo / Marca */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Layers size={20} />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight block">FieldOps Rastreio</span>
            <span className="text-[11px] text-slate-400 block -mt-1">Acompanhamento do Chamado em Campo</span>
          </div>
        </div>

        <button
          onClick={carregarRastreio}
          disabled={carregando}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          <RotateCw size={13} className={carregando ? 'animate-spin text-blue-400' : ''} />
          <span>{carregando ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-xl w-full mx-auto my-6 flex-1">
        {carregando && !dados ? (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 bg-slate-700 rounded-full mx-auto" />
            <div className="h-4 bg-slate-700 rounded w-48 mx-auto" />
            <div className="h-3 bg-slate-700 rounded w-64 mx-auto" />
          </div>
        ) : erro ? (
          <div className="bg-slate-800/90 border border-rose-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="inline-flex p-3 bg-rose-500/20 text-rose-400 rounded-full">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Chamado Não Localizado</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">{erro}</p>
            <button
              onClick={carregarRastreio}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        ) : dados ? (
          <div className="space-y-4">
            {/* Card Principal de Status */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xs space-y-5">
              {/* Cabeçalho do Card */}
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
                    Protocolo de Atendimento
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-100 block">
                    {dados.codigoRastreio}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Cliente</span>
                  <span className="text-xs font-semibold text-slate-200 block truncate max-w-[160px]">
                    {dados.clienteNome}
                  </span>
                </div>
              </div>

              {/* Status em Destaque */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center text-blue-400 shrink-0">
                  {dados.status === 'CONCLUIDA' ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : dados.status === 'EM_DESLOCAMENTO' ? (
                    <Truck size={20} className="animate-pulse" />
                  ) : (
                    <Wrench size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-100">
                    {dados.statusDescricao}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {dados.titulo} • <span className="text-blue-300 font-medium">{dados.tipoServico}</span>
                  </p>
                </div>
              </div>

              {/* Linha do Tempo Estilo Uber */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Progresso do Atendimento
                </span>
                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                  {ETAPAS.map((etapa, idx) => {
                    const isConcluida = idx < etapaAtualIndex;
                    const isAtual = idx === etapaAtualIndex;
                    const isPendente = idx > etapaAtualIndex;

                    return (
                      <div key={etapa.id} className="relative flex items-start gap-3">
                        <span
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isConcluida
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : isAtual
                              ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20'
                              : 'bg-slate-800 border-slate-600 text-slate-500'
                          }`}
                        >
                          {isConcluida ? '✓' : idx + 1}
                        </span>
                        <div>
                          <p
                            className={`text-xs font-bold leading-tight ${
                              isAtual
                                ? 'text-blue-400'
                                : isConcluida
                                ? 'text-slate-200'
                                : 'text-slate-500'
                            }`}
                          >
                            {etapa.label}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            {etapa.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detalhes do Técnico e Equipamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-700/70">
                {/* Cartão do Técnico */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                    <User size={16} />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Técnico Responsável</span>
                    <span className="text-xs font-bold text-slate-100 truncate block">
                      {dados.tecnicoNome || 'A definir'}
                    </span>
                  </div>
                </div>

                {/* Cartão do Equipamento Atendido */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-base shrink-0">
                    {catInfo ? catInfo.emoji : '🔧'}
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {catInfo ? catInfo.label.split('/')[0] : 'Equipamento'}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate block">
                      {dados.equipamentoNome}
                    </span>
                  </div>
                </div>
              </div>

              {/* Se Concluído: Laudo e Assinatura */}
              {dados.status === 'CONCLUIDA' && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck size={16} />
                    <span>Ordem de Serviço Validada & Concluída</span>
                  </div>
                  {dados.laudoTecnico && (
                    <p className="text-slate-300 text-[11px] bg-slate-900/40 p-2.5 rounded-lg border border-emerald-500/20">
                      <strong>Parecer Técnico:</strong> {dados.laudoTecnico}
                    </p>
                  )}
                  {dados.temAssinatura && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
                      <PenTool size={13} />
                      <span>Assinatura digital do cliente coletada no encerramento.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Rodapé */}
      <footer className="max-w-xl w-full mx-auto text-center text-[11px] text-slate-500 border-t border-slate-800 pt-4">
        <span>FieldOps SaaS • Gestão Operacional de Equipes Externas</span>
      </footer>
    </div>
  );
}
