import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Layers, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Status de conexão com o backend
  const [apiStatus, setApiStatus] = useState({ online: false, checking: true, text: 'Verificando conexão...' });

  useEffect(() => {
    api.get('/status')
      .then((res) => {
        setApiStatus({ online: true, checking: false, text: res.data.status || 'API Online' });
      })
      .catch(() => {
        setApiStatus({ online: false, checking: false, text: 'API Backend Offline' });
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de autenticação rápida
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Top Header */}
        <div className="p-8 pb-6 text-center">
          <div className="inline-flex p-3 bg-blue-600 rounded-xl text-white mb-4 shadow-sm">
            <Layers size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FieldOps</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão Inteligente de Operações em Campo</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              E-mail Corporativo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2" />
              Lembrar de mim
            </label>
            <a href="#recuperar" className="text-blue-600 hover:underline font-medium">Esqueceu a senha?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-70"
          >
            {loading ? 'Acessando...' : (
              <>
                <span>Entrar no FieldOps</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé com Indicador de Conexão com o Backend */}
        <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Servidor de Aplicação:</span>
          <div className="flex items-center gap-1.5 font-medium">
            {apiStatus.online ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-emerald-700">{apiStatus.text}</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="text-amber-500" />
                <span className="text-amber-700">{apiStatus.text}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
