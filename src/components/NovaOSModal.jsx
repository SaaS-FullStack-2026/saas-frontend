import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, ClipboardPlus, Building2, User, AlertCircle, Loader2, Tag, AlertTriangle, Wrench, Calendar, Clock } from 'lucide-react';
import { getCategoriaInfo } from '../utils/equipamentoCategorias';

const obterAgoraLocalInput = () => {
  const d = new Date();
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function NovaOSModal({ isOpen, onClose, onSuccess, onOSCriada }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [agenteId, setAgenteId] = useState('');
  const [equipamentoId, setEquipamentoId] = useState('');
  const [tipoServico, setTipoServico] = useState('PREVENTIVA');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [dataAgendamento, setDataAgendamento] = useState(obterAgoraLocalInput());
  const [duracaoEstimadaMinutos, setDuracaoEstimadaMinutos] = useState(60);

  const [clientes, setClientes] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(false);
  
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErro(null);
      setCarregandoDados(true);

      // Buscar Clientes e Usuários/Agentes em paralelo
      Promise.all([
        api.get('/clientes'),
        api.get('/usuarios')
      ])
        .then(([resClientes, resUsuarios]) => {
          setClientes(resClientes.data || []);
          const apenasAgentes = (resUsuarios.data || []).filter((u) => u.perfil === 'AGENTE');
          setAgentes(apenasAgentes);
        })
        .catch((err) => {
          console.error('Erro ao carregar selects do modal:', err);
          setErro('Não foi possível carregar a lista de clientes e técnicos. Verifique a conexão.');
        })
        .finally(() => {
          setCarregandoDados(false);
        });
    }
  }, [isOpen]);

  // Carregar equipamentos do cliente quando o cliente for selecionado
  useEffect(() => {
    if (clienteId) {
      setCarregandoEquipamentos(true);
      setEquipamentoId('');
      api.get('/equipamentos', { params: { clienteId } })
        .then((res) => {
          setEquipamentos(res.data || []);
        })
        .catch((err) => {
          console.error('Erro ao buscar equipamentos do cliente:', err);
          setEquipamentos([]);
        })
        .finally(() => {
          setCarregandoEquipamentos(false);
        });
    } else {
      setEquipamentos([]);
      setEquipamentoId('');
    }
  }, [clienteId]);

  if (!isOpen) return null;

  const resetFormulario = () => {
    setTitulo('');
    setDescricao('');
    setClienteId('');
    setAgenteId('');
    setEquipamentoId('');
    setTipoServico('PREVENTIVA');
    setPrioridade('MEDIA');
    setDataAgendamento(obterAgoraLocalInput());
    setDuracaoEstimadaMinutos(60);
    setErro(null);
  };

  const handleFechar = () => {
    resetFormulario();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clienteId) {
      setErro('Por favor, selecione um cliente.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const user = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();

      const dataIso = dataAgendamento ? new Date(dataAgendamento).toISOString() : null;

      const res = await api.post('/ordens-servico', {
        titulo,
        descricao,
        empresaId: user.empresaId || 1,
        gestorId: user.id || 1,
        clienteId: Number(clienteId),
        agenteId: agenteId ? Number(agenteId) : null,
        equipamentoId: equipamentoId ? Number(equipamentoId) : null,
        tipoServico,
        prioridade,
        dataAgendamento: dataIso,
        duracaoEstimadaMinutos: Number(duracaoEstimadaMinutos) || 60,
        tempoDeslocamentoMinutos: 30
      });

      resetFormulario();
      try {
        (onSuccess || onOSCriada)?.(res?.data);
      } catch (callbackErr) {
        console.warn('Erro ao disparar callback pós-criação de OS:', callbackErr);
      }
      onClose?.();
    } catch (err) {
      console.error('Erro ao salvar Ordem de Serviço:', err);
      const mensagemServidor = err.response?.data?.message || err.response?.data || err.message;
      setErro(`Falha ao criar Ordem de Serviço: ${mensagemServidor}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/80 modal-surface">
        
        {/* Cabeçalho do Modal com acabamento refinado */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
            <div className="p-1.5 bg-blue-600/10 text-blue-600 rounded-lg">
              <ClipboardPlus size={20} />
            </div>
            <div>
              <h3 className="tracking-tight">Nova Ordem de Serviço</h3>
              <p className="text-[11px] font-normal text-slate-500">Preencha os dados e despache para a equipe de campo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFechar}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer btn-press"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerta de Erro Interno */}
        {erro && (
          <div className="mx-5 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 shrink-0">
            <AlertCircle size={17} className="shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{erro}</div>
          </div>
        )}

        {/* Formulário com Hierarquia Visual de 3 Blocos */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* BLOCO 1: IDENTIFICAÇÃO DO SERVIÇO & LOCAL */}
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
              1. Identificação & Destino
            </span>

            {/* Título */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título do Chamado *
              </label>
              <input
                type="text"
                required
                disabled={salvando}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Manutenção Preventiva em Nobreak"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 placeholder:text-slate-400"
              />
            </div>

            {/* Grid de Seleção (Cliente e Técnico) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Select Cliente */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400" /> Cliente Solicitante *
                </label>
                <select
                  required
                  disabled={carregandoDados || salvando}
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
                >
                  <option value="">{carregandoDados ? 'Carregando clientes...' : 'Selecione o cliente...'}</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* Select Técnico */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" /> Técnico Responsável
                </label>
                <select
                  disabled={carregandoDados || salvando}
                  value={agenteId}
                  onChange={(e) => setAgenteId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
                >
                  <option value="">{carregandoDados ? 'Carregando técnicos...' : 'Deixar em Aberto (Despachar depois)'}</option>
                  {agentes.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Equipamento / Ativo Vinculado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wrench size={13} className="text-slate-400" /> Ativo / Equipamento do Cliente
                </span>
                {clienteId && equipamentos.length === 0 && !carregandoEquipamentos && (
                  <span className="text-[10px] text-amber-600 font-normal">Nenhum ativo específico vinculado</span>
                )}
              </label>
              <select
                disabled={!clienteId || carregandoEquipamentos || salvando}
                value={equipamentoId}
                onChange={(e) => setEquipamentoId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
              >
                <option value="">
                  {!clienteId
                    ? 'Selecione primeiro o cliente acima...'
                    : carregandoEquipamentos
                    ? 'Carregando equipamentos do cliente...'
                    : equipamentos.length === 0
                    ? 'Atendimento geral (sem ativo específico)'
                    : 'Selecione o equipamento a inspecionar/consertar...'}
                </option>
                {equipamentos.map((eq) => {
                  const cat = getCategoriaInfo(eq.categoria);
                  return (
                    <option key={eq.id} value={eq.id}>
                      {cat.emoji} {eq.nome} {eq.numeroSerie ? `(S/N: ${eq.numeroSerie})` : ''} - {eq.localizacao || cat.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* BLOCO 2: CLASSIFICAÇÃO, DATA & SLA */}
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
              2. Classificação & Agendamento
            </span>

            {/* Grid de Tipo de Serviço e Prioridade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tipo de Serviço */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Tag size={13} className="text-slate-400" /> Tipo de Serviço
                </label>
                <select
                  disabled={salvando}
                  value={tipoServico}
                  onChange={(e) => setTipoServico(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
                >
                  <option value="PREVENTIVA">Manutenção Preventiva</option>
                  <option value="CORRETIVA">Manutenção Corretiva</option>
                  <option value="INSTALACAO">Instalação de Ativo</option>
                  <option value="VISTORIA">Vistoria / Inspeção</option>
                </select>
              </div>

              {/* Nível de Prioridade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-slate-400" /> Nível de Prioridade
                </label>
                <select
                  disabled={salvando}
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média (Padrão)</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica / Urgente</option>
                </select>
              </div>
            </div>

            {/* Data e Horário & Duração Estimada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" /> Data e Horário Previsto
                </label>
                <input
                  type="datetime-local"
                  disabled={salvando}
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60 font-medium tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" /> Duração Estimada
                </label>
                <select
                  disabled={salvando}
                  value={duracaoEstimadaMinutos}
                  onChange={(e) => setDuracaoEstimadaMinutos(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60 tabular-nums"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora (Padrão)</option>
                  <option value={90}>1 hora e 30 min</option>
                  <option value={120}>2 horas</option>
                  <option value={180}>3 horas</option>
                  <option value={240}>4 horas</option>
                </select>
              </div>
            </div>
          </div>

          {/* BLOCO 3: INSTRUÇÕES OPERACIONAIS */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
              3. Orientações de Campo
            </span>
            <textarea
              rows={3}
              disabled={salvando}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as instruções e orientações para o técnico executar no local..."
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none disabled:opacity-60 placeholder:text-slate-400"
            />
          </div>

          {/* Rodapé / Ações */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleFechar}
              disabled={salvando}
              className="btn-press px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || carregandoDados}
              className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Criando Chamado...</span>
                </>
              ) : (
                <span>Criar Ordem</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
