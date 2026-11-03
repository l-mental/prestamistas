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

export type UserRole = 'JEFE_AGENCIA' | 'ASESOR_PRESTAMOS';

export interface SystemUser {
  id: string;
  username: string; // Asesor no puede cambiar el usuario asignado
  fullName: string;
  role: UserRole; // Asesor no puede asignarse roles
  agency: string; // ej. "Agencia Central", "Agencia El Alto"
  email?: string;
  phone?: string;
  isActive?: boolean;
  isLocked: boolean; // Si el asesor se bloqueara (Jefe puede reiniciar)
  password?: string; // Contraseña
  failedAttempts?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ClientChangeField {
  fieldKey: string;
  fieldName: string;
  currentValue?: string;
  oldValue?: string;
  proposedValue?: string;
  newValue?: string;
  reason?: string;
}

export interface ClientChangeRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientDocument?: string;
  ci?: string;
  requestedByUserId?: string;
  requestedByUserName?: string;
  requestedBy?: string;
  requestDate?: string;
  requestedAt?: string;
  status: 'PENDIENTE' | 'AUTORIZADO' | 'RECHAZADO';
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  reviewDate?: string;
  reviewNotes?: string;
  reason?: string;
  changedFields: ClientChangeField[];
}

export type BolivianDepartment = 'LP' | 'CB' | 'SC' | 'OR' | 'PT' | 'TJ' | 'CH' | 'BE' | 'PA' | 'SE';

export interface ClientAddressDetail {
  department?: BolivianDepartment;
  city?: string;
  locality?: string;
  street: string;
  number: string;
  zone?: string;
  neighborhood?: string;
  housingType: 'Propio' | 'Familiar' | 'Anticrético' | 'Alquiler' | 'Cedido' | 'Otro';
  reference?: string;
  locationReference?: string;
  phone?: string;
  cellphone?: string;
}

export interface ClientPersonalReference {
  name?: string;
  fullName?: string;
  relationship: string;
  address: string;
  phone: string;
  notes?: string;
}

export interface ClientSpouseData {
  fullName: string;
  ci?: string;
  documentNumber?: string;
  documentExpedition?: BolivianDepartment;
  caedec: string;
  activity: string;
  seniorityMonths: number;
  sector?: 'Comercio' | 'Servicio' | 'Producción';
  economicSector?: string;
}

export interface Client {
  id: string;
  clientCode?: string; // Cod. Cliente (ej. "922744", "001")
  fullName: string;
  paternalSurname?: string;
  paternalLastName?: string;
  maternalSurname?: string;
  maternalLastName?: string;
  marriedSurname?: string;
  marriedLastName?: string;
  firstName?: string;
  documentType: 'CI' | 'DNI' | 'RUC' | 'RFC' | 'PASAPORTE';
  documentNumber: string; // C.I.
  documentExpedition?: BolivianDepartment;
  ciExpedition?: BolivianDepartment;
  documentComplement?: string;
  ciComplement?: string;
  idCardExpirationDate?: string;
  ciExpirationDate?: string; // Fecha de expiracion CI
  birthDate?: string; // Fecha de nacimiento
  gender?: 'MASCULINO' | 'FEMENINO' | 'M' | 'F';
  civilStatusFromId?: string;
  maritalStatusCi?: string;
  civilStatusDeclared?: string;
  maritalStatusDeclared?: string;
  civilStatus?: 'SOLTERO' | 'CASADO' | 'VIUDO' | 'DIVORCIADO' | 'CONVIVIENTE' | string;
  declaredActivity?: string;
  occupation: string;
  monthlyIncome: number;
  phone: string;
  email: string;
  address: string;
  city: string;
  documents: DocumentAttachment[];
  
  // Submódulo DIRECCIONES
  homeAddress?: ClientAddressDetail;
  businessIsSameAddress?: boolean;
  sameAddressForBusiness?: boolean;
  businessAddress?: ClientAddressDetail;

  // Submódulo ACTIVIDAD ECONOMICA
  caedecCode?: string;
  activityDescription?: string;
  activitySeniorityMonths?: number;
  economicSector?: 'Comercio' | 'Servicio' | 'Producción';

  // Submódulo DATOS GENERALES (Cónyuge / Conviviente)
  spouse?: ClientSpouseData;

  // Submódulo REFERENCIAS (Registro de dos referencias)
  references?: ClientPersonalReference[];
  personalReferences?: ClientPersonalReference[];

  // Submódulo VALIDACION DE REGISTROS
  registeredBy?: string; // Asesor de Préstamos
  agency?: string; // Agencia
  registrationDate?: string;
  solicitudeNumber?: string; // Nro. Solicitud
  status?: 'HABILITADO' | 'PENDIENTE_AUTORIZACION';
  createdAt?: string;
  updatedAt?: string;

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
