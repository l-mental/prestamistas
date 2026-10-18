import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  DollarSign,
  Copy,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { PaymentFrequency } from '../types';
import { generateFrenchSchedule, getPeriodicRate, formatCurrency } from '../utils/frenchAmortization';
import { exportAmortizationSchedulePDF } from '../utils/pdfGenerator';
import { useLoanContext } from '../context/LoanContext';

interface FrenchCalculatorProps {
  onConvertToLoan?: (initialParams: {
    principal: number;
    monthlyRate: number;
    termPeriods: number;
    frequency: PaymentFrequency;
    fixedInstallment: number;
    startDate: string;
    clientName?: string;
  }) => void;
}

export const FrenchCalculator: React.FC<FrenchCalculatorProps> = ({ onConvertToLoan }) => {
  const { companySettings, clients, exchangeRate } = useLoanContext();

  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');
  const [principal, setPrincipal] = useState<number>(20000);
  const [monthlyRate, setMonthlyRate] = useState<number>(3.5);
  const [termPeriods, setTermPeriods] = useState<number>(6);
  const [frequency, setFrequency] = useState<PaymentFrequency>('MENSUAL');
  const [insuranceFee, setInsuranceFee] = useState<number>(50);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [clientName, setClientName] = useState<string>('Prospecto / Cliente Cotizado');
  const [copied, setCopied] = useState<boolean>(false);

  const curSym = currency === 'BOB' ? 'Bs' : '$';

  // Generate schedule
  const schedule = useMemo(() => {
    return generateFrenchSchedule({
      principal: principal || 1,
      monthlyInterestRatePercent: monthlyRate || 0,
      termPeriods: termPeriods || 1,
      frequency,
      startDate,
      insuranceOrMonthlyFee: insuranceFee,
    });
  }, [principal, monthlyRate, termPeriods, frequency, startDate, insuranceFee]);

  const fixedInstallment = schedule.length > 0 ? schedule[0].paymentAmount : 0;
  const totalPayable = schedule.reduce((sum, item) => sum + item.paymentAmount, 0);
  const totalInterest = Math.round((totalPayable - principal - (insuranceFee * termPeriods)) * 100) / 100;
  
  // Estimated TEA (Tasa Efectiva Anual) from monthly rate
  const teaEstimate = Math.round((Math.pow(1 + monthlyRate / 100, 12) - 1) * 1000) / 10;

  const handleExportPDF = () => {
    const dummyClient = clients[0] || {
      id: 'quote-client',
      fullName: clientName,
      documentType: 'CI',
      documentNumber: '0000000',
      address: 'Dirección del Prestatario',
      phone: '-',
      email: '-',
      city: 'La Paz',
      occupation: 'Independiente',
      monthlyIncome: 0,
      documents: [],
    };

    const dummyLoan = {
      id: 'quote-temp',
      loanNumber: `COTIZACION-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: dummyClient.id,
      clientName: dummyClient.fullName,
      clientDocument: `${dummyClient.documentType} ${dummyClient.documentNumber}`,
      principalAmount: principal,
      currency,
      annualInterestRate: teaEstimate,
      monthlyInterestRate: monthlyRate,
      termMonths: termPeriods,
      frequency,
      totalInstallments: termPeriods,
      fixedInstallmentAmount: fixedInstallment,
      startDate,
      status: 'ACTIVO' as const,
      schedule,
      documents: [],
      totalInterestExpected: totalInterest,
      totalAmountExpected: totalPayable,
      totalPaid: 0,
      outstandingBalance: principal,
    };

    exportAmortizationSchedulePDF(dummyLoan, dummyClient, companySettings);
  };

  const handleCopyQuote = () => {
    const parallelEquivText = currency === 'BOB'
      ? `($ ${(principal / exchangeRate.usdSell).toFixed(2)} USD al T.C. Paralelo ${exchangeRate.usdSell.toFixed(2)} Bs)`
      : `(Bs ${(principal * exchangeRate.usdSell).toFixed(2)} al T.C. Paralelo ${exchangeRate.usdSell.toFixed(2)} Bs)`;

    const text = `*COTIZACIÓN DE CRÉDITO - SISTEMA FRANCÉS*\n` +
      `📌 *Cliente:* ${clientName}\n` +
      `💰 *Monto Solicitado:* ${curSym} ${principal.toFixed(2)} (${currency === 'BOB' ? 'Bolivianos' : 'Dólares'}) ${parallelEquivText}\n` +
      `📅 *Plazo:* ${termPeriods} cuotas (${frequency})\n` +
      `📈 *Tasa Mensual:* ${monthlyRate}%\n` +
      `✅ *Cuota Fija Periódica:* ${curSym} ${fixedInstallment.toFixed(2)}\n` +
      `💵 *Total a Pagar:* ${curSym} ${totalPayable.toFixed(2)}\n` +
      `💱 *T.C. Paralelo Aplicado:* ${exchangeRate.usdSell.toFixed(2)} Bs/USD\n` +
      `🏦 *Entidad:* ${companySettings.name}\n` +
      `Generado en el Sistema de Préstamos Bolivia.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateLoanClick = () => {
    if (onConvertToLoan) {
      onConvertToLoan({
        principal,
        monthlyRate,
        termPeriods,
        frequency,
        fixedInstallment,
        startDate,
        clientName,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4 text-yellow-400" />
              Simulador Financiero Oficial
            </div>
            <h2 className="text-xl font-bold">Plan de Pagos en Sistema Francés</h2>
            <p className="text-blue-100/80 text-sm mt-1 max-w-2xl">
              Cálculo con cuotas periódicas fijas y constantes. En el sistema francés el interés decrece gradualmente mientras la amortización a capital se incrementa con cada pago.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuote}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-800/80 hover:bg-blue-700 text-yellow-300 rounded-lg border border-yellow-400/30 transition-colors cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-yellow-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar Resumen'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg shadow-sm shadow-yellow-500/20 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Inputs & Key KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs Column */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            Parámetros del Crédito
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre / Prospecto
            </label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Ej. Roberto Mendoza"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold bg-white"
              >
                <option value="BOB">Bs (Boliviano)</option>
                <option value="USD">$ (Dólar)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monto Capital ({curSym})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">{curSym}</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={principal}
                  onChange={e => setPrincipal(Number(e.target.value))}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
                />
              </div>
              <div className="text-[10px] text-blue-900 font-semibold mt-1 flex items-center justify-between">
                <span>
                  {currency === 'BOB'
                    ? `≈ $ ${(principal / exchangeRate.usdSell).toFixed(2)} USD`
                    : `≈ Bs ${(principal * exchangeRate.usdSell).toFixed(2)} BOB`}
                </span>
                <span className="text-slate-500 text-[9px]">
                  T.C. Paralelo: {exchangeRate.usdSell.toFixed(2)} Bs
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tasa Mensual (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={monthlyRate}
                  onChange={e => setMonthlyRate(Number(e.target.value))}
                  className="w-full text-xs pr-7 pl-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                N° de Cuotas
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={termPeriods}
                onChange={e => setTermPeriods(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Frecuencia
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as PaymentFrequency)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-semibold"
              >
                <option value="MENSUAL">Mensual</option>
                <option value="QUINCENAL">Quincenal</option>
                <option value="SEMANAL">Semanal</option>
                <option value="DIARIO">Diario</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gasto Adm / Seguro ($)
              </label>
              <input
                type="number"
                min="0"
                value={insuranceFee}
                onChange={e => setInsuranceFee(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha de Inicio / Desembolso
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleCreateLoanClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-yellow-300 rounded-lg text-xs font-bold border border-yellow-400/30 transition-colors cursor-pointer shadow-sm"
            >
              <span>Convertir en Préstamo Real</span>
              <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
            </button>
          </div>
        </div>

        {/* Results Cards (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-black text-amber-900 block uppercase">
                Cuota Fija ({frequency})
              </span>
              <span className="text-xl font-black text-slate-950 mt-1 block">
                {curSym} {fixedInstallment.toFixed(2)}
              </span>
              <span className="text-[10px] text-amber-800 mt-1 block font-semibold">
                Constante por cuota ({currency})
              </span>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-blue-900 block uppercase">
                Total Interés
              </span>
              <span className="text-xl font-black text-blue-950 mt-1 block">
                {curSym} {totalInterest.toFixed(2)}
              </span>
              <span className="text-[10px] text-blue-700 mt-1 block font-semibold">
                Ganancia financiera
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-700 block uppercase">
                Total a Pagar
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {curSym} {totalPayable.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Capital + Interés + Adm.
              </span>
            </div>

            <div className="bg-blue-950 border border-blue-800 rounded-xl p-4 shadow-xs text-white">
              <span className="text-[11px] font-bold text-yellow-300 block uppercase">
                TEA Estimada
              </span>
              <span className="text-xl font-black text-yellow-400 mt-1 block">
                {teaEstimate}%
              </span>
              <span className="text-[10px] text-blue-200 mt-1 block">
                Tasa Efectiva Anual
              </span>
            </div>
          </div>

          {/* Visual Formula Explaination Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-black">
                Fr
              </div>
              <div>
                <p className="font-bold text-blue-950">
                  Fórmula Sistema Francés: R = P · [ i / (1 - (1+i)^-n) ]
                </p>
                <p className="text-[11px] text-slate-500">
                  Amortización progresiva: Cuota = Capital + Interés sobre saldo deudor.
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-blue-900">
                {termPeriods} Cuotas de {curSym} {fixedInstallment.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Schedule Table preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Cronograma Proyectado de Cuotas ({currency})
              </h4>
              <span className="text-[11px] text-slate-500 font-semibold">
                {schedule.length} períodos generados
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-center">N°</th>
                    <th className="py-2 px-3">Fec. Vencimiento</th>
                    <th className="py-2 px-3 text-right">Cuota Fija</th>
                    <th className="py-2 px-3 text-right">Amort. Capital</th>
                    <th className="py-2 px-3 text-right">Interés</th>
                    <th className="py-2 px-3 text-right">Saldo Insoluto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.map(item => (
                    <tr key={item.number} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center font-bold text-slate-500">
                        {item.number}
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        {item.dueDate}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-900">
                        {curSym} {item.paymentAmount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {curSym} {item.principalAmount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {curSym} {item.interestAmount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-800">
                        {curSym} {item.remainingBalance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
