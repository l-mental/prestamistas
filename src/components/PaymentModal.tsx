import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Download,
  CheckCircle,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Loan, Installment, PaymentReceipt } from '../types';
import { useLoanContext } from '../context/LoanContext';
import { exportPaymentReceiptPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/frenchAmortization';

interface PaymentModalProps {
  loan: Loan;
  initialInstallmentNumber?: number;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  loan,
  initialInstallmentNumber,
  onClose,
}) => {
  const { registerInstallmentPayment, companySettings, formatMoney } = useLoanContext();

  const pendingInstallments = loan.schedule.filter(s => s.status !== 'PAGADA');
  const defaultInstNumber =
    initialInstallmentNumber ||
    (pendingInstallments[0] ? pendingInstallments[0].number : 1);

  const [selectedInstNumber, setSelectedInstNumber] = useState<number>(defaultInstNumber);
  const currentInst = loan.schedule.find(s => s.number === selectedInstNumber) || loan.schedule[0];

  const totalRequired = currentInst ? currentInst.paymentAmount + currentInst.lateFee : 0;
  const [payAmount, setPayAmount] = useState<number>(totalRequired);
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE'>('EFECTIVO');
  const [refNumber, setRefNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [createdReceipt, setCreatedReceipt] = useState<PaymentReceipt | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const receipt = registerInstallmentPayment(
        loan.id,
        selectedInstNumber,
        Number(payAmount),
        paymentMethod,
        refNumber ? `Ref: ${refNumber}. ${notes}` : notes
      );
      setCreatedReceipt(receipt);
    } catch (err: any) {
      alert(err.message || 'Error al procesar el pago');
    }
  };

  const handleDownloadReceipt = () => {
    if (createdReceipt) {
      exportPaymentReceiptPDF(createdReceipt, companySettings, loan.currency);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-sm">Registro de Cobranza y Pago de Cuota</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {createdReceipt ? (
          /* Payment Success view */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-base">
                ¡Pago Registrado Exitosamente!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Comprobante Oficial N° <strong>{createdReceipt.receiptId}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Prestatario:</span>
                <span className="font-bold text-slate-800">{createdReceipt.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Préstamo:</span>
                <span className="font-bold text-slate-800">{createdReceipt.loanNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cuota Cancelada:</span>
                <span className="font-bold text-slate-800">N° {createdReceipt.installmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto Total Pagado:</span>
                <span className="font-black text-blue-900 text-sm">
                  {formatCurrency(createdReceipt.amountPaid, loan.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Nuevo Saldo Insoluto:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(createdReceipt.remainingLoanBalance, loan.currency)}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadReceipt}
                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-black flex items-center gap-2 shadow-sm shadow-yellow-500/20 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Descargar Recibo en PDF</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Loan info summary */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  {loan.loanNumber} - {loan.clientName}
                </span>
                <span className="text-[11px] text-slate-500">{loan.clientDocument}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Saldo Actual</span>
                <span className="font-bold text-slate-800">
                  {formatMoney(loan.outstandingBalance)}
                </span>
              </div>
            </div>

            {/* Installment selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cuota a Pagar:
              </label>
              <select
                value={selectedInstNumber}
                onChange={e => {
                  const num = Number(e.target.value);
                  setSelectedInstNumber(num);
                  const inst = loan.schedule.find(s => s.number === num);
                  if (inst) setPayAmount(inst.paymentAmount + inst.lateFee);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                {loan.schedule.map(inst => (
                  <option key={inst.number} value={inst.number}>
                    Cuota {inst.number} - Vence: {inst.dueDate} - {formatCurrency(inst.paymentAmount, loan.currency)} ({inst.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Overdue / Late fee alert if applicable (CRITICAL RED) */}
            {currentInst && currentInst.lateFee > 0 && (
              <div className="bg-red-50 border-2 border-red-500 p-3 rounded-lg flex items-center justify-between text-xs text-red-900 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <span className="font-extrabold block text-red-900">
                      Cuota con {currentInst.daysOverdue} días de mora (ESTADO CRÍTICO)
                    </span>
                    <span className="text-[11px] text-red-700 font-semibold">
                      Penalidad moratoria calculada: + {formatCurrency(currentInst.lateFee, loan.currency)}
                    </span>
                  </div>
                </div>
                <span className="font-black text-red-700 text-sm">
                  {formatCurrency(currentInst.paymentAmount + currentInst.lateFee, loan.currency)}
                </span>
              </div>
            )}

            {/* Amount input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Monto Recibido ($ {loan.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={payAmount}
                onChange={e => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Medio de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="EFECTIVO">Efectivo en Caja</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="TARJETA">Tarjeta Débito/Crédito</option>
                  <option value="CHEQUE">Cheque Bancario</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  N° de Operación / Ref.
                </label>
                <input
                  type="text"
                  placeholder="Ej. OP-449102"
                  value={refNumber}
                  onChange={e => setRefNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Notas Contables (Opcional)
              </label>
              <input
                type="text"
                placeholder="Observaciones de caja..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg font-black cursor-pointer shadow-sm shadow-yellow-500/20 transition-colors"
              >
                Confirmar y Emitir Recibo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
