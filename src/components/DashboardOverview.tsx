import React from 'react';
import {
  Briefcase,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  FolderOpen,
  Calculator,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { useLoanContext } from '../context/LoanContext';
import { NavView } from './Sidebar';
import { Loan } from '../types';

interface DashboardOverviewProps {
  onNavigate: (view: NavView) => void;
  onOpenNewLoanModal: () => void;
  onSelectLoanForPayment: (loan: Loan, installmentNumber?: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenNewLoanModal,
  onSelectLoanForPayment,
}) => {
  const {
    loans,
    formatMoney,
    totalActiveCapital,
    totalOverdueCapital,
    totalCollected,
    totalPendingDueSoon,
    exchangeRate,
  } = useLoanContext();

  const activeLoans = loans.filter(l => l.status === 'ACTIVO');
  const overdueLoans = loans.filter(l => l.status === 'VENCIDO');

  // Total Interest expected
  const totalInterest = loans.reduce((acc, l) => acc + l.totalInterestExpected, 0);

  // Health percent
  const totalPortfolioCapital = totalActiveCapital + totalOverdueCapital;
  const healthyPercent =
    totalPortfolioCapital > 0
      ? Math.round((totalActiveCapital / totalPortfolioCapital) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            Sistema Integral de Préstamos y Cobranzas
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Panel de Control Financiero
          </h1>
          <p className="text-blue-100/80 text-xs mt-1 max-w-xl">
            Gestión de cartera con amortización francesa, generación de contratos civiles, seguimiento de mora crítica, carga de expedientes y reportes contables automáticos en PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('CALCULATOR')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-800/80 hover:bg-blue-700 text-yellow-300 rounded-lg text-xs font-bold border border-yellow-400/30 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-yellow-400" />
            <span>Cotizador Francés</span>
          </button>
          <button
            onClick={onOpenNewLoanModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-black shadow-md shadow-yellow-500/30 transition-colors cursor-pointer"
          >
            <span>+ Nuevo Préstamo</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cartera Activa */}
        <div
          onClick={() => onNavigate('ACTIVE_PORTFOLIO')}
          className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">
              Cartera Activa Vigente
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-950 mt-2">
            {formatMoney(totalActiveCapital)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>{activeLoans.length} créditos al día</span>
            <span className="text-blue-700 font-bold flex items-center gap-0.5">
              Ver cartera <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Créditos Vencidos / Mora (CRITICAL -> RED) */}
        <div
          onClick={() => onNavigate('OVERDUE_LOANS')}
          className="bg-red-50/90 p-5 rounded-xl border-2 border-red-400 shadow-sm hover:border-red-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-red-900 uppercase tracking-tight flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              Créditos Vencidos (Mora Crítica)
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shadow-red-500/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700 mt-2">
            {formatMoney(totalOverdueCapital)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-red-700 mt-2">
            <span className="font-bold">{overdueLoans.length} casos con recargo</span>
            <span className="font-extrabold text-red-800 flex items-center gap-0.5 underline">
              Gestionar mora <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: Créditos por Pagar / Cuotas próximas */}
        <div
          onClick={() => onNavigate('PENDING_PAYMENTS')}
          className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">
              Vencimientos Próximos
            </span>
            <div className="w-9 h-9 rounded-lg bg-yellow-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalPendingDueSoon} Cuotas
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>En los próx. 7 días</span>
            <span className="text-amber-800 font-bold flex items-center gap-0.5">
              Calendario <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Total Recuperado */}
        <div
          onClick={() => onNavigate('ACCOUNTING')}
          className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">
              Recuperación Total
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2">
            {formatMoney(totalCollected)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Capital + Intereses</span>
            <span className="text-blue-700 font-bold flex items-center gap-0.5">
              Contabilidad <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Health & Currency Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Bar (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Salud y Calidad de la Cartera Crediticia
            </h3>
            <span className="text-xs font-extrabold text-blue-900">
              {healthyPercent}% Cartera Normal
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${healthyPercent}%` }}
              title="Cartera normal al día"
            />
            <div
              className="bg-red-600 h-full transition-all duration-500"
              style={{ width: `${100 - healthyPercent}%` }}
              title="Cartera en mora crítica"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs pt-2">
            <div className="border-l-3 border-blue-600 pl-3">
              <span className="text-slate-400 block text-[10px]">Al Día (Normal)</span>
              <span className="font-bold text-blue-950">{formatMoney(totalActiveCapital)}</span>
            </div>
            <div className="border-l-3 border-red-600 pl-3">
              <span className="text-red-700 block text-[10px] font-bold">En Mora / Riesgo Crítico</span>
              <span className="font-black text-red-700">{formatMoney(totalOverdueCapital)}</span>
            </div>
            <div className="border-l-3 border-yellow-500 pl-3">
              <span className="text-slate-400 block text-[10px]">Interés Estimado</span>
              <span className="font-bold text-amber-700">{formatMoney(totalInterest)}</span>
            </div>
          </div>
        </div>

        {/* Currency & Quick Actions (1 col) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Tipo de Cambio
            </h3>
            <span className="text-[10px] font-black bg-yellow-400 text-slate-950 px-2 py-0.5 rounded shadow-xs">
              Dólar Paralelo Activo
            </span>
          </div>
          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Paralelo Compra:</span>
              <span className="font-bold text-slate-800">
                {exchangeRate.symbol} {exchangeRate.usdBuy.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-900 font-bold">Paralelo Venta:</span>
              <span className="font-black text-blue-950 text-sm">
                {exchangeRate.symbol} {exchangeRate.usdSell.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-blue-200">
              <span>Oficial BCB Ref.:</span>
              <span className="font-semibold text-slate-600">6.96 Bs</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
              <span>Actualización:</span>
              <span className="text-slate-600 font-medium">{exchangeRate.lastUpdated}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('EXCHANGE_RATE')}
            className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
          >
            Ajustar T.C. Paralelo
          </button>
        </div>
      </div>

      {/* Quick Access Tiles to the Requested Features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('CALCULATOR')}
          className="p-4 bg-white border border-slate-200 hover:border-yellow-500 rounded-xl text-left shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-yellow-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Calculator className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">Plan Sistema Francés</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Calculadora y cotizaciones</p>
        </button>

        <button
          onClick={() => onNavigate('CONTRACTS')}
          className="p-4 bg-white border border-slate-200 hover:border-blue-500 rounded-xl text-left shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">Contratos Civiles</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Mutuo legal con garantías</p>
        </button>

        <button
          onClick={() => onNavigate('DOCUMENTS')}
          className="p-4 bg-white border border-slate-200 hover:border-blue-500 rounded-xl text-left shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">Expedientes &amp; Fotos</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Subida de DNI y garantías</p>
        </button>

        <button
          onClick={() => onNavigate('ACCOUNTING')}
          className="p-4 bg-white border border-slate-200 hover:border-yellow-500 rounded-xl text-left shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">Reportes Contables PDF</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Exportación automática</p>
        </button>
      </div>

      {/* Recent Loans Quick Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs">
            Últimos Préstamos en Cartera
          </h3>
          <button
            onClick={() => onNavigate('ACTIVE_PORTFOLIO')}
            className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
          >
            Ver todos ({loans.length})
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-4">N° Préstamo</th>
                <th className="py-2.5 px-4">Prestatario</th>
                <th className="py-2.5 px-4 text-right">Capital</th>
                <th className="py-2.5 px-4 text-right">Cuota Francesa</th>
                <th className="py-2.5 px-4 text-right">Saldo Insoluto</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
                <th className="py-2.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.slice(0, 4).map(loan => (
                <tr key={loan.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {loan.loanNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{loan.clientName}</span>
                    <span className="text-[10px] text-slate-500">{loan.clientDocument}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {formatMoney(loan.principalAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-900">
                    {formatMoney(loan.fixedInstallmentAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatMoney(loan.outstandingBalance)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        loan.status === 'ACTIVO'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : loan.status === 'VENCIDO'
                          ? 'bg-red-600 text-white font-extrabold animate-pulse shadow-xs shadow-red-500/50'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {loan.status !== 'PAGADO' ? (
                      <button
                        onClick={() => onSelectLoanForPayment(loan)}
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-yellow-300 rounded text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Cobrar
                      </button>
                    ) : (
                      <span className="text-[11px] text-blue-700 font-bold">Cancelado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
