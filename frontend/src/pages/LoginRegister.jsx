import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Waves, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [role, setRole] = useState('STUDENT');

  // Status states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setTelefone('');
    setRole('STUDENT');
    setError(null);
    setSuccess(null);
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        // Handle Login
        const user = await login(email, password);
        setSuccess('Login realizado com sucesso! Redirecionando...');
        
        // Redirect based on role
        setTimeout(() => {
          if (user.role === 'ADMIN') navigate('/admin');
          else if (user.role === 'INSTRUCTOR') navigate('/instructor');
          else navigate('/student');
        }, 1000);

      } else {
        // Handle Registration
        await register({ name, email, password, role, telefone });
        setSuccess('Cadastro realizado! Agora você já pode fazer login.');
        
        // Auto-switch to login tab and fill email
        setTimeout(() => {
          setIsLogin(true);
          setError(null);
          setSuccess(null);
          setPassword('');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro no processo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Cinematic Surf Background (Synced) */}
      <div className="fixed inset-0 w-full h-full -z-10">
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop" 
          alt="Surf Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Animated logo and title */}
        <div className="inline-flex items-center justify-center p-3 bg-cyan-500 text-zinc-950 rounded-2xl shadow-lg shadow-cyan-500/10 animate-wave mb-4">
          <Waves className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white font-sans">
          Surf<span className="text-cyan-400">Connect</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Escola de Surf — Gestão & Agendamentos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="glass-card py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-zinc-800">
          
          {/* Tabs header */}
          <div className="flex border-b border-zinc-800 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 pb-4 text-center font-semibold text-lg transition-all border-b-2 cursor-pointer ${
                isLogin 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 pb-4 text-center font-semibold text-lg transition-all border-b-2 cursor-pointer ${
                !isLogin 
                  ? 'border-cyan-500 text-cyan-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Cadastrar-se
            </button>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border-l-4 border-red-500 text-red-200 text-sm rounded-r-xl flex items-center gap-2 border border-y-red-950 border-r-red-950">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-200 text-sm rounded-r-xl flex items-center gap-2 border border-y-emerald-950 border-r-emerald-950">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* NAME field (only for Register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="João da Silva"
                    className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/80 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* EMAIL field */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Endereço de E-mail
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@surfconnect.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/80 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* TELEFONE field (only for Register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  WhatsApp / Telefone
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(48) 99999-9999"
                    className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/80 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* ROLE field (only for Register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Perfil de Acesso (RBAC)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/80 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                >
                  <option value="STUDENT" className="bg-zinc-950 text-white">Aluno (STUDENT)</option>
                  <option value="INSTRUCTOR" className="bg-zinc-950 text-white">Instrutor (INSTRUCTOR)</option>
                  <option value="ADMIN" className="bg-zinc-950 text-white">Administrador (ADMIN)</option>
                </select>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Selecione o tipo de conta para testar o sistema RBAC completo.
                </p>
              </div>
            )}

            {/* PASSWORD field */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Senha
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/80 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-zinc-950 bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-cyan-500/10 hover:shadow-cyan-500/20"
              >
                {submitting ? 'Aguarde...' : isLogin ? 'Entrar no Sistema' : 'Criar minha Conta'}
              </button>
            </div>
          </form>

          {/* Quick Helper for seed accounts */}
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-zinc-800 text-xs text-zinc-400 space-y-2 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/40">
              <span className="font-semibold text-zinc-300 block mb-1">Contas de teste padrão:</span>
              <div>🧑‍🎓 Aluno: <code className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-cyan-400">lucas@surfconnect.com</code> / <code className="bg-zinc-900 border border-zinc-800 px-1.5 rounded">stud123</code></div>
              <div>🏄‍♂️ Instrutor: <code className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-cyan-400">joao@surfconnect.com</code> / <code className="bg-zinc-900 border border-zinc-800 px-1.5 rounded">inst123</code></div>
              <div>🔑 Admin: <code className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-cyan-400">admin@surfconnect.com</code> / <code className="bg-zinc-900 border border-zinc-800 px-1.5 rounded">admin123</code></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
