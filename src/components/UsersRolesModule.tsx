import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { SystemUser, UserRole, ClientChangeRequest } from '../types';
import {
  Shield,
  Key,
  UserPlus,
  Trash2,
  RotateCcw,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Lock,
  UserCheck,
  Building,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const UsersRolesModule: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    addUser,
    deleteUser,
    resetUserPassword,
    unlockUser,
    changeOwnPassword,
    clientChangeRequests,
    approveClientChangeRequest,
    rejectClientChangeRequest,
  } = useLoanContext();

  const isJefe = currentUser.role === 'JEFE_AGENCIA';

  // Own password change state (Asesor & Jefe)
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Create User modal state (Jefe only)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('ASESOR_PRESTAMOS');
  const [newUserAgency, setNewUserAgency] = useState('Agencia Central');
  const [newUserPassword, setNewUserPassword] = useState('CrediPlus123*');

  // Review Client Change Request modal state (Jefe only)
  const [selectedRequest, setSelectedRequest] = useState<ClientChangeRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Handle own password update
  const handleUpdateOwnPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg('');
    setPassSuccessMsg('');

    if (currentUser.password && currentPass !== currentUser.password) {
      setPassErrorMsg('La contraseña actual ingresada es incorrecta.');
      return;
    }

    if (newPass.length < 6) {
      setPassErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassErrorMsg('Las contraseñas nuevas no coinciden.');
      return;
    }

    changeOwnPassword(currentUser.id, newPass);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPassSuccessMsg('¡Contraseña actualizada con éxito en el sistema!');
    setTimeout(() => setPassSuccessMsg(''), 5000);
  };

  // Handle user creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserUsername.trim() || !newUserFullName.trim()) return;

    if (users.some(u => u.username.toLowerCase() === newUserUsername.toLowerCase())) {
      alert('Ya existe un usuario registrado con ese nombre de usuario.');
      return;
    }

    const created: SystemUser = {
      id: `usr-${Date.now()}`,
      username: newUserUsername.trim(),
      fullName: newUserFullName.trim(),
      role: newUserRole,
      agency: newUserAgency,
      password: newUserPassword,
      isLocked: false,
      failedAttempts: 0,
      createdAt: new Date().toISOString(),
    };

    addUser(created);
    setIsCreateUserModalOpen(false);
    setNewUserUsername('');
    setNewUserFullName('');
    alert(`Usuario ${created.username} (${created.role}) creado exitosamente.`);
  };

  // Pending and authorized requests
  const pendingRequests = clientChangeRequests.filter(r => r.status === 'PENDIENTE');
  const historyRequests = clientChangeRequests.filter(r => r.status !== 'PENDIENTE');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-slate-900 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>MÓDULO DE USUARIOS, ROLES & SEGURIDAD</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Control de Accesos y Matriz de Permisos
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configuración estricta de privilegios: El Jefe de Agencia gestiona usuarios, desbloqueos y autoriza
              cambios en Datos Generales. El Asesor solo gestiona su propia credencial de acceso.
            </p>
          </div>

          {/* Switch Current User / Role for Simulation */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Simular Usuario Activo:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={currentUser.id}
                onChange={e => {
                  const u = users.find(usr => usr.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:border-yellow-400"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role === 'JEFE_AGENCIA' ? 'Jefe' : 'Asesor'}) {u.isLocked ? '[BLOQUEADO]' : ''}
                  </option>
                ))}
              </select>
              <span
                className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  isJefe ? 'bg-yellow-400 text-slate-900' : 'bg-blue-600 text-white'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MATRIX PERMISSIONS TABLE (Exact match to Image 1) */}
      <div className="bg-slate-900 border border-blue-900/60 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-blue-900/40 px-4 py-3 border-b border-blue-900/60 flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            Matriz Institucional de Funciones y Privilegios
          </h3>
          <span className="text-[11px] text-blue-200 font-semibold">
            Políticas de Seguridad Operativa CrediPlus
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blue-900 text-white font-bold">
              <tr>
                <th className="p-3 w-12 text-center border-r border-blue-800">N°</th>
                <th className="p-3 w-1/2 border-r border-blue-800">Jefe de Agencia</th>
                <th className="p-3 w-1/2">Asesor de Préstamos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 text-center font-bold text-yellow-400 bg-slate-950/40 border-r border-slate-800">
                  1
                </td>
                <td className="p-3 font-semibold text-white border-r border-slate-800">
                  Puede Generar usuarios y contraseñas con roles de Asesor de Préstamos o Jefe de Agencia.
                </td>
                <td className="p-3 text-slate-300">
                  Solo tiene acceso a este módulo para poder cambiar la contraseña que usa.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 text-center font-bold text-yellow-400 bg-slate-950/40 border-r border-slate-800">
                  2
                </td>
                <td className="p-3 font-semibold text-white border-r border-slate-800">
                  Puede reiniciar la contraseña en caso de que el asesor se bloqueara.
                </td>
                <td className="p-3 text-slate-300">
                  No puede cambiar el usuario asignado.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 text-center font-bold text-yellow-400 bg-slate-950/40 border-r border-slate-800">
                  3
                </td>
                <td className="p-3 font-semibold text-white border-r border-slate-800">
                  Puede eliminar usuarios.
                </td>
                <td className="p-3 text-slate-300">
                  Ni asignarse roles de manera independiente.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION: ASESOR DE PRÉSTAMOS - CAMBIO DE PROPIA CONTRASEÑA    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Key className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Cambiar mi Contraseña</h3>
              <p className="text-xs text-slate-400">
                Usuario activo: <strong className="text-white">{currentUser.username}</strong> ({currentUser.fullName})
              </p>
            </div>
          </div>

          {!isJefe && (
            <div className="p-3 bg-blue-950/50 border border-blue-900/60 rounded-lg text-xs text-blue-200">
              Usted tiene rol de <strong>Asesor de Préstamos</strong>. Conforme a la política institucional, solo
              tiene permitido modificar su contraseña personal. No puede alterar su nombre de usuario ni sus roles.
            </div>
          )}

          {passSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-lg text-xs text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passSuccessMsg}</span>
            </div>
          )}

          {passErrorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg text-xs text-red-400 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{passErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateOwnPassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña Actual *</label>
              <input
                type="password"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Ingrese contraseña actual"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nueva Contraseña *</label>
              <input
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repita nueva contraseña"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-yellow-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded-lg text-xs shadow-md transition-all active:scale-95"
            >
              Actualizar Mi Contraseña
            </button>
          </form>
        </div>

        {/* Profile Card & Restriction Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-yellow-400" />
              Ficha del Usuario del Sistema
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Usuario Asignado:</span>
                <span className="font-bold text-white text-sm">{currentUser.username}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">(Inmutable por asesor)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Nombre Completo:</span>
                <span className="font-bold text-white">{currentUser.fullName}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Rol en Sistema:</span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    isJefe ? 'bg-yellow-400 text-slate-900' : 'bg-blue-600 text-white'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Agencia:</span>
                <span className="font-bold text-white">{currentUser.agency}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Estado de Cuenta:</span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    currentUser.isLocked ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {currentUser.isLocked ? 'BLOQUEADO' : 'ACTIVO'}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Fecha Alta:</span>
                <span className="text-slate-300">{currentUser.createdAt.slice(0, 10)}</span>
              </div>
            </div>
          </div>

          {/* Solicitudes de modificación remitidas por este asesor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Historial de Solicitudes de Modificación de Datos de Clientes
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Monitoreo del estado de las solicitudes enviadas a la Jefatura de Agencia.
            </p>

            <div className="border border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Cliente</th>
                    <th className="p-2.5">Cambios</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5">Autorizado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {clientChangeRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">
                        No hay solicitudes de modificación registradas.
                      </td>
                    </tr>
                  ) : (
                    clientChangeRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5">{(req.requestedAt || req.requestDate || '').slice(0, 10)}</td>
                        <td className="p-2.5 font-bold text-white">{req.clientName}</td>
                        <td className="p-2.5 text-slate-400">
                          {req.changedFields.map(f => f.fieldName).join(', ')}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              req.status === 'AUTORIZADO'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : req.status === 'RECHAZADO'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400">{req.authorizedBy || 'Pendiente'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION: JEFE DE AGENCIA CONTROLS (Image 1 Matrix)              */}
      {/* ============================================================== */}
      {isJefe ? (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          {/* Header of Jefe Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Panel Exclusivo de Jefe de Agencia
              </span>
              <h2 className="text-xl font-bold text-white">
                Administración de Usuarios y Desbloqueos de Contraseña
              </h2>
            </div>
            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-4 py-2 rounded-lg text-xs shadow-md transition-transform active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Generar Usuario & Contraseña</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Usuarios Registrados en el Sistema ({users.length})
              </h3>
              <span className="text-xs text-slate-400">
                Punto 1, 2 y 3: Creación, Reinicio por bloqueo y Eliminación
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Nombre Completo</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Agencia</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Intentos Fallidos</th>
                    <th className="p-3 text-right">Acciones de Jefatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{u.username}</td>
                      <td className="p-3">{u.fullName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            u.role === 'JEFE_AGENCIA'
                              ? 'bg-yellow-400 text-slate-900'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {u.role === 'JEFE_AGENCIA' ? 'Jefe de Agencia' : 'Asesor de Préstamos'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{u.agency}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            u.isLocked
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {u.isLocked ? 'BLOQUEADO' : 'ACTIVO'}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-400">{u.failedAttempts || 0}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reinicio de contraseña si se bloquea (Punto 2) */}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `¿Desea reiniciar la contraseña del usuario ${u.username}? La nueva contraseña será "CrediPlus123*" y se desbloqueará la cuenta.`
                                )
                              ) {
                                resetUserPassword(u.id);
                                alert(`Contraseña reiniciada a "CrediPlus123*" y cuenta desbloqueada.`);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                            title="Reiniciar contraseña y desbloquear"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reiniciar Clave</span>
                          </button>

                          {/* Desbloqueo directo */}
                          {u.isLocked && (
                            <button
                              onClick={() => {
                                unlockUser(u.id);
                                alert(`Usuario ${u.username} desbloqueado exitosamente.`);
                              }}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Desbloquear</span>
                            </button>
                          )}

                          {/* Eliminar usuario (Punto 3) */}
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Confirma eliminar definitivamente al usuario ${u.username}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs transition-colors"
                              title="Eliminar Usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BANDEJA DE AUTORIZACIÓN DE CAMBIOS DE DATOS DE CLIENTES */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-3 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
                  Bandeja de Autorizaciones
                </span>
                <h3 className="text-base font-bold text-white">
                  Solicitudes de Modificación de Datos de Clientes Pendientes ({pendingRequests.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Aprobación obligatoria para C.I., Apellidos, Nombres y Estado Civil
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No hay solicitudes pendientes de autorización en este momento. Todas las modificaciones se encuentran al día.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-3">Solicitante</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Doc. Cliente</th>
                      <th className="p-3">Campos Solicitados</th>
                      <th className="p-3">Motivo</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {pendingRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">{req.requestedBy}</td>
                        <td className="p-3 font-bold text-yellow-400">{req.clientName}</td>
                        <td className="p-3 text-slate-400">{req.clientDocument}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-[11px] font-medium">
                            {req.changedFields.length} campos ({req.changedFields.map(f => f.fieldName).join(', ')})
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 italic max-w-xs truncate">
                          "{req.changedFields[0]?.reason || 'Sin justificación'}"
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setReviewNotes('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Revisar & Autorizar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-3">
          <Lock className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <strong className="text-white block">Acceso Administrativo Restringido</strong>
            El panel de administración de usuarios, reseteos de contraseña y autorización de cambios de clientes
            es exclusivo para usuarios con rol de <strong>Jefe de Agencia</strong>. Puede cambiar al usuario Jefe de Agencia
            en la esquina superior para probar estas funcionalidades.
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE USER (Jefe de Agencia)                           */}
      {/* ============================================================== */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-yellow-400" />
                Generar Nuevo Usuario & Contraseña
              </h3>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre de Usuario (Login) *</label>
                <input
                  type="text"
                  value={newUserUsername}
                  onChange={e => setNewUserUsername(e.target.value)}
                  placeholder="Ej: f.limachi o a.morales"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre y Apellido Completo *</label>
                <input
                  type="text"
                  value={newUserFullName}
                  onChange={e => setNewUserFullName(e.target.value)}
                  placeholder="Ej: Fernando Limachi Orellana"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rol a Asignar *</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="ASESOR_PRESTAMOS">Asesor de Préstamos</option>
                  <option value="JEFE_AGENCIA">Jefe de Agencia</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Agencia *</label>
                <input
                  type="text"
                  value={newUserAgency}
                  onChange={e => setNewUserAgency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contraseña Inicial *</label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  El asesor podrá cambiar esta contraseña al ingresar.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold shadow-md"
                >
                  Generar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REVIEW & AUTHORIZE CLIENT CHANGE REQUEST (Jefe)         */}
      {/* ============================================================== */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">
                  Dictamen de Modificación de Datos
                </span>
                <h3 className="text-base font-bold text-white">
                  Autorización de Cambio: {selectedRequest.clientName}
                </h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>
                  Solicitado por: <strong className="text-white">{selectedRequest.requestedBy}</strong>
                </span>
                <span>Fecha: {(selectedRequest.requestedAt || selectedRequest.requestDate || '').slice(0, 16).replace('T', ' ')}</span>
              </div>
              <p className="text-slate-300">
                Cédula del Cliente: <strong>{selectedRequest.clientDocument}</strong>
              </p>
            </div>

            {/* Comparison Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-3">Campo Solicitado</th>
                    <th className="p-3">Información Actual</th>
                    <th className="p-3">Información Propuesta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {selectedRequest.changedFields.map((f, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-white">{f.fieldName}</td>
                      <td className="p-3 text-red-400 line-through">{f.oldValue || '(Vacío)'}</td>
                      <td className="p-3 text-emerald-400 font-bold">{f.newValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Justification Provided */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <span className="font-bold text-yellow-300 block mb-1">
                Motivo / Justificación declarada por el Asesor:
              </span>
              <p className="text-slate-200 italic">
                "{selectedRequest.changedFields[0]?.reason || 'Sin justificación adicional'}"
              </p>
            </div>

            {/* Notes by Jefe */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Observaciones del Jefe de Agencia (Opcional):
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Ej: Aprobado tras verificar documento original escaneado de C.I."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            {/* Actions: Approve / Reject */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  rejectClientChangeRequest(selectedRequest.id, reviewNotes || 'Rechazado por Jefatura');
                  setSelectedRequest(null);
                  alert('La solicitud ha sido RECHAZADA.');
                }}
                className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-bold"
              >
                Rechazar Solicitud
              </button>

              <button
                type="button"
                onClick={() => {
                  approveClientChangeRequest(selectedRequest.id, reviewNotes || 'Aprobado formalmente por Jefe de Agencia');
                  setSelectedRequest(null);
                  alert('¡Solicitud AUTORIZADA! Los datos del cliente han sido actualizados en la base de datos.');
                }}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Autorizar y Aplicar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
