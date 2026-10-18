import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Briefcase,
  CalendarClock,
  AlertTriangle,
  PlusCircle,
  FileText,
  FolderOpen,
  FileSpreadsheet,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react';
import { useLoanContext } from '../context/LoanContext';

export type NavView =
  | 'DASHBOARD'
  | 'CALCULATOR'
  | 'ACTIVE_PORTFOLIO'
  | 'PENDING_PAYMENTS'
  | 'OVERDUE_LOANS'
  | 'CONTRACTS'
  | 'DOCUMENTS'
  | 'ACCOUNTING'
  | 'EXCHANGE_RATE';

interface SidebarProps {
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  onOpenNewLoanModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  onOpenNewLoanModal,
}) => {
  const { loans, exchangeRate } = useLoanContext();

  const overdueCount = loans.filter(l => l.status === 'VENCIDO').length;
  
  // Pending installments due soon
  const today = new Date().toISOString().slice(0, 10);
  const pendingCount = loans.reduce((acc, l) => {
    return acc + l.schedule.filter(s => s.status === 'PENDIENTE' && s.dueDate <= today).length;
  }, 0);

  const menuItems = [
    {
      id: 'DASHBOARD' as NavView,
      label: 'Resumen General',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'CALCULATOR' as NavView,
      label: 'Calculadora / Cotizador',
      icon: Calculator,
      badge: 'Francés',
      badgeColor: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30',
    },
    {
      id: 'ACTIVE_PORTFOLIO' as NavView,
      label: 'Cartera Activa',
      icon: Briefcase,
      badge: loans.filter(l => l.status === 'ACTIVO').length.toString(),
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
    },
    {
      id: 'PENDING_PAYMENTS' as NavView,
      label: 'Créditos por Pagar',
      icon: CalendarClock,
      badge: pendingCount > 0 ? `${pendingCount} hoy` : null,
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
    },
    {
      id: 'OVERDUE_LOANS' as NavView,
      label: 'Créditos Vencidos',
      icon: AlertTriangle,
      badge: overdueCount > 0 ? `${overdueCount} mora` : null,
      badgeColor: 'bg-red-600 text-white font-black animate-pulse shadow-sm shadow-red-500/50',
    },
    {
      id: 'CONTRACTS' as NavView,
      label: 'Contratos Civiles',
      icon: FileText,
      badge: null,
    },
    {
      id: 'DOCUMENTS' as NavView,
      label: 'Expedientes & Documentos',
      icon: FolderOpen,
      badge: 'KYC',
      badgeColor: 'bg-blue-400/20 text-blue-200',
    },
    {
      id: 'ACCOUNTING' as NavView,
      label: 'Gestión Contable & PDF',
      icon: FileSpreadsheet,
      badge: 'Auto PDF',
      badgeColor: 'bg-yellow-500/20 text-yellow-300',
    },
    {
      id: 'EXCHANGE_RATE' as NavView,
      label: 'Tipo de Cambio',
      icon: ArrowLeftRight,
      badge: `${exchangeRate.symbol} ${exchangeRate.usdSell.toFixed(2)}`,
      badgeColor: 'bg-blue-900 text-yellow-300 border border-yellow-400/40',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 border border-yellow-400/50 flex items-center justify-center text-yellow-300 font-black shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1">
              Credi<span className="text-yellow-400">Plus</span>
            </h1>
            <p className="text-[11px] text-blue-200/70 font-medium">Sistema de Préstamos</p>
          </div>
        </div>
      </div>

      {/* Action Button: Nuevo Préstamo */}
      <div className="p-4 border-b border-slate-800/80">
        <button
          onClick={onOpenNewLoanModal}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-2.5 px-4 rounded-lg transition-all duration-150 shadow-md shadow-yellow-500/20 cursor-pointer text-sm"
        >
          <PlusCircle className="w-4 h-4 text-blue-950" />
          <span>Nuevo Préstamo</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
          Módulos Principales
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white font-bold shadow-sm border-l-4 border-yellow-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-yellow-300' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-blue-900 text-yellow-300 font-bold border border-yellow-400/40' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Exchange Rate Mini Ticker Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ArrowLeftRight className="w-3.5 h-3.5 text-yellow-400" />
            Tipo de Cambio
          </span>
          <span className="text-[10px] text-yellow-400 font-black bg-yellow-400/20 px-1.5 py-0.5 rounded border border-yellow-400/30">
            {exchangeRate.rateType === 'OFICIAL' ? 'Oficial BCB' : 'Paralelo'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-900 p-2 rounded border border-blue-950">
          <div>
            <span className="text-[10px] text-slate-400 block">Compra USD</span>
            <span className="font-bold text-white text-xs">
              {exchangeRate.symbol} {exchangeRate.usdBuy.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-yellow-300/80 block">Venta USD</span>
            <span className="font-extrabold text-yellow-400 text-xs">
              {exchangeRate.symbol} {exchangeRate.usdSell.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
          Bolivianos (Bs) · T.C. Paralelo Bolivia
        </p>
      </div>
    </aside>
  );
};
