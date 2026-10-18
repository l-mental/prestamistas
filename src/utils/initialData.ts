import { Client, CompanySettings, ExchangeRate, Loan } from '../types';
import { generateFrenchSchedule, recalculateOverdue } from './frenchAmortization';

// Realistic SVG Data URIs for documents
const createSvgDoc = (title: string, color: string, badge: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#f8fafc" rx="12"/>
    <rect x="20" y="20" width="560" height="60" fill="${color}" rx="8"/>
    <text x="40" y="58" font-family="Arial" font-size="22" font-weight="bold" fill="#ffffff">${title}</text>
    <rect x="440" y="35" width="120" height="30" fill="#ffffff" rx="15"/>
    <text x="500" y="55" font-family="Arial" font-size="13" font-weight="bold" fill="${color}" text-anchor="middle">${badge}</text>
    <rect x="40" y="110" width="130" height="150" fill="#e2e8f0" rx="8"/>
    <circle cx="105" cy="165" r="35" fill="#94a3b8"/>
    <rect x="65" y="215" width="80" height="30" rx="15" fill="#94a3b8"/>
    <rect x="200" y="120" width="220" height="16" fill="#cbd5e1" rx="4"/>
    <rect x="200" y="150" width="340" height="12" fill="#e2e8f0" rx="4"/>
    <rect x="200" y="175" width="280" height="12" fill="#e2e8f0" rx="4"/>
    <rect x="200" y="200" width="310" height="12" fill="#e2e8f0" rx="4"/>
    <rect x="200" y="235" width="140" height="24" fill="${color}" rx="6"/>
    <text x="270" y="252" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFICADO OFICIAL</text>
    <rect x="40" y="290" width="520" height="80" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="8"/>
    <text x="60" y="325" font-family="Arial" font-size="13" fill="#64748b">Huella Digital Registrada &amp; Firma Biométrica del Titular</text>
    <text x="60" y="350" font-family="Arial" font-size="11" fill="#94a3b8">Expediente validado en Sistema de Riesgo Crediticio</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const initialCompanySettings: CompanySettings = {
  name: 'Financiera CrediPlus Bolivia S.A.',
  legalRepresentative: 'Lic. Alejandro Morales Rivera',
  taxId: '1029384756', // NIT Bolivia
  address: 'Av. 16 de Julio (El Prado) N° 1490, Piso 4',
  phone: '+591 2 244 5566',
  email: 'contacto@crediplus.bo',
  cityCountry: 'La Paz, Bolivia',
  currencySymbol: 'Bs',
  currencyCode: 'BOB',
  lateFeeDailyRate: 0.15, // 0.15% diario
  gracePeriodDays: 2,
};

export const initialExchangeRates: ExchangeRate = {
  baseCurrency: 'USD',
  rateType: 'PARALELO',
  rateName: 'Mercado Paralelo Bolivia (Dólar Blue / Libre)',
  usdBuy: 12.80, // BOB Paralelo Compra
  usdSell: 13.20, // BOB Paralelo Venta
  officialBuy: 6.86, // BCB Oficial Referencial Compra
  officialSell: 6.96, // BCB Oficial Referencial Venta
  eurBuy: 13.80,
  eurSell: 14.30,
  lastUpdated: '18/10/2026 (Mercado Paralelo)',
  symbol: 'Bs',
};

export const initialClients: Client[] = [
  {
    id: 'cli-001',
    fullName: 'Roberto Carlos Mendoza Silva',
    documentType: 'CI',
    documentNumber: '4789123-LP',
    phone: '+591 706 34155',
    email: 'rmendoza@comercial.bo',
    address: 'Av. Ballivián 1250, Calacoto',
    city: 'La Paz',
    occupation: 'Comerciante Minorista',
    monthlyIncome: 8500,
    guarantorName: 'Maritza Silva Valdivia',
    guarantorDoc: '4098712-LP',
    guarantorPhone: '+591 772 23901',
    guarantorAddress: 'Calle 21 de Calacoto N° 450',
    documents: [
      {
        id: 'doc-1',
        title: 'Cédula de Identidad (CI) Anverso y Reverso',
        type: 'DNI_FRONT',
        fileUrl: createSvgDoc('CÉDULA DE IDENTIDAD (CI)', '#1e3a8a', 'CI BOLIVIA'),
        fileName: 'ci_roberto_mendoza.png',
        uploadDate: '2026-08-10',
        fileSize: '1.2 MB',
      },
      {
        id: 'doc-2',
        title: 'Garantía Mobiliaria - Vehículo Toyota Hilux',
        type: 'GARANTIA_FOTO',
        fileUrl: createSvgDoc('RUAT VEHICULAR & FOTO', '#047857', 'GARANTÍA RUAT'),
        fileName: 'ruat_vehiculo_toyota.png',
        uploadDate: '2026-08-10',
        fileSize: '2.4 MB',
      },
      {
        id: 'doc-3',
        title: 'Factura de Servicios - DeLaPaz / CRE',
        type: 'RECIBO_SERVICIO',
        fileUrl: createSvgDoc('AVISO DE COBRANZA LUZ', '#b45309', 'DOMICILIO'),
        fileName: 'factura_luz_agosto.pdf',
        uploadDate: '2026-08-10',
        fileSize: '780 KB',
      },
    ],
  },
  {
    id: 'cli-002',
    fullName: 'Elena Patricia Gómez Vargas',
    documentType: 'CI',
    documentNumber: '5823456-SC',
    phone: '+591 785 11244',
    email: 'elena.gomez@consultora.bo',
    address: 'Av. San Martín 880, Equipetrol',
    city: 'Santa Cruz',
    occupation: 'Ingeniera de Sistemas Independiente',
    monthlyIncome: 14500,
    guarantorName: 'Eduardo Gómez Farfán',
    guarantorDoc: '3911299-SC',
    guarantorPhone: '+591 760 55421',
    guarantorAddress: 'Barrio Sirari, Calle Los Claveles',
    documents: [
      {
        id: 'doc-4',
        title: 'Cédula de Identidad de la Titular',
        type: 'DNI_FRONT',
        fileUrl: createSvgDoc('CÉDULA DE IDENTIDAD (CI)', '#1e3a8a', 'CI BOLIVIA'),
        fileName: 'ci_elena_gomez.png',
        uploadDate: '2026-09-01',
        fileSize: '1.1 MB',
      },
      {
        id: 'doc-5',
        title: 'Facturación SIN / Declaración Jurada Form 200',
        type: 'INGRESOS',
        fileUrl: createSvgDoc('SUSTENTO TRIBUTARIO SIN', '#0284c7', 'INGRESOS'),
        fileName: 'declaracion_sin_elena.pdf',
        uploadDate: '2026-09-01',
        fileSize: '3.1 MB',
      },
    ],
  },
  {
    id: 'cli-003',
    fullName: 'Jorge Luis Huamán Ramos',
    documentType: 'CI',
    documentNumber: '4233190-CB',
    phone: '+591 722 88901',
    email: 'jhuaman@taller.bo',
    address: 'Av. Blanco Galindo Km 4, Quillacollo',
    city: 'Cochabamba',
    occupation: 'Taller Mecánico Automotriz',
    monthlyIncome: 10200,
    guarantorName: 'Víctor Huamán Ramos',
    guarantorDoc: '4588901-CB',
    guarantorPhone: '+591 717 77122',
    documents: [
      {
        id: 'doc-6',
        title: 'Cédula de Identidad del Prestatario',
        type: 'DNI_FRONT',
        fileUrl: createSvgDoc('CÉDULA DE IDENTIDAD (CI)', '#1e3a8a', 'CI BOLIVIA'),
        fileName: 'ci_jorge_huaman.png',
        uploadDate: '2026-07-15',
        fileSize: '1.4 MB',
      },
      {
        id: 'doc-7',
        title: 'Prenda Maquinaria Taller (Elevador Hidráulico)',
        type: 'GARANTIA_FOTO',
        fileUrl: createSvgDoc('PRENDA MOBILIARIA MAQUINARIA', '#b91c1c', 'GARANTÍA'),
        fileName: 'garantia_maquinaria_elevador.png',
        uploadDate: '2026-07-15',
        fileSize: '4.2 MB',
      },
    ],
  },
  {
    id: 'cli-004',
    fullName: 'Valeria Castro Montenegro',
    documentType: 'CI',
    documentNumber: '6455981-LP',
    phone: '+591 730 88410',
    email: 'vcastro@boutique.bo',
    address: 'Av. Arce 2410, Sopocachi',
    city: 'La Paz',
    occupation: 'Empresaria Confecciones',
    monthlyIncome: 12800,
    documents: [
      {
        id: 'doc-8',
        title: 'Cédula de Identidad Digital',
        type: 'DNI_FRONT',
        fileUrl: createSvgDoc('CÉDULA DE IDENTIDAD (CI)', '#1e3a8a', 'CI BOLIVIA'),
        fileName: 'ci_valeria_castro.png',
        uploadDate: '2026-09-15',
        fileSize: '950 KB',
      },
    ],
  },
];

// Helper to create seed loans
function generateSeedLoans(): Loan[] {
  const today = '2026-10-13';

  // 1. Prestamo Activo al día (Roberto Carlos Mendoza)
  const sched1 = generateFrenchSchedule({
    principal: 4000,
    monthlyInterestRatePercent: 3.5,
    termPeriods: 6,
    frequency: 'MENSUAL',
    startDate: '2026-08-10',
    insuranceOrMonthlyFee: 15,
  });
  // Cuota 1 y 2 pagadas, cuota 3 vence el 2026-11-10
  sched1[0].status = 'PAGADA';
  sched1[0].paidAmount = sched1[0].paymentAmount;
  sched1[0].paidDate = '2026-09-10';
  sched1[0].paymentReceiptNumber = 'REC-2026-001';

  sched1[1].status = 'PAGADA';
  sched1[1].paidAmount = sched1[1].paymentAmount;
  sched1[1].paidDate = '2026-10-10';
  sched1[1].paymentReceiptNumber = 'REC-2026-015';

  const loan1TotalExpected = sched1.reduce((acc, s) => acc + s.paymentAmount, 0);
  const loan1Paid = sched1[0].paymentAmount + sched1[1].paymentAmount;
  const loan1Balance = sched1[1].remainingBalance;

  const loan1: Loan = {
    id: 'loan-001',
    loanNumber: 'PRE-2026-101',
    clientId: 'cli-001',
    clientName: 'Roberto Carlos Mendoza Silva',
    clientDocument: 'CI 4789123-LP',
    principalAmount: 4000,
    currency: 'USD',
    annualInterestRate: 42.0,
    monthlyInterestRate: 3.5,
    termMonths: 6,
    frequency: 'MENSUAL',
    totalInstallments: 6,
    fixedInstallmentAmount: sched1[0].paymentAmount,
    startDate: '2026-08-10',
    status: 'ACTIVO',
    collateralDescription: 'Vehículo Toyota Yaris 2018 Placa B4X-120 valorizado en $8,500',
    collateralEstimatedValue: 8500,
    schedule: sched1,
    documents: initialClients[0].documents,
    notes: 'Cliente con puntualidad intachable. Excelente récord crediticio.',
    totalInterestExpected: Math.round((loan1TotalExpected - 4000) * 100) / 100,
    totalAmountExpected: loan1TotalExpected,
    totalPaid: Math.round(loan1Paid * 100) / 100,
    outstandingBalance: loan1Balance,
  };

  // 2. Prestamo con Crédito por pagar inminente (Elena Patricia Gómez)
  const sched2 = generateFrenchSchedule({
    principal: 6000,
    monthlyInterestRatePercent: 3.0,
    termPeriods: 12,
    frequency: 'MENSUAL',
    startDate: '2026-09-14',
    insuranceOrMonthlyFee: 20,
  });
  // Cuota 1 vence mañana 2026-10-14!
  const loan2TotalExpected = sched2.reduce((acc, s) => acc + s.paymentAmount, 0);

  const loan2: Loan = {
    id: 'loan-002',
    loanNumber: 'PRE-2026-102',
    clientId: 'cli-002',
    clientName: 'Elena Patricia Gómez Vargas',
    clientDocument: 'CI 7123456-SC',
    principalAmount: 6000,
    currency: 'USD',
    annualInterestRate: 36.0,
    monthlyInterestRate: 3.0,
    termMonths: 12,
    frequency: 'MENSUAL',
    totalInstallments: 12,
    fixedInstallmentAmount: sched2[0].paymentAmount,
    startDate: '2026-09-14',
    status: 'ACTIVO',
    collateralDescription: 'Fianza Solidaria Mancomunada y Pagaré Bancario',
    collateralEstimatedValue: 6000,
    schedule: sched2,
    documents: initialClients[1].documents,
    notes: 'Cuota 1 vence en 24 horas. Notificación preventiva enviada.',
    totalInterestExpected: Math.round((loan2TotalExpected - 6000) * 100) / 100,
    totalAmountExpected: loan2TotalExpected,
    totalPaid: 0,
    outstandingBalance: 6000,
  };

  // 3. Prestamo VENCIDO con MORA (Jorge Luis Huamán)
  let sched3 = generateFrenchSchedule({
    principal: 5000,
    monthlyInterestRatePercent: 4.0,
    termPeriods: 8,
    frequency: 'MENSUAL',
    startDate: '2026-06-15',
    insuranceOrMonthlyFee: 25,
  });
  // Cuota 1 pagada
  sched3[0].status = 'PAGADA';
  sched3[0].paidAmount = sched3[0].paymentAmount;
  sched3[0].paidDate = '2026-07-15';
  sched3[0].paymentReceiptNumber = 'REC-2026-004';
  
  // Cuota 2 pagada
  sched3[1].status = 'PAGADA';
  sched3[1].paidAmount = sched3[1].paymentAmount;
  sched3[1].paidDate = '2026-08-16';
  sched3[1].paymentReceiptNumber = 'REC-2026-009';

  // Cuota 3 venció el 2026-09-15 (28 días de mora respecto a 2026-10-13)
  // Recalcular con mora automática:
  sched3 = recalculateOverdue(sched3, today, 0.15, 2);

  const loan3TotalExpected = sched3.reduce((acc, s) => acc + s.paymentAmount, 0);
  const loan3Paid = sched3[0].paymentAmount + sched3[1].paymentAmount;
  const loan3Balance = sched3[1].remainingBalance;

  const loan3: Loan = {
    id: 'loan-003',
    loanNumber: 'PRE-2026-103',
    clientId: 'cli-003',
    clientName: 'Jorge Luis Huamán Ramos',
    clientDocument: 'CI 4233190-CBBA',
    principalAmount: 5000,
    currency: 'USD',
    annualInterestRate: 48.0,
    monthlyInterestRate: 4.0,
    termMonths: 8,
    frequency: 'MENSUAL',
    totalInstallments: 8,
    fixedInstallmentAmount: sched3[0].paymentAmount,
    startDate: '2026-06-15',
    status: 'VENCIDO',
    collateralDescription: 'Elevador Hidráulico Launch 4 Toneladas serie LAU-8819',
    collateralEstimatedValue: 7200,
    schedule: sched3,
    documents: initialClients[2].documents,
    notes: 'Crédito en mora de 28 días. Cliente contactado por gestión de cobranzas, ofreció pagar el viernes.',
    totalInterestExpected: Math.round((loan3TotalExpected - 5000) * 100) / 100,
    totalAmountExpected: loan3TotalExpected,
    totalPaid: Math.round(loan3Paid * 100) / 100,
    outstandingBalance: loan3Balance,
  };

  // 4. Préstamo Semanal Activo (Valeria Castro)
  const sched4 = generateFrenchSchedule({
    principal: 2500,
    monthlyInterestRatePercent: 4.5,
    termPeriods: 16, // 16 semanas
    frequency: 'SEMANAL',
    startDate: '2026-09-20',
    insuranceOrMonthlyFee: 5,
  });
  // 3 semanas pagadas
  sched4[0].status = 'PAGADA';
  sched4[0].paidAmount = sched4[0].paymentAmount;
  sched4[0].paidDate = '2026-09-27';
  sched4[0].paymentReceiptNumber = 'REC-2026-011';

  sched4[1].status = 'PAGADA';
  sched4[1].paidAmount = sched4[1].paymentAmount;
  sched4[1].paidDate = '2026-10-04';
  sched4[1].paymentReceiptNumber = 'REC-2026-018';

  sched4[2].status = 'PAGADA';
  sched4[2].paidAmount = sched4[2].paymentAmount;
  sched4[2].paidDate = '2026-10-11';
  sched4[2].paymentReceiptNumber = 'REC-2026-022';

  const loan4TotalExpected = sched4.reduce((acc, s) => acc + s.paymentAmount, 0);
  const loan4Paid = sched4[0].paymentAmount + sched4[1].paymentAmount + sched4[2].paymentAmount;

  const loan4: Loan = {
    id: 'loan-004',
    loanNumber: 'PRE-2026-104',
    clientId: 'cli-004',
    clientName: 'Valeria Castro Montenegro',
    clientDocument: 'DNI 74559812',
    principalAmount: 2500,
    currency: 'USD',
    annualInterestRate: 54.0,
    monthlyInterestRate: 4.5,
    termMonths: 4,
    frequency: 'SEMANAL',
    totalInstallments: 16,
    fixedInstallmentAmount: sched4[0].paymentAmount,
    startDate: '2026-09-20',
    status: 'ACTIVO',
    collateralDescription: 'Lote de 3 Máquinas de Coser Industriales Juki DDL-8700',
    collateralEstimatedValue: 3600,
    schedule: sched4,
    documents: initialClients[3].documents,
    notes: 'Microcrédito comercial rotativo para compra de telas.',
    totalInterestExpected: Math.round((loan4TotalExpected - 2500) * 100) / 100,
    totalAmountExpected: loan4TotalExpected,
    totalPaid: Math.round(loan4Paid * 100) / 100,
    outstandingBalance: sched4[2].remainingBalance,
  };

  return [loan1, loan2, loan3, loan4];
}

export const initialLoans: Loan[] = generateSeedLoans();
