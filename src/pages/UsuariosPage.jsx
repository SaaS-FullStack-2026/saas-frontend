import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { 
  UserCheck, 
  Shield, 
  RotateCw, 
  UserPlus, 
  Search, 
  Edit2, 
  Power, 
  X, 
  Check, 
  Users, 
  Wrench, 
  KeyRound, 
  Mail, 
  User, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('TODOS');

  // Modais de Criação e Edição
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Estados dos Formulários
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'AGENTE',
    ativo: true
  });
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);
  const [sucessoMsg, setSucessoMsg] = useState(null);

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/usuarios');
      setUsuarios(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const abrirModalNovo = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      perfil: 'AGENTE',
      ativo: true
    });
    setErroForm(null);
    setModalNovoAberto(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '', // Opcional na edição
      perfil: usuario.perfil || 'AGENTE',
      ativo: usuario.ativo ?? true
    });
    setErroForm(null);
    setModalEditarAberto(true);
  };

  const handleSalvarNovo = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErroForm(null);

    try {
      const res = await api.post('/usuarios', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha || '123456',
        perfil: formData.perfil,
        ativo: formData.ativo
      });

      setUsuarios((prev) => [...prev, res.data]);
      setModalNovoAberto(false);
      setSucessoMsg(`Colaborador ${res.data.nome} cadastrado com sucesso!`);
      setTimeout(() => setSucessoMsg(null), 4000);
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setErroForm(`Falha ao cadastrar: ${msg}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!usuarioEditando) return;

    setSalvando(true);
    setErroForm(null);

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
        ativo: formData.ativo
      };
      if (formData.senha && formData.senha.trim() !== '') {
        payload.senha = formData.senha;
      }

      const res = await api.put(`/usuarios/${usuarioEditando.id}`, payload);
      setUsuarios((prev) => prev.map((u) => (u.id === res.data.id ? res.data : u)));
      setModalEditarAberto(false);
      setUsuarioEditando(null);
      setSucessoMsg(`Dados de ${res.data.nome} atualizados com sucesso!`);
      setTimeout(() => setSucessoMsg(null), 4000);
    } catch (err) {
      console.error('Erro ao editar usuário:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setErroForm(`Falha ao atualizar: ${msg}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const res = await api.patch(`/usuarios/${usuario.id}/toggle-status`);
      setUsuarios((prev) => prev.map((u) => (u.id === res.data.id ? res.data : u)));
      setSucessoMsg(`Status de ${res.data.nome} alterado para ${res.data.ativo ? 'Ativo' : 'Inativo'}.`);
      setTimeout(() => setSucessoMsg(null), 3000);
    } catch (err) {
      console.error('Erro ao alternar status do usuário:', err);
      alert('Não foi possível alterar o status do usuário.');
    }
  };

  // Filtros
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesTexto = 
        (u.nome || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(filtroTexto.toLowerCase());

      const matchesPerfil = filtroPerfil === 'TODOS' || u.perfil === filtroPerfil;

      return matchesTexto && matchesPerfil;
    });
  }, [usuarios, filtroTexto, filtroPerfil]);

  // Contadores
  const totalAgentes = useMemo(() => usuarios.filter((u) => u.perfil === 'AGENTE').length, [usuarios]);
  const totalGestores = useMemo(() => usuarios.filter((u) => u.perfil === 'GESTOR').length, [usuarios]);
  const totalAtivos = useMemo(() => usuarios.filter((u) => u.ativo).length, [usuarios]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            <span>Equipe e Usuários</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestão de colaboradores, atribuição de técnicos de campo e administradores do sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={carregarUsuarios}
            disabled={carregando}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw size={15} className={carregando ? 'animate-spin text-blue-600' : ''} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Novo Membro</span>
          </button>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {sucessoMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs uppercase tracking-wider text-slate-500 font-semibold block">Total Equipe</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{usuarios.length}</span>
            <span className="text-xs text-slate-500">membros</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs uppercase tracking-wider text-blue-600 font-semibold block">Técnicos em Campo</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700">{totalAgentes}</span>
            <span className="text-xs text-blue-600">agentes</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs uppercase tracking-wider text-indigo-600 font-semibold block">Gestão & Supervisão</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700">{totalGestores}</span>
            <span className="text-xs text-indigo-600">gestores</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs uppercase tracking-wider text-emerald-600 font-semibold block">Status Ativo</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{totalAtivos}</span>
            <span className="text-xs text-emerald-600">habilitados</span>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'AGENTE', label: 'Técnicos (Agentes)' },
            { id: 'GESTOR', label: 'Gestores' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroPerfil(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                filtroPerfil === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Usuários */}
      {carregando ? (
        <div className="text-center py-16 text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
          <RotateCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
          <span>Carregando membros da equipe...</span>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
          <Users size={32} className="mx-auto text-slate-400 opacity-60" />
          <p className="text-sm font-semibold text-slate-700">Nenhum membro encontrado</p>
          <p className="text-xs text-slate-400">
            {usuarios.length === 0 ? 'Cadastre o primeiro membro da sua equipe.' : 'Tente ajustar os filtros ou a busca.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {usuariosFiltrados.map((u) => {
            const isGestor = u.perfil === 'GESTOR';
            return (
              <div
                key={u.id}
                className={`bg-white p-5 rounded-2xl border transition-all duration-200 space-y-4 shadow-2xs hover:shadow-md ${
                  u.ativo ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-2xs ${
                        isGestor
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-700'
                          : 'bg-gradient-to-br from-blue-500 to-blue-700'
                      }`}
                    >
                      {u.nome?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{u.nome}</h3>
                      <p className="text-xs text-slate-500 font-mono truncate">{u.email}</p>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      isGestor
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Shield size={12} /> {isGestor ? 'Gestor' : 'Técnico'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status da Conta:</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-xs ${
                      u.ativo ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${u.ativo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Ações do Card */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => abrirModalEditar(u)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(u)}
                    title={u.ativo ? 'Desativar colaborador' : 'Ativar colaborador'}
                    className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      u.ativo
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <Power size={13} />
                    <span>{u.ativo ? 'Desativar' : 'Ativar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NOVO MEMBRO */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <UserPlus size={18} className="text-blue-600" />
                <span>Novo Membro da Equipe</span>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovo} className="p-5 space-y-4">
              {erroForm && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{erroForm}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User size={13} className="text-slate-400" /> Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eletricista"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" /> E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="carlos@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <KeyRound size={13} className="text-slate-400" /> Senha Inicial
                </label>
                <input
                  type="password"
                  placeholder="Padrão: 123456 (se deixar em branco)"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Shield size={13} className="text-slate-400" /> Perfil de Acesso
                </label>
                <select
                  value={formData.perfil}
                  onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="AGENTE">Técnico de Campo (Agente / Executor)</option>
                  <option value="GESTOR">Gestor / Supervisor (Painel Administrativo)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Criar Membro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR MEMBRO */}
      {modalEditarAberto && usuarioEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Edit2 size={18} className="text-blue-600" />
                <span>Editar Membro da Equipe</span>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarAberto(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-5 space-y-4">
              {erroForm && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{erroForm}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User size={13} className="text-slate-400" /> Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" /> E-mail
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <KeyRound size={13} className="text-slate-400" /> Redefinir Senha (Opcional)
                </label>
                <input
                  type="password"
                  placeholder="Deixe em branco para manter a senha atual"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Shield size={13} className="text-slate-400" /> Perfil de Acesso
                </label>
                <select
                  value={formData.perfil}
                  onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="AGENTE">Técnico de Campo (Agente / Executor)</option>
                  <option value="GESTOR">Gestor / Supervisor (Painel Administrativo)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ativoCheckbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="ativoCheckbox" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Conta Ativa (Habilitada para login e atribuição de serviços)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditarAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
