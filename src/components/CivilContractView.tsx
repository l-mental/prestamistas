import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building,
  User,
  Scale,
  Edit3,
} from 'lucide-react';
import { Loan } from '../types';
import { useLoanContext } from '../context/LoanContext';
import { exportCivilContractPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/frenchAmortization';

interface CivilContractViewProps {
  initialLoan?: Loan | null;
}

export const CivilContractView: React.FC<CivilContractViewProps> = ({ initialLoan }) => {
  const { loans, clients, companySettings } = useLoanContext();

  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    initialLoan ? initialLoan.id : (loans[0]?.id || '')
  );

  const currentLoan = loans.find(l => l.id === selectedLoanId) || loans[0];
  const client = currentLoan ? clients.find(c => c.id === currentLoan.clientId) : clients[0];

  const handleExportPDF = () => {
    if (currentLoan && client) {
      exportCivilContractPDF(currentLoan, client, companySettings);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentLoan || !client) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500 text-xs">No hay contratos registrados disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Selector & Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5 text-blue-800" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase">
              Seleccionar Préstamo para el Contrato
            </label>
            <select
              value={selectedLoanId}
              onChange={e => setSelectedLoanId(e.target.value)}
              className="text-xs font-bold text-blue-950 border border-blue-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {loans.map(l => (
                <option key={l.id} value={l.id}>
                  {l.loanNumber} - {l.clientName} ({formatCurrency(l.principalAmount, l.currency)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-700" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-sm shadow-yellow-500/30 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Descargar Contrato PDF</span>
          </button>
        </div>
      </div>

      {/* Contract Paper Document Preview */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-lg max-w-4xl mx-auto p-8 md:p-12 text-slate-900 font-sans leading-relaxed text-xs">
        {/* Document Header */}
        <div className="text-center pb-6 border-b border-slate-300 space-y-1">
          <h1 className="text-base font-extrabold tracking-wide uppercase text-slate-900">
            CONTRATO PRIVADO DE MUTUO DINERARIO CON INTERÉS
          </h1>
          <h2 className="text-xs font-bold text-slate-700 uppercase">
            Y CONSTITUCIÓN DE GARANTÍA MOBILIARIA / PERSONAL SOLIDARIA
          </h2>
          <p className="text-[11px] text-slate-500">
            REGISTRO CONTRACTUAL N°: <span className="font-bold text-slate-800">{currentLoan.loanNumber}</span> | CIUDAD DE {companySettings.cityCountry.toUpperCase()}
          </p>
        </div>

        {/* Intro */}
        <div className="mt-6 space-y-4 text-justify">
          <p>
            Conste por el presente documento privado de mutuo con carácter de título ejecutivo, el cual podrá ser formalizado ante Notario Público o elevado a Instrumento Público por cualquiera de las partes sin necesidad de requerimiento judicial previo, el presente <strong>CONTRATO DE MUTUO DINERARIO</strong> celebrado al amparo de las normas pertinentes del Código Civil vigente, entre las siguientes partes:
          </p>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <p>
              <strong>1. EL ACREEDOR PRESTAMISTA:</strong> <strong>{companySettings.name.toUpperCase()}</strong>, con NIT / Registro Fiscal N° <strong>{companySettings.taxId}</strong>, con domicilio legal en {companySettings.address}, legalmente representada para este acto por su apoderado general <strong>{companySettings.legalRepresentative}</strong>.
            </p>
            <p>
              <strong>2. EL DEUDOR PRESTATARIO:</strong> Don/Doña <strong>{client.fullName.toUpperCase()}</strong>, identificado(a) con <strong>{client.documentType} N° {client.documentNumber}</strong>, con domicilio real y legal fijado en {client.address}, ciudad de {client.city}, de ocupación declarada {client.occupation}, con solvencia patrimonial comprobada.
            </p>
            {client.guarantorName && (
              <p>
                <strong>3. EL FIADOR SOLIDARIO:</strong> Don/Doña <strong>{client.guarantorName.toUpperCase()}</strong>, identificado(a) con CI / Cédula N° <strong>{client.guarantorDoc || 'N/D'}</strong>, con domicilio en {client.guarantorAddress || client.address}, quien se constituye en garante y fiador solidario mancomunado e indivisible de la obligación.
              </p>
            )}
          </div>

          <h3 className="font-bold text-slate-900 pt-2 uppercase text-[11px] border-b border-slate-200 pb-1">
            ESTIPULACIONES Y CLÁUSULAS CONTRACTUALES:
          </h3>

          <p>
            <strong>CLÁUSULA PRIMERA (OBJETO Y ENTREGA DEL CAPITAL):</strong> Por el presente acto, EL ACREEDOR entrega a título de mutuo dinerario a favor de EL DEUDOR la cantidad líquida de <strong>{formatCurrency(currentLoan.principalAmount, currentLoan.currency)}</strong> ({currentLoan.principalAmount} en moneda pactada), suma que EL DEUDOR declara recibir en su totalidad, en moneda de curso legal, a su entera conformidad y satisfacción en la fecha de desembolso ({currentLoan.startDate}).
          </p>

          <p>
            <strong>CLÁUSULA SEGUNDA (SISTEMA DE AMORTIZACIÓN FRANCÉS Y TASA):</strong> Las partes acuerdan libremente que la devolución del capital entregado e intereses compensatorios devengados se regirá estrictamente bajo la modalidad del <strong>SISTEMA DE AMORTIZACIÓN FRANCÉS (Cuotas Fijas Constantes Periódicas)</strong>. 
            El crédito devengará una tasa de interés compensatorio pactada de <strong>{currentLoan.monthlyInterestRate}% mensual</strong>. 
            El plazo total de repago comprende <strong>{currentLoan.totalInstallments} cuotas periódicas de frecuencia {currentLoan.frequency}</strong>, ascendiendo la cuota fija periódica constante a la suma de <strong>{formatCurrency(currentLoan.fixedInstallmentAmount, currentLoan.currency)}</strong>, de acuerdo al Cronograma Oficial anexo.
          </p>

          <p>
            <strong>CLÁUSULA TERCERA (LUGAR, FORMA Y OPORTUNIDAD DE PAGO):</strong> Los pagos de cada una de las cuotas deberán efectuarse puntualmente en las fechas consignadas en el calendario de vencimientos, mediante abono en las cuentas bancarias designadas por EL ACREEDOR o de manera directa en sus oficinas autorizadas, sin necesidad de cobro a domicilio.
          </p>

          <p>
            <strong>CLÁUSULA CUARTA (DE LA MORA AUTOMÁTICA Y PENALIDADES):</strong> En caso de retraso en el pago de cualquiera de las cuotas, EL DEUDOR incurrirá en mora automática de pleno derecho por el solo transcurso del tiempo, sin necesidad de requerimiento, notificación o intimación judicial o extrajudicial alguna. 
            A partir del vencimiento se generará un interés moratorio compensatorio equivalente al <strong>{companySettings.lateFeeDailyRate}% diario</strong> sobre la cuota vencida. 
            El incumplimiento de dos (2) o más cuotas consecutivas facultará a EL ACREEDOR a resolver de pleno derecho el plazo y dar por vencidas la totalidad de las cuotas pendientes, exigiendo de inmediato el saldo insoluto total por la vía del Proceso Único de Ejecución.
          </p>

          <p>
            <strong>CLÁUSULA QUINTA (GARANTÍA Y TÍTULO VALOR):</strong> En garantía de la obligación principal, intereses y costas judiciales, EL DEUDOR suscribe conjuntamente con este contrato un <strong>PAGARÉ A LA ORDEN</strong> por el monto total de la operación. 
            {currentLoan.collateralDescription ? (
              <span>
                {' '}Asimismo, se constituye garantía sobre el siguiente bien: <strong>"{currentLoan.collateralDescription}"</strong>, valorizado preliminarmente de mutuo acuerdo en la suma de <strong>{formatCurrency(currentLoan.collateralEstimatedValue || currentLoan.principalAmount, currentLoan.currency)}</strong>.
              </span>
            ) : (
              <span> Se afecta la totalidad de los bienes presentes y futuros de EL DEUDOR y su Fiador Solidario.</span>
            )}
          </p>

          <p>
            <strong>CLÁUSULA SEXTA (DOMICILIO Y JURISDICCIÓN):</strong> Para los efectos del presente contrato, las partes señalan como sus domicilios legales y válidos los indicados en la introducción. Para cualquier controversia, se someten expresamente a la competencia de los Jueces y Tribunales de la jurisdicción de {companySettings.cityCountry}, renunciando a cualquier otro fuero judicial.
          </p>

          <p className="pt-2">
            En señal de conformidad, las partes suscriben el presente contrato en dos (2) ejemplares de un mismo tenor y valor en la fecha {currentLoan.startDate}.
          </p>
        </div>

        {/* Signatures Section */}
        <div className="mt-14 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-8 text-center">
            {/* Signature Prestamista */}
            <div>
              <div className="h-16 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-400 text-lg">
                  {companySettings.legalRepresentative}
                </span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <p className="font-bold text-slate-800">{companySettings.legalRepresentative}</p>
                <p className="text-[10px] text-slate-500 uppercase">EL ACREEDOR / PRESTAMISTA</p>
                <p className="text-[10px] text-slate-400">NIT: {companySettings.taxId}</p>
              </div>
            </div>

            {/* Signature Prestatario */}
            <div>
              <div className="h-16 flex items-center justify-end pr-4">
                <div className="w-14 h-16 border border-slate-300 rounded flex flex-col items-center justify-center text-[9px] text-slate-400">
                  <span>Índice</span>
                  <span>Derecho</span>
                  <span>(Huella)</span>
                </div>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <p className="font-bold text-slate-800">{client.fullName}</p>
                <p className="text-[10px] text-slate-500 uppercase">EL DEUDOR / PRESTATARIO</p>
                <p className="text-[10px] text-slate-400">
                  {client.documentType}: {client.documentNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Guarantor Signature if present */}
          {client.guarantorName && (
            <div className="mt-8 pt-4 max-w-xs mx-auto text-center">
              <div className="h-12 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-400">
                  {client.guarantorName}
                </span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <p className="font-bold text-slate-800">{client.guarantorName}</p>
                <p className="text-[10px] text-slate-500 uppercase">FIADOR SOLIDARIO MANCOMUNADO</p>
                <p className="text-[10px] text-slate-400">Doc: {client.guarantorDoc || 'N/D'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
