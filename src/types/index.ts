export type PaymentFrequency = 'MENSUAL' | 'QUINCENAL' | 'SEMANAL' | 'DIARIO';

export type LoanStatus = 'ACTIVO' | 'VENCIDO' | 'PAGADO' | 'REFINANCIADO' | 'CASTIGADO';

export type InstallmentStatus = 'PAGADA' | 'PENDIENTE' | 'VENCIDA' | 'PARCIAL';

export interface Installment {
  number: number;
  dueDate: string; // YYYY-MM-DD
  paymentAmount: number; // Cuota fija del sistema francés
  principalAmount: number; // Amortización a capital
  interestAmount: number; // Interés del período
  insuranceOrFees: number; // Seguro / gastos adm
  remainingBalance: number; // Saldo insoluto después de pagar esta cuota
  status: InstallmentStatus;
  paidAmount: number;
  paidDate?: string;
  daysOverdue: number; // Días de mora
  lateFee: number; // Penalidad/Mora generada
  paymentReceiptNumber?: string;
}

export interface DocumentAttachment {
  id: string;
  title: string;
  type: 'DNI_FRONT' | 'DNI_BACK' | 'INGRESOS' | 'GARANTIA_FOTO' | 'CONTRATO_FIRMADO' | 'PAGARE' | 'RECIBO_SERVICIO' | 'OTRO';
  fileUrl: string; // Base64 data URL or sample image URL
  fileName: string;
  uploadDate: string;
  fileSize?: string;
}

export interface Client {
  id: string;
  fullName: string;
  documentType: 'DNI' | 'RUC' | 'CI' | 'RFC' | 'PASAPORTE';
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  occupation: string;
  monthlyIncome: number;
  documents: DocumentAttachment[];
  guarantorName?: string;
  guarantorDoc?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
}

export interface Loan {
  id: string;
  loanNumber: string; // e.g. PRE-2026-001
  clientId: string;
  clientName: string;
  clientDocument: string;
  principalAmount: number; // Monto desembolsado
  currency: 'BOB' | 'USD' | 'PEN' | 'MXN' | 'COP' | 'EUR';
  annualInterestRate: number; // TEA o Tasa mensual según base
  monthlyInterestRate: number; // Tasa mensual utilizada para el cálculo francés
  termMonths: number; // Plazo total
  frequency: PaymentFrequency;
  totalInstallments: number;
  fixedInstallmentAmount: number; // Valor cuota francesa
  startDate: string; // Fecha de desembolso
  status: LoanStatus;
  collateralDescription?: string; // Garantía prendaria o hipotecaria
  collateralEstimatedValue?: number;
  schedule: Installment[];
  documents: DocumentAttachment[];
  notes?: string;
  civilContractClauses?: string[];
  totalInterestExpected: number;
  totalAmountExpected: number;
  totalPaid: number;
  outstandingBalance: number;
}

export interface PaymentReceipt {
  receiptId: string;
  loanId: string;
  loanNumber: string;
  clientId: string;
  clientName: string;
  installmentNumber: number;
  amountPaid: number;
  principalPortion: number;
  interestPortion: number;
  lateFeePortion: number;
  paymentDate: string;
  paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE';
  referenceNumber?: string;
  receivedBy: string;
  remainingLoanBalance: number;
}

export interface ExchangeRate {
  baseCurrency: string; // Default local or USD
  rateType?: 'PARALELO' | 'OFICIAL';
  rateName?: string;
  usdBuy: number; // Compra USD (Paralelo por defecto)
  usdSell: number; // Venta USD (Paralelo por defecto)
  officialBuy?: number; // Referencial Oficial BCB
  officialSell?: number; // Referencial Oficial BCB
  eurBuy: number;
  eurSell: number;
  lastUpdated: string;
  symbol: string;
}

export interface CompanySettings {
  name: string;
  legalRepresentative: string;
  taxId: string; // RUC / RFC / CIF
  address: string;
  phone: string;
  email: string;
  cityCountry: string;
  currencySymbol: string;
  currencyCode: 'BOB' | 'USD' | 'PEN' | 'MXN' | 'COP' | 'EUR';
  lateFeeDailyRate: number; // % diario de mora (ej. 0.15%)
  gracePeriodDays: number;
}
