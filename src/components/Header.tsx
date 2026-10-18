import React from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  PlusCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { useLoanContext } from '../context/LoanContext';
import { NavView } from './Sidebar';
import { exportAccountingReportPDF } from '../utils/pdfGenerator';

interface HeaderProps {
  currentView: NavView;
  onOpenNewLoanModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onOpenNewLoanModal }) => {
  const {
    companySettings,
    displayCurrency,
    setDisplayCurrency,
    exchangeRate,
    loans,
  } = useLoanContext();

  const getTitle = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return 'Panel de Control y Resumen General';
      case 'CALCULATOR':
        return 'Calculadora y Cotizador de Préstamos (Sistema Francés)';
      case 'ACTIVE_PORTFOLIO':
        return 'Cartera Activa de Préstamos';
      case 'PENDING_PAYMENTS':
        return 'Créditos y Cuotas por Pagar';
      case 'OVERDUE_LOANS':
        return 'Gestión de Créditos Vencidos y Mora';
      case 'CONTRACTS':
        return 'Contratos Civiles de Mutuo y Garantía';
      case 'DOCUMENTS':
        return 'Expedientes Digitales, Imágenes y Documentos (KYC)';
      case 'ACCOUNTING':
        return 'Gestión Contable y Reportes Automatizados en PDF';
      case 'EXCHANGE_RATE':
        return 'Administración de Tipo de Cambio y Divisas';
      default:
        return 'CrediPlus';
    }
  };

  const handleQuickPdf = () => {
    exportAccountingReportPDF(loans, companySettings, displayCurrency === 'USD' ? 'USD' : 'BOB');
  };

  const todayStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Title & Date */}
      <div>
        <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none">
          {getTitle()}
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 capitalize">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {todayStr}
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            {companySettings.name}
          </span>
        </div>
      </div>

      {/* Right controls: Currency Toggle, PDF, New Loan */}
      <div className="flex items-center gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setDisplayCurrency('USD')}
            className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
              displayCurrency === 'USD'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            $ USD
          </button>
          <button
            onClick={() => setDisplayCurrency('LOCAL')}
            className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              displayCurrency === 'LOCAL'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{exchangeRate.symbol} Bolivianos</span>
            <span className="text-[10px] font-black bg-yellow-400 text-slate-950 px-1.5 py-0.2 rounded shadow-xs">
              T.C. Paralelo {exchangeRate.usdSell.toFixed(2)}
            </span>
          </button>
        </div>

        {/* Quick Accounting PDF Export */}
        <button
          onClick={handleQuickPdf}
          title="Descargar Reporte Contable en PDF"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50/70 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-700" />
          <span>Reporte PDF</span>
        </button>

        {/* New Loan Button */}
        <button
          onClick={onOpenNewLoanModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-colors shadow-sm shadow-yellow-500/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Crear Préstamo</span>
        </button>
      </div>
    </header>
  );
};
