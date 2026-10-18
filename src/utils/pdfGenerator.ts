import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Loan, Client, CompanySettings, Installment, PaymentReceipt } from '../types';
import { formatCurrency } from './frenchAmortization';

export function exportAmortizationSchedulePDF(
  loan: Loan,
  client: Client,
  company: CompanySettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(company.name.toUpperCase(), 14, 20);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`RUC/NIT: ${company.taxId} | Tel: ${company.phone} | ${company.address}`, 14, 25);
  doc.text(`PLAN DE PAGOS - SISTEMA DE AMORTIZACIÓN FRANCÉS`, 14, 30);

  // Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 33, 196, 33);

  // Loan & Client Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 36, 182, 38, 2, 2, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('DATOS DE LA OPERACIÓN CREDITICIA', 18, 42);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`N° de Crédito: ${loan.loanNumber}`, 18, 48);
  doc.text(`Prestatario: ${client.fullName}`, 18, 54);
  doc.text(`Documento: ${client.documentType} ${client.documentNumber}`, 18, 60);
  doc.text(`Dirección: ${client.address}`, 18, 66);

  doc.text(`Monto Capital: ${formatCurrency(loan.principalAmount, loan.currency)}`, 110, 48);
  doc.text(`Tasa Interés Mensual: ${loan.monthlyInterestRate}%`, 110, 54);
  doc.text(`Plazo / Frecuencia: ${loan.totalInstallments} cuotas (${loan.frequency})`, 110, 60);
  doc.text(`Fecha Desembolso: ${loan.startDate}`, 110, 66);

  // Table Data
  const tableRows = loan.schedule.map((item: Installment) => [
    item.number.toString(),
    item.dueDate,
    formatCurrency(item.paymentAmount, loan.currency),
    formatCurrency(item.principalAmount, loan.currency),
    formatCurrency(item.interestAmount, loan.currency),
    formatCurrency(item.remainingBalance, loan.currency),
    item.status,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['N°', 'Fec. Venc.', 'Cuota Fija', 'Capital', 'Interés', 'Saldo Restante', 'Estado']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // Navy Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 24 },
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'center' },
    },
    didDrawPage: (data) => {
      // Footer
      const str = `Página ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 196 - doc.getTextWidth(str), 287);
      doc.text(`Generado automáticamente el ${new Date().toLocaleDateString('es-ES')} por CrediPlus`, 14, 287);
    },
  });

  doc.save(`Cronograma_Frances_${loan.loanNumber}.pdf`);
}

export function exportCivilContractPDF(
  loan: Loan,
  client: Client,
  company: CompanySettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 22;

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('CONTRATO PRIVADO DE MUTUO DINERARIO CON INTERÉS', 105, y, { align: 'center' });
  y += 6;
  doc.setFontSize(12);
  doc.text('Y GARANTÍA DE FIANZA SOLIDARIA', 105, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Contrato Registrado N°: ${loan.loanNumber} | Ciudad: ${company.cityCountry}`, 105, y, { align: 'center' });
  y += 8;

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 8;

  const contentParagraphs = [
    `Conste por el presente documento privado, el cual podrá ser elevado a Instrumento Público por cualquiera de las partes, el presente CONTRATO DE MUTUO DINERARIO sujeto a las normas del Código Civil vigente, que celebran:`,

    `DE UNA PARTE: ${company.name.toUpperCase()}, con identificación fiscal RUC/NIT ${company.taxId}, legalmente representada por ${company.legalRepresentative}, con domicilio procesal en ${company.address}, a quien en adelante se denominará EL ACREEDOR PRESTAMISTA.`,

    `DE OTRA PARTE: El/La señor(a) ${client.fullName.toUpperCase()}, identificado(a) con ${client.documentType} N° ${client.documentNumber}, con domicilio real y legal en ${client.address}, de ocupación ${client.occupation}, estado de solvencia declarada, a quien en adelante se denominará EL DEUDOR PRESTATARIO.`,

    client.guarantorName
      ? `Y DE TERCERA PARTE: El/La señor(a) ${client.guarantorName.toUpperCase()}, identificado(a) con DNI/Doc N° ${client.guarantorDoc || 'N/D'}, con domicilio en ${client.guarantorAddress || client.address}, quien interviene en calidad de FIADOR Y GARANTE SOLIDARIO MANCOMUNADO.`
      : `GARANTÍA: Se constituye en respaldo del crédito la siguiente garantía formal: ${loan.collateralDescription || 'Garantía Personal y Pagaré a la Orden'}.`,

    `CLÁUSULA PRIMERA (DEL OBJETO Y CAPITAL): EL ACREEDOR entrega a título de mutuo a favor de EL DEUDOR la suma líquida de ${formatCurrency(loan.principalAmount, loan.currency)} (${loan.principalAmount} ${loan.currency}), dinero que EL DEUDOR declara recibir a su entera conformidad y satisfacción en la fecha de desembolso (${loan.startDate}).`,

    `CLÁUSULA SEGUNDA (DEL SISTEMA DE AMORTIZACIÓN Y TASA): Las partes convienen libre y expresamente que el crédito devengará una Tasa de Interés Compensatorio del ${loan.monthlyInterestRate}% mensual. La devolución del capital e intereses se realizará bajo la estricta modalidad del SISTEMA DE AMORTIZACIÓN FRANCÉS (Cuotas Fijas Constantes Periódicas), distribuido en un total de ${loan.totalInstallments} cuotas periódicas de frecuencia ${loan.frequency}. La cuota fija periódica pactada asciende a ${formatCurrency(loan.fixedInstallmentAmount, loan.currency)}.`,

    `CLÁUSULA TERCERA (LUGAR Y FECHA DE PAGO): Los pagos se efectuarán puntualmente en las fechas descritas en el Cronograma Oficial Anexo, mediante abono en la cuenta bancaria de EL ACREEDOR o en sus oficinas administrativas antes de las 18:00 horas del día de vencimiento respectivo.`,

    `CLÁUSULA CUARTA (DE LA MORA Y PENALIDADES): En caso de retardo o incumplimiento en el pago de cualquiera de las cuotas pactadas al día siguiente de su vencimiento, EL DEUDOR incurrirá en mora automática de pleno derecho sin necesidad de intimación judicial o extrajudicial alguna, devengándose un interés moratorio y penalidad compensatoria equivalente al ${company.lateFeeDailyRate}% diario sobre el saldo insoluto o cuota vencida. El retraso de más de dos (2) cuotas consecutivas facultará a EL ACREEDOR a dar por vencidos todos los plazos y exigir la ejecución judicial total del saldo restante.`,

    `CLÁUSULA QUINTA (GARANTÍA Y TÍTULO EJECUTIVO): Para garantizar el cumplimiento puntual, EL DEUDOR suscribe conjuntamente con el presente contrato un PAGARÉ A LA ORDEN por el valor total de la obligación más intereses y costos legales, el cual tiene mérito ejecutivo inmediato. ${loan.collateralDescription ? `Asimismo, se constituye prenda/garantía sobre: "${loan.collateralDescription}" con valor referencial estimado de ${formatCurrency(loan.collateralEstimatedValue || 0, loan.currency)}.` : ''}`,

    `CLÁUSULA SEXTA (DOMICILIO Y JURISDICCIÓN): Las partes fijan como sus domicilios legales los señalados en la introducción. Para cualquier controversia derivada del presente contrato, las partes se someten expresamente a la jurisdicción de los Jueces y Tribunales competentes de ${company.cityCountry}, renunciando a cualquier otro fuero que pudiera corresponderles.`,

    `En señal de conformidad y plena aceptación de todas y cada una de las cláusulas precedentes, las partes firman el presente contrato por duplicado en la fecha ${loan.startDate}.`
  ];

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  for (const p of contentParagraphs) {
    const splitLines = doc.splitTextToSize(p, 180);
    if (y + splitLines.length * 4.2 > 265) {
      doc.addPage();
      y = 20;
    }
    doc.text(splitLines, 15, y);
    y += splitLines.length * 4.2 + 3.5;
  }

  // Signatures Section
  if (y > 230) {
    doc.addPage();
    y = 35;
  } else {
    y += 15;
  }

  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);

  // Line 1 Acreedor
  doc.line(20, y, 75, y);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.text(company.legalRepresentative, 47, y + 4, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.text('EL ACREEDOR / PRESTAMISTA', 47, y + 8, { align: 'center' });
  doc.text(`RUC: ${company.taxId}`, 47, y + 12, { align: 'center' });

  // Line 2 Deudor
  doc.line(125, y, 180, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(client.fullName, 152, y + 4, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.text('EL DEUDOR / PRESTATARIO', 152, y + 8, { align: 'center' });
  doc.text(`${client.documentType}: ${client.documentNumber}`, 152, y + 12, { align: 'center' });
  doc.rect(182, y - 20, 14, 20); // Huella dactilar box
  doc.setFontSize(6);
  doc.text('Huella DNI', 189, y + 3, { align: 'center' });

  // Guarantor if present
  if (client.guarantorName) {
    y += 25;
    doc.line(72, y, 128, y);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');
    doc.text(client.guarantorName, 100, y + 4, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.text('FIADOR Y GARANTE SOLIDARIO', 100, y + 8, { align: 'center' });
    doc.text(`Doc: ${client.guarantorDoc || 'N/D'}`, 100, y + 12, { align: 'center' });
  }

  doc.save(`Contrato_Civil_${loan.loanNumber}_${client.fullName.replace(/\s+/g, '_')}.pdf`);
}

export function exportPaymentReceiptPDF(
  receipt: PaymentReceipt,
  company: CompanySettings,
  currencyCode: string = 'USD'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210], // A5 size receipt
  });

  // Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(company.name.toUpperCase(), 12, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${company.address} | Tel: ${company.phone}`, 12, 23);
  doc.text(`RUC/NIT: ${company.taxId}`, 12, 27);

  // Receipt Number badge
  doc.setFillColor(30, 58, 138); // Blue-900
  doc.roundedRect(95, 12, 43, 16, 2, 2, 'F');
  doc.setTextColor(250, 204, 21); // Yellow-400
  doc.setFontSize(8);
  doc.text('RECIBO DE CAJA', 116, 18, { align: 'center' });
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(receipt.receiptId, 116, 24, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(12, 33, 136, 33);

  // Client Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 36, 124, 25, 2, 2, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Recibido de: ${receipt.clientName}`, 16, 42);
  doc.setFont('Helvetica', 'normal');
  doc.text(`N° de Préstamo: ${receipt.loanNumber}`, 16, 48);
  doc.text(`Cuota Cancelada: N° ${receipt.installmentNumber}`, 16, 54);
  doc.text(`Fecha y Hora: ${receipt.paymentDate}`, 80, 48);
  doc.text(`Medio de Pago: ${receipt.paymentMethod}`, 80, 54);

  // Payment Breakdown Table
  autoTable(doc, {
    startY: 65,
    margin: { left: 12, right: 12 },
    head: [['Concepto Contable', 'Monto Cancelado']],
    body: [
      ['Amortización a Capital', formatCurrency(receipt.principalPortion, currencyCode)],
      ['Interés Compensatorio (Francés)', formatCurrency(receipt.interestPortion, currencyCode)],
      ['Mora / Penalidad por Atraso', formatCurrency(receipt.lateFeePortion, currencyCode)],
      ['TOTAL PAGADO EN VENTANILLA', formatCurrency(receipt.amountPaid, currencyCode)],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Footer notes and signatures
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 115;

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nuevo saldo insoluto del préstamo: ${formatCurrency(receipt.remainingLoanBalance, currencyCode)}`, 14, finalY);

  doc.line(20, finalY + 28, 60, finalY + 28);
  doc.text('Cajero / Operador', 40, finalY + 32, { align: 'center' });

  doc.line(88, finalY + 28, 128, finalY + 28);
  doc.text('Firma Prestatario', 108, finalY + 32, { align: 'center' });

  doc.save(`Recibo_Pago_${receipt.receiptId}.pdf`);
}

export function exportAccountingReportPDF(
  loans: Loan[],
  company: CompanySettings,
  currencyCode: string = 'USD'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(company.name.toUpperCase(), 14, 18);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`INFORME CONTABLE DE CARTERA, COBRANZAS Y MOROSIDAD`, 14, 24);
  doc.text(`Fecha de corte: ${new Date().toLocaleDateString('es-ES')} | Moneda: ${currencyCode}`, 14, 29);

  // Accounting Summary Totals
  const totalDisbursed = loans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalPaid = loans.reduce((acc, l) => acc + l.totalPaid, 0);
  const totalInterestExpected = loans.reduce((acc, l) => acc + l.totalInterestExpected, 0);

  const overdueLoans = loans.filter(l => l.status === 'VENCIDO');
  const overdueCapital = overdueLoans.reduce((acc, l) => acc + l.outstandingBalance, 0);

  autoTable(doc, {
    startY: 34,
    head: [['Capital Total Colocado', 'Saldo de Cartera Activa', 'Capital Recuperado', 'Interés Proyectado', 'Cartera Vencida (Riesgo)']],
    body: [[
      formatCurrency(totalDisbursed, currencyCode),
      formatCurrency(totalOutstanding, currencyCode),
      formatCurrency(totalPaid, currencyCode),
      formatCurrency(totalInterestExpected, currencyCode),
      formatCurrency(overdueCapital, currencyCode),
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [30, 41, 59],
    },
  });

  const detailRows = loans.map(l => {
    const overdueCount = l.schedule.filter(s => s.status === 'VENCIDA').length;
    const accumulatedMora = l.schedule.reduce((acc, s) => acc + s.lateFee, 0);
    return [
      l.loanNumber,
      l.clientName,
      l.clientDocument,
      l.startDate,
      formatCurrency(l.principalAmount, l.currency),
      formatCurrency(l.fixedInstallmentAmount, l.currency),
      `${l.totalInstallments} (${l.frequency})`,
      formatCurrency(l.totalPaid, l.currency),
      formatCurrency(l.outstandingBalance, l.currency),
      l.status,
      overdueCount > 0 ? `${overdueCount} cuotas (+${formatCurrency(accumulatedMora, l.currency)})` : 'Al día',
    ];
  });

  const startY2 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 60;

  autoTable(doc, {
    startY: startY2,
    head: [['N° Préstamo', 'Cliente', 'Doc.', 'Desembolso', 'Capital', 'Cuota Francesa', 'Plazo', 'Cobrado', 'Saldo Insoluto', 'Estado', 'Mora/Riesgo']],
    body: detailRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // Navy Blue
      fontSize: 7.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right', fontStyle: 'bold' },
      9: { halign: 'center' },
      10: { halign: 'center' },
    },
  });

  doc.save(`Reporte_Contable_Cartera_${new Date().toISOString().slice(0, 10)}.pdf`);
}
