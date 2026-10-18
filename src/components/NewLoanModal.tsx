import React, { useState } from 'react';
import {
  PlusCircle,
  Calculator,
  User,
  Shield,
  FileText,
  X,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { Loan, PaymentFrequency } from '../types';
import { useLoanContext } from '../context/LoanContext';
import { generateFrenchSchedule } from '../utils/frenchAmortization';

interface NewLoanModalProps {
  initialValues?: {
    principal?: number;
    monthlyRate?: number;
    termPeriods?: number;
    frequency?: PaymentFrequency;
    startDate?: string;
  };
  onClose: () => void;
  onSuccess: (newLoan: Loan) => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  initialValues,
  onClose,
  onSuccess,
}) => {
  const { clients, addLoan, exchangeRate } = useLoanContext();

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [principal, setPrincipal] = useState<number>(initialValues?.principal || 3000);
  const [currency, setCurrency] = useState<'BOB' | 'USD' | 'PEN' | 'MXN' | 'EUR'>('BOB');
  const [monthlyRate, setMonthlyRate] = useState<number>(initialValues?.monthlyRate || 3.5);
  const [termPeriods, setTermPeriods] = useState<number>(initialValues?.termPeriods || 6);
  const [frequency, setFrequency] = useState<PaymentFrequency>(initialValues?.frequency || 'MENSUAL');
  const [startDate, setStartDate] = useState<string>(
    initialValues?.startDate || new Date().toISOString().slice(0, 10)
  );
  const [insuranceFee, setInsuranceFee] = useState<number>(10);
  const [collateralDesc, setCollateralDesc] = useState<string>('Pagaré a la orden y fianza solidaria');
  const [collateralValue, setCollateralValue] = useState<number>(4500);
  const [notes, setNotes] = useState<string>('Crédito otorgado bajo evaluación de riesgo aprobada.');

  // Live French Calculation
  const schedule = generateFrenchSchedule({
    principal: principal || 1,
    monthlyInterestRatePercent: monthlyRate || 0,
    termPeriods: termPeriods || 1,
    frequency,
    startDate,
    insuranceOrMonthlyFee: insuranceFee,
  });

  const fixedInstallment = schedule[0]?.paymentAmount || 0;
  const totalAmountExpected = schedule.reduce((sum, s) => sum + s.paymentAmount, 0);
  const totalInterestExpected = Math.round((totalAmountExpected - principal - (insuranceFee * termPeriods)) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId) || clients[0];
    if (!client) return;

    const loanNumber = `PRE-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      loanNumber,
      clientId: client.id,
      clientName: client.fullName,
      clientDocument: `${client.documentType} ${client.documentNumber}`,
      principalAmount: principal,
      currency,
      annualInterestRate: Math.round(monthlyRate * 12 * 10) / 10,
      monthlyInterestRate: monthlyRate,
      termMonths: termPeriods,
      frequency,
      totalInstallments: termPeriods,
      fixedInstallmentAmount: fixedInstallment,
      startDate,
      status: 'ACTIVO',
      collateralDescription: collateralDesc,
      collateralEstimatedValue: collateralValue,
      schedule,
      documents: client.documents,
      notes,
      totalInterestExpected,
      totalAmountExpected,
      totalPaid: 0,
      outstandingBalance: principal,
    };

    addLoan(newLoan);
    onSuccess(newLoan);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-sm">
              Crear Nuevo Préstamo (Sistema de Amortización Francés)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Client Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-700" />
              Prestatario / Cliente
            </label>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-semibold text-slate-900"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} - {c.documentType}: {c.documentNumber} ({c.occupation})
                </option>
              ))}
            </select>
          </div>

          {/* Financial Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Monto Capital
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={principal}
                  onChange={e => setPrincipal(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>
              <span className="text-[10px] text-blue-900 font-semibold block mt-1">
                {currency === 'BOB'
                  ? `≈ $ ${(principal / exchangeRate.usdSell).toFixed(2)} USD (T.C. Paralelo ${exchangeRate.usdSell.toFixed(2)})`
                  : `≈ Bs ${(principal * exchangeRate.usdSell).toFixed(2)} (T.C. Paralelo ${exchangeRate.usdSell.toFixed(2)})`}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="BOB">BOB (Bs Boliviano)</option>
                <option value="USD">USD ($ Dólar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="PEN">PEN (S/ Sol)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tasa Mensual (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={monthlyRate}
                onChange={e => setMonthlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Número de Cuotas
              </label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={termPeriods}
                onChange={e => setTermPeriods(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Frecuencia de Pago
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as PaymentFrequency)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="MENSUAL">Mensual</option>
                <option value="QUINCENAL">Quincenal</option>
                <option value="SEMANAL">Semanal</option>
                <option value="DIARIO">Diario</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fecha Desembolso
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Guarantee / Collateral */}
          <div className="border-t border-slate-200 pt-3 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase">
              <Shield className="w-4 h-4 text-blue-700" />
              Garantía Registrada para el Contrato Civil
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Descripción del Bien o Fianza
                </label>
                <input
                  type="text"
                  value={collateralDesc}
                  onChange={e => setCollateralDesc(e.target.value)}
                  placeholder="Ej. Vehículo Toyota Yaris 2018 o Joya de Oro 18k"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Valor Estimado ($)
                </label>
                <input
                  type="number"
                  value={collateralValue}
                  onChange={e => setCollateralValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* French Amortization Instant Summary Card */}
          <div className="bg-yellow-50/80 border-2 border-yellow-400 rounded-xl p-4 text-xs shadow-xs">
            <div className="flex items-center justify-between font-bold text-amber-950 border-b border-yellow-300 pb-2 mb-2">
              <span className="flex items-center gap-1 font-extrabold">
                <Calculator className="w-4 h-4 text-blue-800" />
                Cálculo de Cuota Francesa:
              </span>
              <span className="text-base text-blue-950 font-black">
                {termPeriods} Cuotas de $ {fixedInstallment.toFixed(2)} ({frequency})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-amber-950">
              <div>
                <span className="text-amber-800 font-semibold">Capital Solicitado:</span>
                <span className="font-bold block text-slate-900">$ {principal.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-amber-800 font-semibold">Interés Total Devengado:</span>
                <span className="font-bold block text-blue-900">$ {totalInterestExpected.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-amber-800 font-semibold">Total a Retornar:</span>
                <span className="font-black block text-slate-950">$ {totalAmountExpected.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Notas Adicionales
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg font-black cursor-pointer shadow-sm shadow-yellow-500/20 flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Desembolsar y Generar Contrato</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
