import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  DollarSign,
  Calendar,
  MessageCircle,
  FileWarning,
  CreditCard,
  UserX,
  Phone,
  ShieldAlert,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Loan, Installment } from '../types';
import { useLoanContext } from '../context/LoanContext';
import jsPDF from 'jspdf';
import { formatCurrency } from '../utils/frenchAmortization';

interface OverdueLoansProps {
  onSelectLoanForPayment: (loan: Loan, installmentNumber?: number) => void;
  onViewContract: (loan: Loan) => void;
}

export const OverdueLoans: React.FC<OverdueLoansProps> = ({
  onSelectLoanForPayment,
  onViewContract,
}) => {
  const { loans, formatMoney, companySettings, clients } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');

  const overdueLoans = loans.filter(l => l.status === 'VENCIDO');

  const filteredLoans = overdueLoans.filter(loan => {
    return (
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientDocument.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalOverdueCapital = overdueLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalMoraAccumulated = overdueLoans.reduce((sum, l) => {
    return sum + l.schedule.reduce((sub, inst) => sub + inst.lateFee, 0);
  }, 0);

  const handleWhatsAppNotice = (loan: Loan, installment: Installment) => {
    const client = clients.find(c => c.id === loan.clientId);
    const phone = client?.phone.replace(/[^0-9]/g, '') || '';
    const totalDueWithMora = installment.paymentAmount + installment.lateFee;

    const message =
      `*NOTIFICACIÓN EXTRAJUDICIAL DE MORA CRÍTICA - CREDI PLUS*\n` +
      `Estimado(a) *${loan.clientName}*:\n` +
      `Le informamos que su crédito N° *${loan.loanNumber}* presenta la Cuota N° ${installment.number} en estado *VENCIDO* con *${installment.daysOverdue} días de mora*.\n` +
      `📌 *Cuota Base:* ${formatCurrency(installment.paymentAmount, loan.currency)}\n` +
      `⚠️ *Interés Moratorio:* ${formatCurrency(installment.lateFee, loan.currency)}\n` +
      `💵 *TOTAL EXIGIBLE A PAGAR HOY:* ${formatCurrency(totalDueWithMora, loan.currency)}\n\n` +
      `Evite el inicio de acciones judiciales sobre la garantía pactada (${loan.collateralDescription || 'Garantía Personal'}). Comuníquese de inmediato para regularizar su situación.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleExportOverdueNoticePDF = (loan: Loan, installment: Installment) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const client = clients.find(c => c.id === loan.clientId) || clients[0];
    const totalWithMora = installment.paymentAmount + installment.lateFee;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text(companySettings.name.toUpperCase(), 14, 20);

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`DEPARTAMENTO DE COBRANZAS Y ASESORÍA JURÍDICA`, 14, 25);
    doc.text(`NIT: ${companySettings.taxId} | Tel: ${companySettings.phone}`, 14, 30);

    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(1);
    doc.line(14, 33, 196, 33);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(185, 28, 28);
    doc.text('REQUERIMIENTO EXTRAJUDICIAL DE PAGO Y MORA', 105, 43, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 14, 52);
    doc.text(`Señor(a): ${loan.clientName}`, 14, 58);
    doc.text(`Documento: ${loan.clientDocument}`, 14, 63);
    doc.text(`Dirección Domiciliaria: ${client.address}`, 14, 68);
    if (client.guarantorName) {
      doc.text(`Garante Solidario: ${client.guarantorName} (${client.guarantorDoc || ''})`, 14, 73);
    }

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(14, 78, 182, 38, 2, 2, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('DETALLE DE LA DEUDA VENCIDA EN MORA CRÍTICA', 18, 85);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`N° de Contrato / Préstamo: ${loan.loanNumber}`, 18, 92);
    doc.text(`Cuota Impaga: N° ${installment.number} (Venció el: ${installment.dueDate})`, 18, 98);
    doc.text(`Días de Mora Transcurridos: ${installment.daysOverdue} días`, 18, 104);

    doc.text(`Monto Cuota Base: ${formatCurrency(installment.paymentAmount, loan.currency)}`, 110, 92);
    doc.text(`Interés Moratorio y Penalidad: ${formatCurrency(installment.lateFee, loan.currency)}`, 110, 98);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(`TOTAL EXIGIBLE HOY: ${formatCurrency(totalWithMora, loan.currency)}`, 110, 106);

    // Legal Body
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const bodyText = [
      `Por medio de la presente, le requerimos de manera formal el pago inmediato de la suma insoluta y vencida arriba descrita, correspondiente al Contrato de Mutuo con Amortización Francesa celebrado con nuestra institución.`,
      `Habiendo vencido el plazo legal de tolerancia estipulado en la Cláusula Cuarta de su contrato civil, el retraso genera la facultad legal de declarar de plazo vencido la totalidad del crédito pendiente por valor de ${formatCurrency(loan.outstandingBalance, loan.currency)}, facultándonos al embargo y ejecución directa de la garantía otorgada:`,
      `GARANTÍA REGISTRADA: "${loan.collateralDescription || 'Pagaré a la orden y patrimonio personal'}"`,
      `Le otorgamos un plazo perentorio de CUARENTA Y OCHO (48) HORAS a partir de la recepción de la presente comunicación para apersonarse a nuestras oficinas o realizar el depósito correspondiente. De persistir el incumplimiento, se procederá al protesto notarial del Pagaré y al inicio de la Demanda Ejecutiva de Pago.`,
    ];

    let y = 125;
    for (const paragraph of bodyText) {
      const split = doc.splitTextToSize(paragraph, 180);
      doc.text(split, 15, y);
      y += split.length * 4.5 + 4;
    }

    // Signature
    y += 15;
    doc.setDrawColor(100, 116, 139);
    doc.line(75, y, 135, y);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(companySettings.legalRepresentative, 105, y + 4, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Departamento de Recuperaciones y Cobranzas', 105, y + 8, { align: 'center' });

    doc.save(`Notificacion_Mora_${loan.loanNumber}_${loan.clientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Cards (CRITICAL RED & YELLOW) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border-2 border-red-500 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-900 uppercase tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              Capital en Riesgo Crítico
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700 mt-2">
            {formatMoney(totalOverdueCapital)}
          </div>
          <div className="text-[11px] text-red-800 mt-1 font-bold">
            {overdueLoans.length} créditos en situación de morosidad
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-400 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900 uppercase">
              Mora / Penalidades Devengadas
            </span>
            <div className="w-9 h-9 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black">
              <AlertTriangle className="w-5 h-5 text-slate-950" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">
            {formatMoney(totalMoraAccumulated)}
          </div>
          <div className="text-[11px] text-amber-800 mt-1 font-bold">
            Tasa moratoria: {companySettings.lateFeeDailyRate}% diario
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase">
              Estado de Recuperación
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-700 text-yellow-300 flex items-center justify-center">
              <FileWarning className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-950 mt-2">
            Cobranza Activa
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Notificaciones en PDF y WhatsApp habilitadas
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar crédito moroso por deudor o N°..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
          />
        </div>
        <div className="text-xs font-black text-red-600 uppercase flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          {overdueLoans.length} caso(s) requieren atención prioritaria
        </div>
      </div>

      {/* Overdue Loans Cards / Table */}
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              ✓
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              ¡Excelente! No hay créditos en mora en este momento.
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Todos los clientes se encuentran al día con sus cronogramas de pago.
            </p>
          </div>
        ) : (
          filteredLoans.map(loan => {
            const overdueInstallments = loan.schedule.filter(s => s.status === 'VENCIDA');
            const worstInstallment = overdueInstallments[0] || loan.schedule[0];
            const maxDaysOverdue = Math.max(...overdueInstallments.map(s => s.daysOverdue), 0);
            const loanMora = overdueInstallments.reduce((acc, s) => acc + s.lateFee, 0);
            const loanCuotasTotal = overdueInstallments.reduce((acc, s) => acc + s.paymentAmount, 0);
            const totalRequiredToSettle = loanCuotasTotal + loanMora;

            return (
              <div
                key={loan.id}
                className="bg-white rounded-xl border-2 border-red-500 shadow-md overflow-hidden"
              >
                {/* Header banner (RED ALERT) */}
                <div className="p-4 bg-red-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-white text-sm">
                          {loan.loanNumber} - {loan.clientName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                          {maxDaysOverdue} DÍAS DE MORA
                        </span>
                      </div>
                      <p className="text-xs text-red-100">
                        {loan.clientDocument} | Tel: {clients.find(c => c.id === loan.clientId)?.phone || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-red-100 block font-bold uppercase">Exigible Inmediato</span>
                      <span className="text-lg font-black text-yellow-300">
                        {formatMoney(totalRequiredToSettle)}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectLoanForPayment(loan, worstInstallment.number)}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-yellow-500/30"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                      <span>Cobrar Deuda</span>
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Financial Details */}
                  <div className="space-y-2 border-r border-slate-100 pr-4">
                    <h4 className="font-bold text-red-900 text-[11px] uppercase">
                      Desglose de la Mora Crítica
                    </h4>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Cuotas Vencidas:</span>
                      <span className="font-bold text-slate-800">
                        {overdueInstallments.length} cuota(s)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Suma de Cuotas Base:</span>
                      <span className="font-bold text-slate-800">
                        {formatMoney(loanCuotasTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-red-700 font-bold">Interés Moratorio Acumulado:</span>
                      <span className="font-black text-red-700">
                        + {formatMoney(loanMora)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Saldo Total del Crédito:</span>
                      <span className="font-black text-blue-950">
                        {formatMoney(loan.outstandingBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Collateral & Guarantees */}
                  <div className="space-y-2 border-r border-slate-100 pr-4">
                    <h4 className="font-bold text-slate-700 text-[11px] uppercase">
                      Garantía &amp; Cobranza
                    </h4>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Garantía Pactada:</span>{' '}
                      {loan.collateralDescription || 'Garantía Personal y Pagaré firmado'}
                    </p>
                    {loan.collateralEstimatedValue && (
                      <p className="text-slate-500 text-[11px]">
                        Valor estimado de respaldo: {formatMoney(loan.collateralEstimatedValue)}
                      </p>
                    )}
                    {loan.notes && (
                      <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-600 mt-2">
                        <span className="font-bold text-slate-700 block">Bitácora de Gestión:</span>
                        {loan.notes}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Quick Action Notices */}
                  <div className="space-y-2 flex flex-col justify-center">
                    <h4 className="font-bold text-slate-700 text-[11px] uppercase">
                      Acciones Legales y de Notificación
                    </h4>

                    <button
                      onClick={() => handleWhatsAppNotice(loan, worstInstallment)}
                      className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-800 text-yellow-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-yellow-400/40 shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 text-yellow-400" />
                      <span>Notificar por WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleExportOverdueNoticePDF(loan, worstInstallment)}
                      className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shadow-red-500/20"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span>Descargar Carta Notarial PDF</span>
                    </button>

                    <button
                      onClick={() => onViewContract(loan)}
                      className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-blue-200"
                    >
                      <span>Revisar Contrato Civil</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
