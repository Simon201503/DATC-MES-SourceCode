import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('账号不存在或密码错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--app-bg)] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(1100px_700px_at_12%_10%,rgba(10,132,255,0.16),transparent_58%),radial-gradient(900px_620px_at_88%_12%,rgba(88,86,214,0.12),transparent_56%),radial-gradient(900px_700px_at_50%_85%,rgba(52,199,89,0.08),transparent_58%)]"></div>
      
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/15 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-[440px] relative z-10 overflow-hidden rounded-[2rem] border border-black/5 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl shadow-[var(--shadow-float)]">
        <div className="absolute inset-0 bg-[radial-gradient(700px_380px_at_10%_0%,rgba(10,132,255,0.14),transparent_55%),radial-gradient(520px_320px_at_100%_8%,rgba(88,86,214,0.10),transparent_52%)]" />
        <div className="relative p-10 md:p-14">
          <div className="text-center mb-10">
            <div className="mx-auto flex items-center justify-center w-full">
              <img src="/datc-logo.svg" alt="DATC Logo" className="h-20 md:h-24 w-auto object-contain mx-auto" />
            </div>
            <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              DATC-PMS
            </h1>
          </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Account ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--accent)] transition-colors" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="block w-full pl-11 pr-4 py-3.5 bg-white/70 border border-black/10 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] focus:border-transparent transition-all shadow-sm"
                placeholder="Enter your account ID"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--accent)] transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="block w-full pl-11 pr-4 py-3.5 bg-white/70 border border-black/10 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.22)] focus:border-transparent transition-all shadow-sm"
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-sm text-sm font-bold text-white bg-[color:var(--accent)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[rgba(10,132,255,0.25)] transition-all"
          >
            Sign In <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        <div className="mt-8">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Secure Enterprise Login</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
