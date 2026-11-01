import { useState, useEffect } from 'react';
import api from '../services/api';
import NovoEquipamentoModal from '../components/NovoEquipamentoModal';
import QRCodeModal from '../components/QRCodeModal';
import { 
  Plus, 
  Search, 
  RotateCw, 
  AlertCircle, 
  Wrench, 
  QrCode, 
  Building2, 
  MapPin, 
  Tag, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { CATEGORIAS_EQUIPAMENTO, getCategoriaInfo } from '../utils/equipamentoCategorias';

export default function EquipamentosPage({ isTab = false }) {
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [equipamentoQr, setEquipamentoQr] = useState(null);

  const carregarEquipamentos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = await api.get('/equipamentos', { timeout: 8000 });
      setEquipamentos(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar equipamentos:', err);
      setErro('Não foi possível carregar a lista de equipamentos. Verifique a conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  const equipamentosFiltrados = equipamentos.filter((eq) => {
    const termo = busca.toLowerCase();
    const nome = eq.nome?.toLowerCase() || '';
    const cliente = eq.clienteNome?.toLowerCase() || '';
    const serie = eq.numeroSerie?.toLowerCase() || '';
    const codigo = eq.codigoQr?.toLowerCase() || '';
    const fabricante = eq.fabricante?.toLowerCase() || '';
    const local = eq.localizacao?.toLowerCase() || '';

    const correspondeBusca = 
      nome.includes(termo) || 
      cliente.includes(termo) || 
      serie.includes(termo) || 
      codigo.includes(termo) ||
      fabricante.includes(termo) ||
      local.includes(termo);

    const correspondeCategoria = 
      categoriaFiltro === 'TODOS' || eq.categoria === categoriaFiltro;

    return correspondeBusca && correspondeCategoria;
  });

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      {!isTab ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="text-blue-600" size={24} />
              <span>Gestão de Ativos & Equipamentos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Cadastre os equipamentos dos clientes, gere etiquetas com QR Code e acompanhe manutenções.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={carregarEquipamentos}
              disabled={carregando}
              className={`inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2.5 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer ${
                carregando ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
              }`}
            >
              <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
              <span className="hidden sm:inline">{carregando ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
            <button
              onClick={() => setModalNovoAberto(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              <span>Novo Equipamento</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-700">Inventário de Equipamentos ({equipamentos.length})</span>
          <div className="flex items-center gap-2">
            <button
              onClick={carregarEquipamentos}
              disabled={carregando}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
              title="Atualizar lista"
            >
              <RotateCw size={14} className={carregando ? 'animate-spin text-blue-600' : ''} />
            </button>

            <button
              onClick={() => setModalNovoAberto(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Novo Ativo</span>
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Erro */}
      {erro && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{erro}</span>
          </div>
          <button
            onClick={carregarEquipamentos}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 underline shrink-0 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg w-full sm:max-w-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nome, cliente, série, QR Code ou local..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="text-xs text-slate-500">
            Total cadastrado: <strong>{equipamentosFiltrados.length}</strong> ativos
          </div>
        </div>

        {/* Pílulas de Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
            <Filter size={12} /> Categoria:
          </span>
          <button
            onClick={() => setCategoriaFiltro('TODOS')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              categoriaFiltro === 'TODOS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas ({equipamentos.length})
          </button>
          {Object.values(CATEGORIAS_EQUIPAMENTO).map((cat) => {
            const count = equipamentos.filter((e) => e.categoria === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaFiltro(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  categoriaFiltro === cat.id
                    ? `${cat.cor} ring-1 ring-inset ring-current font-semibold`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label.split('/')[0]}</span>
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid / Tabela de Equipamentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {carregando ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-none">
                <div className="h-5 bg-slate-200 rounded w-28" />
                <div className="h-5 bg-slate-200 rounded w-40" />
                <div className="h-5 bg-slate-200 rounded w-32 hidden sm:block" />
                <div className="h-7 bg-slate-200 rounded-lg w-24" />
              </div>
            ))}
          </div>
        ) : equipamentosFiltrados.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="inline-flex p-3 bg-slate-100 text-slate-400 rounded-full">
              <Wrench size={32} />
            </div>
            <p className="text-sm font-medium text-slate-700">Nenhum equipamento cadastrado</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {busca || categoriaFiltro !== 'TODOS'
                ? 'Nenhum ativo corresponde aos filtros selecionados.'
                : 'Clique no botão "Novo Equipamento" para cadastrar ar-condicionado, roteadores, geladeiras, pontos de dedetização e outros ativos.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Código QR / Tag</th>
                  <th className="px-5 py-3.5">Equipamento / Ativo</th>
                  <th className="px-5 py-3.5">Categoria</th>
                  <th className="px-5 py-3.5">Cliente Proprietário</th>
                  <th className="px-5 py-3.5">Localização / Setor</th>
                  <th className="px-5 py-3.5 text-right">Etiqueta QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipamentosFiltrados.map((eq) => {
                  const cat = getCategoriaInfo(eq.categoria);
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-blue-600">
                        {eq.codigoQr}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{eq.nome}</div>
                        {(eq.fabricante || eq.modelo) && (
                          <div className="text-xs text-slate-500">
                            {eq.fabricante} {eq.modelo ? `• ${eq.modelo}` : ''}
                          </div>
                        )}
                        {eq.numeroSerie && (
                          <div className="text-[11px] font-mono text-slate-400">
                            S/N: {eq.numeroSerie}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.cor}`}>
                          <span>{cat.emoji}</span>
                          <span>{cat.label.split('/')[0]}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                          <span>{eq.clienteNome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {eq.localizacao ? (
                          <div className="flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400 shrink-0" />
                            <span>{eq.localizacao}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Não informada</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setEquipamentoQr(eq)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Visualizar e Imprimir Etiqueta QR Code"
                        >
                          <QrCode size={14} />
                          <span>Ver QR</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <NovoEquipamentoModal
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSuccess={carregarEquipamentos}
      />

      {/* Modal de Etiqueta QR Code */}
      <QRCodeModal
        equipamento={equipamentoQr}
        isOpen={Boolean(equipamentoQr)}
        onClose={() => setEquipamentoQr(null)}
      />
    </div>
  );
}
