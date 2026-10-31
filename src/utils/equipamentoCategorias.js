export const CATEGORIAS_EQUIPAMENTO = {
  CLIMATIZACAO: {
    id: 'CLIMATIZACAO',
    label: 'Climatização / Ar-Condicionado',
    emoji: '❄️',
    cor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    descricao: 'Splits, VRF, Chillers, Condensadoras'
  },
  REFRIGERACAO: {
    id: 'REFRIGERACAO',
    label: 'Refrigeração / Freezers',
    emoji: '🧊',
    cor: 'text-blue-700 bg-blue-50 border-blue-200',
    descricao: 'Câmaras frias, balcões e geladeiras comerciais'
  },
  TI_REDE: {
    id: 'TI_REDE',
    label: 'TI, Redes & Servidores',
    emoji: '📶',
    cor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    descricao: 'Roteadores, switches, racks e modems'
  },
  ELEVADOR_MECANICA: {
    id: 'ELEVADOR_MECANICA',
    label: 'Elevadores & Maquinário',
    emoji: '⚙️',
    cor: 'text-amber-700 bg-amber-50 border-amber-200',
    descricao: 'Elevadores, esteiras, motores e bombas'
  },
  DEDETIZACAO_PRAGAS: {
    id: 'DEDETIZACAO_PRAGAS',
    label: 'Dedetização & Ponto de Isca',
    emoji: '🛡️',
    cor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    descricao: 'Iscas numeradas, armadilhas e pulverizações'
  },
  ELETRICA_ENERGIA: {
    id: 'ELETRICA_ENERGIA',
    label: 'Elétrica & Geradores',
    emoji: '⚡',
    cor: 'text-yellow-800 bg-yellow-50 border-yellow-200',
    descricao: 'Quadros de distribuição, geradores e no-breaks'
  },
  OUTRO: {
    id: 'OUTRO',
    label: 'Outro Ativo',
    emoji: '🔧',
    cor: 'text-slate-700 bg-slate-50 border-slate-200',
    descricao: 'Instalações e ativos gerais'
  }
};

export function getCategoriaInfo(categoria) {
  return CATEGORIAS_EQUIPAMENTO[categoria] || CATEGORIAS_EQUIPAMENTO.OUTRO;
}
