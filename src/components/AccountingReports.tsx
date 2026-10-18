import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  DollarSign,
  TrendingUp,
  Receipt,
  PieChart,
  FileCheck,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useLoanContext } from '../context/LoanContext';
import { exportAccountingReportPDF } from '../utils/pdfGenerator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/frenchAmortization';

export const AccountingReports: React.FC = () => {
  const { loans, companySettings, formatMoney, displayCurrency } = useLoanContext();

  const [reportYear, setReportYear] = useState('2026');

  // Accounting aggregates
  const totalDisbursed = loans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalPaid = loans.reduce((acc, l) => acc + l.totalPaid, 0);
  const totalInterestProjected = loans.reduce((acc, l) => acc + l.totalInterestExpected, 0);

  // Overdue stats
  const overdueLoans = loans.filter(l => l.status === 'VENCIDO');
  const overdueCapital = overdueLoans.reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalLateFees = loans.reduce((acc, l) => {
    return acc + l.schedule.reduce((sub, s) => sub + s.lateFee, 0);
  }, 0);

  // Interest actually collected from paid installments
  let interestCollected = 0;
  let capitalCollected = 0;
  loans.forEach(loan => {
    loan.schedule.forEach(inst => {
      if (inst.status === 'PAGADA') {
        interestCollected += inst.interestAmount;
        capitalCollected += inst.principalAmount;
      }
    });
  });

  // Export Main Portfolio Ledger PDF
  const handleExportMainLedger = () => {
    exportAccountingReportPDF(loans, companySettings, displayCurrency === 'USD' ? 'USD' : 'BOB');
  };

  // Export Overdue and Provisions PDF
  const handleExportProvisionsReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(companySettings.name.toUpperCase(), 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`INFORME CONTABLE DE PROVISIÓN PARA CRÉDITOS INCOBRABLES / MORA`, 14, 26);
    doc.text(`Fecha de corte: ${new Date().toLocaleDateString('es-ES')} | Ejercicio: ${reportYear}`, 14, 31);

    const rows = overdueLoans.map(l => {
      const overdueInsts = l.schedule.filter(s => s.status === 'VENCIDA');
      const days = Math.max(...overdueInsts.map(s => s.daysOverdue), 0);
      const provisionRate = days > 90 ? 100 : days > 60 ? 50 : days > 30 ? 25 : 10;
      const provisionAmount = (l.outstandingBalance * provisionRate) / 100;

      return [
        l.loanNumber,
        l.clientName,
        formatCurrency(l.outstandingBalance, l.currency),
        `${days} días`,
        `${provisionRate}%`,
        formatCurrency(provisionAmount, l.currency),
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['N° Préstamo', 'Prestatario', 'Saldo Insoluto', 'Días Mora', '% Provisión', 'Gasto Provisión']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [220, 38, 38],
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
      },
    });

    doc.save(`Informe_Provision_Morosidad_${reportYear}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 rounded-xl shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4 text-yellow-400" />
            Módulo de Contabilidad y Tributación
          </div>
          <h2 className="text-xl font-bold">Reportes Contables Automatizados en PDF</h2>
          <p className="text-blue-100/80 text-xs mt-1 max-w-xl">
            Genera de manera automática los libros de colocaciones, ingresos devengados por sistema francés, cobros de mora y provisiones para auditorías contables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMainLedger}
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-black shadow-md shadow-yellow-500/20 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Descargar Libro Contable (PDF)</span>
          </button>
        </div>
      </div>

      {/* Accounting KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block">
            Capital Colocado (Activo)
          </span>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatMoney(totalDisbursed)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Colocación bruta de cartera
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block">
            Interés Devengado Realizado
          </span>
          <div className="text-xl font-black text-blue-900 mt-2">
            {formatMoney(interestCollected)}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-semibold">
            Ingresos financieros cobrados
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block">
            Saldo Insoluto por Cobrar
          </span>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatMoney(totalOutstanding)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Capital en manos de clientes
          </div>
        </div>

        <div className="bg-red-50 p-5 rounded-xl border-2 border-red-300 shadow-xs">
          <span className="text-xs font-black text-red-900 uppercase block">
            Mora y Penalidades Críticas
          </span>
          <div className="text-xl font-black text-red-700 mt-2">
            {formatMoney(totalLateFees)}
          </div>
          <div className="text-[11px] text-red-700 mt-1 font-bold">
            Ingresos por recargos
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Libro General de Cartera */}
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Libro de Cartera y Amortizaciones
              </h3>
              <p className="text-xs text-slate-500">
                Detalle por crédito, fecha de desembolso, amortización francesa y saldos.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Créditos incluidos:</span>
              <span className="font-bold text-slate-800">{loans.length} créditos</span>
            </div>
            <div className="flex justify-between">
              <span>Frecuencia:</span>
              <span className="font-semibold text-slate-700">Mensual, Quincenal, Semanal</span>
            </div>
            <div className="flex justify-between">
              <span>Formato de salida:</span>
              <span className="font-bold text-blue-900">PDF Oficial Horizontal</span>
            </div>
          </div>

          <button
            onClick={handleExportMainLedger}
            className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-yellow-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-yellow-400/30 shadow-sm"
          >
            <Download className="w-4 h-4 text-yellow-400" />
            <span>Generar y Descargar PDF</span>
          </button>
        </div>

        {/* Card 2: Provisión de Cobranza Dudosa (CRITICAL RED) */}
        <div className="bg-red-50/50 p-6 rounded-xl border-2 border-red-500 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-red-950 text-sm flex items-center gap-1.5">
                Provisión Contable de Cartera Vencida
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase">
                  Crítico
                </span>
              </h3>
              <p className="text-xs text-red-800">
                Estimación de cuentas incobrables según días de mora (NIC / NIIF 9).
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-red-200 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Créditos en Mora Crítica:</span>
              <span className="font-black text-red-700">{overdueLoans.length} casos</span>
            </div>
            <div className="flex justify-between">
              <span>Capital en Riesgo:</span>
              <span className="font-black text-red-800">{formatMoney(overdueCapital)}</span>
            </div>
            <div className="flex justify-between">
              <span>Formato de salida:</span>
              <span className="font-bold text-red-700">PDF con porcentaje de provisión</span>
            </div>
          </div>

          <button
            onClick={handleExportProvisionsReport}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-red-500/20"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Generar Informe de Morosidad PDF</span>
          </button>
        </div>
      </div>

      {/* Accounting Journal Entry Sample (Asiento Tipo para el Contador) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileCheck className="w-4 h-4 text-blue-700" />
          Plantilla de Asientos Contables para Registro en Software Contable (Concar / Siscont / SAP)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Asiento 1 */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <span className="font-bold text-slate-800 block text-[11px] mb-1">
              Asiento 1: Por el Desembolso de Créditos
            </span>
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-1">Cuenta Contable</th>
                  <th className="py-1 text-right">Debe</th>
                  <th className="py-1 text-right">Haber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-1">1412 Cuentas por Cobrar - Mutuo</td>
                  <td className="py-1 text-right font-bold text-slate-800">{formatMoney(totalDisbursed)}</td>
                  <td className="py-1 text-right">-</td>
                </tr>
                <tr>
                  <td className="py-1">1041 Cuentas Corrientes Bancarias</td>
                  <td className="py-1 text-right">-</td>
                  <td className="py-1 text-right font-bold text-slate-800">{formatMoney(totalDisbursed)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Asiento 2 */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <span className="font-bold text-slate-800 block text-[11px] mb-1">
              Asiento 2: Por el Cobro de Cuota Francesa
            </span>
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-1">Cuenta Contable</th>
                  <th className="py-1 text-right">Debe</th>
                  <th className="py-1 text-right">Haber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-1">1011 Caja / Recaudación en Ventanilla</td>
                  <td className="py-1 text-right font-bold text-slate-800">{formatMoney(totalPaid)}</td>
                  <td className="py-1 text-right">-</td>
                </tr>
                <tr>
                  <td className="py-1">1412 Amortización de Principal</td>
                  <td className="py-1 text-right">-</td>
                  <td className="py-1 text-right font-bold text-slate-800">{formatMoney(capitalCollected)}</td>
                </tr>
                <tr>
                  <td className="py-1">7721 Ingresos Financieros - Interés Francés</td>
                  <td className="py-1 text-right">-</td>
                  <td className="py-1 text-right font-black text-blue-900">{formatMoney(interestCollected)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
