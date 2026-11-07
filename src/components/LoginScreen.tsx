import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import {
  ShieldCheck,
  Key,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, users, resetUsersToDefault } = useLoanContext();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check matching user
  const cleanUser = username.trim().toLowerCase();
  const matchedUser = users.find(
    u =>
      u.username.toLowerCase() === cleanUser ||
      (cleanUser === 'admin' && u.role === 'JEFE_AGENCIA') ||
      (cleanUser === 'jefe' && u.role === 'JEFE_AGENCIA')
  );
  const isAdmin = matchedUser ? matchedUser.role === 'JEFE_AGENCIA' : (cleanUser === 'admin' || cleanUser === 'jefe' || cleanUser === 'administrador');

  // Handle dropdown selection of existing system user
  const handleSelectUserAccount = (selectedId: string) => {
    setErrorMessage('');
    const u = users.find(usr => usr.id === selectedId);
    if (!u) return;

    setUsername(u.username);
    if (u.role === 'JEFE_AGENCIA') {
      setPassword(u.password || 'admin');
      setToken('');
    } else {
      setPassword(u.password || '123');
      setToken(u.accessToken || 'TOK-7791');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = login(username, password, isAdmin ? undefined : token);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  // 1-Click direct login helper
  const handleQuickLogin = (u: string, p: string, t?: string) => {
    setUsername(u);
    setPassword(p);
    setToken(t || '');
    setErrorMessage('');
    const res = login(u, p, t);
    if (!res.success) {
      setErrorMessage(res.message || 'Error en inicio rápido.');
    }
  };

  const handleResetData = () => {
    if (confirm('¿Restablecer usuarios iniciales del sistema (admin y asesores) a su configuración original?')) {
      resetUsersToDefault();
      setUsername('admin');
      setPassword('admin');
      setToken('');
      setErrorMessage('');
      alert('Usuarios restablecidos con éxito: Admin (clave: admin), Asesor F. Limachi (clave: 123, token: TOK-7791).');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Banner */}
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
              <div className="flex-1">
                <strong className="block text-red-200 font-bold">Aviso del Sistema:</strong>
                <span>{errorMessage}</span>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin', 'admin', '')}
                    className="px-2 py-1 bg-yellow-400 text-slate-950 font-bold rounded text-[10px] hover:bg-yellow-300 cursor-pointer"
                  >
                    Entrar como Admin
                  </button>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="px-2 py-1 bg-slate-800 text-slate-300 font-bold rounded text-[10px] hover:bg-slate-700 cursor-pointer"
                  >
                    Restablecer Usuarios
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick User Selector Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-yellow-400" />
                <span>Seleccionar Usuario del Sistema</span>
              </span>
              <span className="text-[10px] text-yellow-400 font-medium">Autocompletar</span>
            </label>
            <select
              value={matchedUser ? matchedUser.id : ''}
              onChange={e => handleSelectUserAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
            >
              <option value="">-- Seleccionar o escribir manualmente abajo --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.role === 'JEFE_AGENCIA' ? '👑' : '👔'} {u.fullName} ({u.username}) — {u.role === 'JEFE_AGENCIA' ? 'Jefe (Sin token)' : `Asesor (Token: ${u.accessToken || 'TOK-7791'})`}
                </option>
              ))}
            </select>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre de Usuario
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
                placeholder="admin o asesor.flimachi"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors font-medium"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Token Input */}
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
              />
            </div>

            {!isAdmin && matchedUser && matchedUser.accessToken && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Token vigente de este usuario:</span>
                <button
                  type="button"
                  onClick={() => setToken(matchedUser.accessToken || 'TOK-7791')}
                  className="text-yellow-400 font-mono font-bold hover:underline cursor-pointer"
                >
                  {matchedUser.accessToken} (Usar)
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              {isAdmin
                ? 'El Administrador / Jefe de Agencia accede directamente con su clave y genera tokens para los asesores.'
                : 'Token único generado previamente por el Jefe de Agencia desde el panel de seguridad.'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 py-3 rounded-xl font-black text-sm tracking-wide shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] cursor-pointer mt-2"
          >
            <span>INGRESAR AL SISTEMA</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        {/* Quick Credentials Helpers for instant testing */}
        <div className="bg-slate-950/80 p-4 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Accesos Rápidos Directos (1 Clic)</span>
            <button
              type="button"
              onClick={handleResetData}
              title="Restablecer cuentas iniciales si hubo errores"
              className="text-slate-400 hover:text-yellow-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Admin test button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin', '')}
              className="p-2.5 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin / Jefe</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate">User: <strong>admin</strong></p>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sin token (Directo)</span>
              </p>
            </button>

            {/* Asesor test button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('asesor.flimachi', '123', 'TOK-7791')}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-300 font-bold text-[11px]">
                <User className="w-3.5 h-3.5" />
                <span>Asesor Limachi</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate">User: <strong>asesor.flimachi</strong></p>
              <p className="text-[10px] text-yellow-300 font-mono font-bold mt-0.5">Token: TOK-7791</p>
            </button>
          </div>

          {/* Direct bypass emergency button */}
          <button
            type="button"
            onClick={() => handleQuickLogin('admin', 'admin', '')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Acceso Inmediato al Panel de Administración</span>
          </button>
        </div>
      </div>

      {/* Footer information */}
      <p className="text-xs text-slate-500 mt-6 text-center">
        CrediPlus Bolivia • Control de Accesos Institucionales &amp; Matriz de Seguridad
      </p>
    </div>
  );
};
