import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import {
  ShieldCheck,
  Key,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, users } = useLoanContext();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current typed username is admin/jefe
  const cleanUser = username.trim().toLowerCase();
  const matchedUser = users.find(
    u => u.username.toLowerCase() === cleanUser || (cleanUser === 'admin' && u.role === 'JEFE_AGENCIA')
  );
  const isAdmin = matchedUser ? matchedUser.role === 'JEFE_AGENCIA' : cleanUser === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = login(username, password, isAdmin ? undefined : token);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Error al iniciar sesión.');
    }
  };

  const handleQuickLogin = (u: string, p: string, t?: string) => {
    setUsername(u);
    setPassword(p);
    setToken(t || '');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 p-6 border-b border-blue-900/60 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 border-2 border-yellow-400 shadow-lg shadow-blue-500/30 mb-3">
            <ShieldCheck className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Credi<span className="text-yellow-400">Plus</span> Bolivia
          </h1>
          <p className="text-xs text-blue-200/80 mt-1 font-medium">
            Sistema Integrado de Gestión Crediticia &amp; Expedientes
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-200">Acceso denegado:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Usuario de Sistema
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Ej: admin o asesor.flimachi"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Token Input (Only for non-admin users) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Token de Acceso
              </label>
              {isAdmin ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  ✓ NO REQUERIDO PARA ADMIN
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black">
                  REQUERIDO PARA ASESOR
                </span>
              )}
            </div>

            <div className="relative">
              <Key
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isAdmin ? 'text-slate-600' : 'text-yellow-400'
                }`}
              />
              <input
                type="text"
                value={isAdmin ? '' : token}
                disabled={isAdmin}
                onChange={e => {
                  setToken(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={isAdmin ? 'El Administrador ingresa sin token' : 'Ej: TOK-7791'}
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm transition-colors ${
                  isAdmin
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed placeholder-slate-600'
                    : 'bg-slate-950 border-slate-700 text-yellow-300 placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono font-bold'
                }`}
                required={!isAdmin}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              {isAdmin
                ? 'El Administrador / Jefe de Agencia accede directamente con su clave y es el único que puede generar tokens para otros usuarios.'
                : 'Este token debe ser generado previamente por el Jefe de Agencia desde el panel de creación de usuarios.'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 py-3 rounded-xl font-black text-sm tracking-wide shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] cursor-pointer mt-2"
          >
            <span>INGRESAR AL SISTEMA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Credentials Helpers for testing */}
        <div className="bg-slate-950/80 p-4 border-t border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Accesos de Demostración Rápida
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Admin test button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin', '')}
              className="p-2.5 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin / Jefe</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate">User: <strong>admin</strong></p>
              <p className="text-[10px] text-emerald-400 font-semibold">Sin token (Directo)</p>
            </button>

            {/* Asesor test button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('asesor.flimachi', '123', 'TOK-7791')}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-blue-300 font-bold text-[11px]">
                <User className="w-3.5 h-3.5" />
                <span>Asesor F. Limachi</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate">User: <strong>asesor.flimachi</strong></p>
              <p className="text-[10px] text-yellow-300 font-mono font-bold">Token: TOK-7791</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer information */}
      <p className="text-xs text-slate-500 mt-6 text-center">
        CrediPlus Bolivia • Normativa de Seguridad Operativa y Control de Accesos por Token
      </p>
    </div>
  );
};
