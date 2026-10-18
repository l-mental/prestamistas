import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  DollarSign,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
  CreditCard,
  User,
  ArrowUpRight,
} from 'lucide-react';
import { Loan, Installment } from '../types';
import { useLoanContext } from '../context/LoanContext';
import { exportAmortizationSchedulePDF, exportCivilContractPDF } from '../utils/pdfGenerator';

interface ActivePortfolioProps {
  onSelectLoanForPayment: (loan: Loan, installmentNumber?: number) => void;
  onViewContract: (loan: Loan) => void;
  onViewClientDocs: (clientId: string) => void;
}

export const ActivePortfolio: React.FC<ActivePortfolioProps> = ({
  onSelectLoanForPayment,
  onViewContract,
  onViewClientDocs,
}) => {
  const { loans, clients, companySettings, formatMoney } = useLoanContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'VENCIDO' | 'PAGADO'>('TODOS');
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<Loan | null>(null);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch =
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientDocument.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeLoans = loans.filter(l => l.status === 'ACTIVO');
  const totalActiveCapital = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalPrincipalPlaced = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalCollected = loans.reduce((sum, l) => sum + l.totalPaid, 0);

  const handleExportPDF = (loan: Loan) => {
    const client = clients.find(c => c.id === loan.clientId) || clients[0];
    exportAmortizationSchedulePDF(loan, client, companySettings);
  };

  const handleExportContractPDF = (loan: Loan) => {
    const client = clients.find(c => c.id === loan.clientId) || clients[0];
    exportCivilContractPDF(loan, client, companySettings);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Capital Activo Colocado
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-950 mt-2">
            {formatMoney(totalActiveCapital)}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-semibold">
            En {activeLoans.length} créditos vigentes en cartera
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-yellow-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Total Capital Histórico
            </span>
            <div className="w-8 h-8 rounded-lg bg-yellow-100 text-amber-800 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatMoney(totalPrincipalPlaced)}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            {loans.length} colocaciones totales registradas
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Recuperación Total (Cobrado)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-yellow-300 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2">
            {formatMoney(totalCollected)}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Capital e intereses amortizados
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente, N° préstamo o documento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Estado:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['TODOS', 'ACTIVO', 'VENCIDO', 'PAGADO'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? status === 'VENCIDO'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'TODOS' ? 'Todos' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Préstamo</th>
                <th className="py-3 px-4">Prestatario</th>
                <th className="py-3 px-4 text-right">Capital Inicial</th>
                <th className="py-3 px-4 text-right">Cuota Francesa</th>
                <th className="py-3 px-4">Progreso de Pago</th>
                <th className="py-3 px-4 text-right">Saldo Insoluto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron créditos con los criterios especificados.
                  </td>
                </tr>
              ) : (
                filteredLoans.map(loan => {
                  const paidPercent =
                    loan.totalAmountExpected > 0
                      ? Math.min(100, Math.round((loan.totalPaid / loan.totalAmountExpected) * 100))
                      : 0;

                  // Next pending installment
                  const nextInstallment = loan.schedule.find(s => s.status !== 'PAGADA');

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{loan.loanNumber}</div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {loan.startDate} ({loan.frequency})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{loan.clientName}</div>
                        <div className="text-[10px] text-slate-500">{loan.clientDocument}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatMoney(loan.principalAmount)}
                        <span className="text-[10px] text-slate-400 block">
                          Tasa: {loan.monthlyInterestRate}% m.
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-blue-900">
                        {formatMoney(loan.fixedInstallmentAmount)}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          {loan.totalInstallments} cuotas
                        </span>
                      </td>

                      <td className="py-3.5 px-4 min-w-36">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>{paidPercent}% amortizado</span>
                          <span className="font-semibold text-slate-700">
                            {formatMoney(loan.totalPaid)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              paidPercent === 100
                                ? 'bg-blue-600'
                                : paidPercent > 50
                                ? 'bg-yellow-500'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatMoney(loan.outstandingBalance)}
                        {nextInstallment && (
                          <span className="text-[10px] text-slate-500 font-normal block">
                            Vence: {nextInstallment.dueDate}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
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

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Payment Button */}
                          {loan.status !== 'PAGADO' && (
                            <button
                              onClick={() => onSelectLoanForPayment(loan)}
                              className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-yellow-300 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                              title="Registrar Cobranza"
                            >
                              <CreditCard className="w-3 h-3 text-yellow-300" />
                              <span>Cobrar</span>
                            </button>
                          )}

                          {/* View Schedule Modal */}
                          <button
                            onClick={() => setSelectedLoanForSchedule(loan)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Ver Cronograma Francés"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* View Contract */}
                          <button
                            onClick={() => onViewContract(loan)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Ver Contrato Civil"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* View Docs */}
                          <button
                            onClick={() => onViewClientDocs(loan.clientId)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Expediente KYC y Fotos"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>

                          {/* Export PDF */}
                          <button
                            onClick={() => handleExportPDF(loan)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Descargar Cronograma PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Loan Schedule */}
      {selectedLoanForSchedule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Cronograma Francés: {selectedLoanForSchedule.loanNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Prestatario: {selectedLoanForSchedule.clientName} ({selectedLoanForSchedule.clientDocument})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPDF(selectedLoanForSchedule)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => setSelectedLoanForSchedule(null)}
                  className="text-slate-400 hover:text-white px-2 py-1 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-3 mb-4 bg-slate-50 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Capital</span>
                  <span className="font-bold text-slate-800">
                    {formatMoney(selectedLoanForSchedule.principalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tasa Mensual</span>
                  <span className="font-bold text-slate-800">
                    {selectedLoanForSchedule.monthlyInterestRate}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cuota Fija</span>
                  <span className="font-bold text-blue-900">
                    {formatMoney(selectedLoanForSchedule.fixedInstallmentAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Saldo Restante</span>
                  <span className="font-bold text-slate-900">
                    {formatMoney(selectedLoanForSchedule.outstandingBalance)}
                  </span>
                </div>
              </div>

              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3 text-center">N°</th>
                    <th className="py-2 px-3">Vencimiento</th>
                    <th className="py-2 px-3 text-right">Cuota Fija</th>
                    <th className="py-2 px-3 text-right">Capital</th>
                    <th className="py-2 px-3 text-right">Interés</th>
                    <th className="py-2 px-3 text-right">Saldo Restante</th>
                    <th className="py-2 px-3 text-center">Estado</th>
                    <th className="py-2 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedLoanForSchedule.schedule.map((item: Installment) => (
                    <tr
                      key={item.number}
                      className={`hover:bg-slate-50 ${
                        item.status === 'VENCIDA' ? 'bg-red-50/70 font-semibold' : item.status === 'PAGADA' ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-bold text-slate-600">
                        {item.number}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800">{item.dueDate}</td>
                      <td className="py-2 px-3 text-right font-black text-blue-900">
                        {formatMoney(item.paymentAmount)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">
                        {formatMoney(item.principalAmount)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {formatMoney(item.interestAmount)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-800">
                        {formatMoney(item.remainingBalance)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'PAGADA'
                              ? 'bg-blue-100 text-blue-900'
                              : item.status === 'VENCIDA'
                              ? 'bg-red-600 text-white font-black animate-pulse'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.status}
                          {item.daysOverdue > 0 && ` (${item.daysOverdue}d)`}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.status !== 'PAGADA' && (
                          <button
                            onClick={() => {
                              setSelectedLoanForSchedule(null);
                              onSelectLoanForPayment(selectedLoanForSchedule, item.number);
                            }}
                            className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-yellow-300 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Pagar
                          </button>
                        )}
                        {item.status === 'PAGADA' && item.paymentReceiptNumber && (
                          <span className="text-[10px] text-slate-400">
                            {item.paymentReceiptNumber}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
