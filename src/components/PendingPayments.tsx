import React, { useState } from 'react';
import {
  CalendarClock,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Phone,
  MessageCircle,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Loan, Installment } from '../types';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency } from '../utils/frenchAmortization';

interface PendingPaymentsProps {
  onSelectLoanForPayment: (loan: Loan, installmentNumber?: number) => void;
}

export const PendingPayments: React.FC<PendingPaymentsProps> = ({ onSelectLoanForPayment }) => {
  const { loans, formatMoney, clients } = useLoanContext();

  const [dateFilter, setDateFilter] = useState<'HOY' | 'SEMANA' | 'MES' | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // Next 7 days
  const next7Days = new Date();
  next7Days.setDate(now.getDate() + 7);
  const next7DaysStr = next7Days.toISOString().slice(0, 10);

  // End of month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endOfMonthStr = endOfMonth.toISOString().slice(0, 10);

  // Flatten all pending installments
  const pendingItems: Array<{ loan: Loan; installment: Installment }> = [];
  loans.forEach(loan => {
    if (loan.status === 'PAGADO') return;
    loan.schedule.forEach(inst => {
      if (inst.status === 'PENDIENTE' || inst.status === 'PARCIAL') {
        pendingItems.push({ loan, installment: inst });
      }
    });
  });

  // Sort by dueDate ascending
  pendingItems.sort((a, b) => a.installment.dueDate.localeCompare(b.installment.dueDate));

  const filteredItems = pendingItems.filter(item => {
    const { loan, installment } = item;
    const matchesSearch =
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientDocument.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateFilter === 'HOY') {
      matchesDate = installment.dueDate === todayStr;
    } else if (dateFilter === 'SEMANA') {
      matchesDate = installment.dueDate <= next7DaysStr;
    } else if (dateFilter === 'MES') {
      matchesDate = installment.dueDate <= endOfMonthStr;
    }

    return matchesSearch && matchesDate;
  });

  const totalExpectedAmount = filteredItems.reduce(
    (sum, item) => sum + item.installment.paymentAmount,
    0
  );

  const handleWhatsAppReminder = (item: { loan: Loan; installment: Installment }) => {
    const client = clients.find(c => c.id === item.loan.clientId);
    const phone = client?.phone.replace(/[^0-9]/g, '') || '';
    const text = encodeURIComponent(
      `Hola ${item.loan.clientName}, le recordamos desde CrediPlus que su cuota N° ${item.installment.number} del crédito ${item.loan.loanNumber} por un monto de ${formatCurrency(item.installment.paymentAmount, item.loan.currency)} vence el ${item.installment.dueDate}. Por favor confirme su canal de pago. ¡Muchas gracias!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block">
            Cuotas por Cobrar (Filtro Actual)
          </span>
          <div className="text-2xl font-black text-blue-950 mt-2">
            {formatMoney(totalExpectedAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            En {filteredItems.length} cuotas programadas
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-yellow-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block">
            Vencimientos de Esta Semana
          </span>
          <div className="text-2xl font-black text-amber-800 mt-2">
            {pendingItems.filter(i => i.installment.dueDate <= next7DaysStr).length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            Programadas para ingreso inmediato
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block">
            Vencimientos del Mes
          </span>
          <div className="text-2xl font-black text-blue-900 mt-2">
            {pendingItems.filter(i => i.installment.dueDate <= endOfMonthStr).length}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Proyección de flujo de caja mensual
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente o N° de préstamo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Plazo:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['TODOS', 'HOY', 'SEMANA', 'MES'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  dateFilter === f
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f === 'TODOS'
                  ? 'Todas'
                  : f === 'HOY'
                  ? 'Hoy'
                  : f === 'SEMANA'
                  ? 'Próx. 7 Días'
                  : 'Este Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Installments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha Vencimiento</th>
                <th className="py-3 px-4">N° Préstamo</th>
                <th className="py-3 px-4">Prestatario</th>
                <th className="py-3 px-4 text-center">Cuota N°</th>
                <th className="py-3 px-4 text-right">Capital</th>
                <th className="py-3 px-4 text-right">Interés</th>
                <th className="py-3 px-4 text-right">Monto Cuota</th>
                <th className="py-3 px-4 text-right">Acción de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No hay cuotas pendientes para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ loan, installment }, idx) => {
                  const isToday = installment.dueDate === todayStr;
                  const isUpcomingClose = installment.dueDate <= next7DaysStr;

                  return (
                    <tr
                      key={`${loan.id}-${installment.number}-${idx}`}
                      className={`hover:bg-slate-50 transition-colors ${
                        isToday ? 'bg-yellow-50/70 border-l-4 border-yellow-400 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold">
                        <div className="flex items-center gap-1.5">
                          {isToday ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping" />
                          ) : isUpcomingClose ? (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          ) : null}
                          <span
                            className={
                              isToday
                                ? 'text-amber-900 font-black'
                                : 'text-slate-800'
                            }
                          >
                            {installment.dueDate}
                          </span>
                        </div>
                        {isToday && (
                          <span className="text-[10px] text-amber-800 font-extrabold uppercase">
                            ¡VENCE HOY!
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {loan.loanNumber}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {loan.frequency}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{loan.clientName}</div>
                        <div className="text-[10px] text-slate-500">{loan.clientDocument}</div>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        Cuota {installment.number} / {loan.totalInstallments}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatMoney(installment.principalAmount)}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500">
                        {formatMoney(installment.interestAmount)}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-blue-900 text-sm">
                        {formatMoney(installment.paymentAmount)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleWhatsAppReminder({ loan, installment })}
                            className="p-1.5 text-amber-900 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 rounded-md transition-colors cursor-pointer"
                            title="Enviar Recordatorio por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-amber-800" />
                          </button>

                          <button
                            onClick={() => onSelectLoanForPayment(loan, installment.number)}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-yellow-300 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Cobrar Cuota</span>
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
    </div>
  );
};
