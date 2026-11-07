import { Client, CompanySettings, ExchangeRate, Loan, SystemUser, ClientChangeRequest } from '../types';
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

// System Users (Jefe de Agencia vs Asesor de Préstamos - Imagen 1)
export const initialUsers: SystemUser[] = [
  {
    id: 'usr-001',
    username: 'admin',
    fullName: 'Lic. Alejandro Morales Rivera',
    role: 'JEFE_AGENCIA',
    agency: 'Agencia Central',
    email: 'admin@crediplus.bo',
    phone: '+591 2 244 5566',
    isActive: true,
    isLocked: false,
    password: 'admin',
    createdAt: '2026-01-10',
    // Admin no necesita token para iniciar sesión
  },
  {
    id: 'usr-002',
    username: 'asesor.flimachi',
    fullName: 'Fernando Limachi Orellana',
    role: 'ASESOR_PRESTAMOS',
    agency: 'Agencia Central',
    email: 'flimachi@crediplus.bo',
    phone: '+591 706 88210',
    isActive: true,
    isLocked: false,
    password: '123',
    accessToken: 'TOK-7791', // Token generado por el Admin/Jefe
    createdAt: '2026-02-01',
  },
  {
    id: 'usr-003',
    username: 'asesor.cloza',
    fullName: 'Carlos Loza Quinteros',
    role: 'ASESOR_PRESTAMOS',
    agency: 'Agencia El Alto',
    email: 'cloza@crediplus.bo',
    phone: '+591 712 33490',
    isActive: true,
    isLocked: true, // Asesor bloqueado: Jefe puede reiniciar y desbloquear
    password: '123',
    accessToken: 'TOK-4520',
    createdAt: '2026-03-15',
  },
];

// Solicitudes de Modificación de Datos de Clientes (Imagen 2)
export const initialClientChangeRequests: ClientChangeRequest[] = [
  {
    id: 'req-001',
    clientId: 'cli-mostacedo',
    clientName: 'Fernando Mostacedo Ordoñez',
    ci: '12646542131',
    requestedByUserId: 'usr-002',
    requestedByUserName: 'Fernando Limachi Orellana',
    requestDate: '2026-11-02 10:30',
    status: 'PENDIENTE',
    reason: 'Cliente actualizó su estado civil a Casado y presentó nuevo certificado comercial en SEGIP.',
    changedFields: [
      {
        fieldKey: 'maritalStatusDeclared',
        fieldName: 'Estado Civil Declarado por Cliente',
        currentValue: 'SOLTERO(A)',
        proposedValue: 'CASADO(A)',
      },
      {
        fieldKey: 'occupation',
        fieldName: 'Actividad / Ocupación Declarada',
        currentValue: 'Comerciante Minorista',
        proposedValue: 'Comerciante Distribuidor Mayorista',
      },
    ],
  },
  {
    id: 'req-002',
    clientId: 'cli-mercedes',
    clientName: 'SARDAN AOIZ VDA. DE AMEZAGA MERCEDES',
    ci: '3649854',
    requestedByUserId: 'usr-002',
    requestedByUserName: 'Fernando Limachi Orellana',
    requestDate: '2026-10-20 14:15',
    status: 'AUTORIZADO',
    reviewedByUserId: 'usr-001',
    reviewedByUserName: 'Lic. Alejandro Morales Rivera',
    reviewDate: '2026-10-21 09:30',
    reviewNotes: 'Aprobado de conformidad con verificación domiciliaria realizada.',
    reason: 'Ampliación de vigencia de cédula de identidad conforme a renovación en SEGIP.',
    changedFields: [
      {
        fieldKey: 'ciExpirationDate',
        fieldName: 'Fecha de Expiración CI',
        currentValue: '2024-04-22',
        proposedValue: '2031-04-22',
      },
    ],
  },
];

export const initialClients: Client[] = [
  // 1. Cliente Fernando Mostacedo Ordoñez (Ejemplo exacto de Imagen 2)
  {
    id: 'cli-mostacedo',
    clientCode: '001',
    fullName: 'Fernando Mostacedo Ordoñez',
    paternalSurname: 'Mostacedo',
    maternalSurname: 'Ordoñez',
    firstName: 'Fernando',
    documentType: 'CI',
    documentNumber: '12646542131',
    ciExpedition: 'LP',
    ciExpirationDate: '2030-05-18',
    birthDate: '1982-11-14',
    gender: 'MASCULINO',
    maritalStatusCi: 'SOLTERO(A)',
    maritalStatusDeclared: 'SOLTERO(A)',
    phone: '+591 715 44920',
    email: 'fmostacedo@comercial.bo',
    address: 'Av. Buenos Aires N° 1420, Zona Max Paredes',
    city: 'La Paz',
    occupation: 'Comerciante Mayorista Textil',
    monthlyIncome: 18500,
    registeredBy: 'Fernando Limachi Orellana',
    agency: 'Agencia Central',
    registrationDate: '2025-03-12',
    solicitudeNumber: '1264654',
    status: 'HABILITADO',
    homeAddress: {
      locality: 'La Paz',
      street: 'Av. Buenos Aires',
      number: '1420',
      neighborhood: 'Zona Max Paredes',
      housingType: 'Propio',
      locationReference: 'Frente a galería Comercial Las Rosas',
      cellphone: '71544920',
    },
    sameAddressForBusiness: true,
    caedecCode: '52321',
    activityDescription: 'Venta al por mayor de prendas de vestir y tejidos',
    activitySeniorityMonths: 48,
    economicSector: 'Comercio',
    references: [
      {
        fullName: 'JUAN CARLOS TITO CONDORI',
        relationship: 'COMERCIAL',
        address: 'Calle Illampu N° 850, La Paz',
        phone: '76299102',
      },
      {
        fullName: 'MARINA APAZA DE MAMANI',
        relationship: 'VECINO',
        address: 'Av. Buenos Aires N° 1435, La Paz',
        phone: '70133481',
      },
    ],
    documents: [
      {
        id: 'doc-m1',
        title: 'Cédula de Identidad (CI) Fernando Mostacedo',
        type: 'DNI_FRONT',
        fileUrl: createSvgDoc('CÉDULA DE IDENTIDAD (CI)', '#1e3a8a', 'CI BOLIVIA 12646542131'),
        fileName: 'ci_mostacedo.png',
        uploadDate: '2025-03-12',
        fileSize: '1.2 MB',
      },
      {
        id: 'doc-m2',
        title: 'Licencia de Funcionamiento Alcaldía GAMLP',
        type: 'INGRESOS',
        fileUrl: createSvgDoc('LICENCIA DE ACTIVIDAD ECONÓMICA', '#0284c7', 'GAMLP'),
        fileName: 'licencia_comercial.pdf',
        uploadDate: '2025-03-12',
        fileSize: '2.8 MB',
      },
    ],
  },
  // 2. Cliente SARDAN AOIZ VDA. DE AMEZAGA MERCEDES (Ficha oficial Imagen 2)
  {
    id: 'cli-mercedes',
    clientCode: '922744',
    solicitudeNumber: '3649854',
    fullName: 'SARDAN AOIZ VDA. DE AMEZAGA MERCEDES',
    paternalSurname: 'Sardan',
    maternalSurname: 'Aoiz',
    marriedSurname: 'Vda. de Amezaga',
    firstName: 'Mercedes',
    documentType: 'CI',
    documentNumber: '3649854',
    ciExpedition: 'CB',
    ciExpirationDate: '2031-04-22',
    birthDate: '1975-09-24',
    gender: 'FEMENINO',
    maritalStatusCi: 'VIUDO(A)',
    maritalStatusDeclared: 'VIUDO(A)',
    phone: '+591 4 456 7890',
    email: 'mercedes.sardan@gmail.bo',
    address: 'Calle Demetrio Canelas Nro 105, Zona El Morro',
    city: 'Cochabamba',
    occupation: 'Comerciante - Tienda de Barrio',
    monthlyIncome: 9200,
    registeredBy: 'LIMACHI ORELLANA FERNANDO',
    agency: 'Agencia Central',
    registrationDate: '20/07/2022',
    status: 'HABILITADO',
    homeAddress: {
      locality: 'Cochabamba',
      street: 'Calle Demetrio Canelas',
      number: '105',
      neighborhood: 'Zona El Morro',
      housingType: 'Propio',
      locationReference: 'A dos cuadras del templo',
      cellphone: '75788510',
    },
    sameAddressForBusiness: true,
    caedecCode: '51329',
    activityDescription: 'Tienda de Barrio y Abarrotes',
    activitySeniorityMonths: 17,
    economicSector: 'Comercio',
    references: [
      {
        fullName: 'ANACLETO FIGUEROA',
        relationship: 'VECINO',
        address: 'CALLE DEMETRIO CANELAS S/N, ZONA EL MORRO',
        phone: 'CEL: 73987164',
      },
      {
        fullName: 'SANDRA AGUILAR',
        relationship: 'VECINO',
        address: 'CALLE DEMETRIO CANELAS S/N, ZONA EL MORRO',
        phone: 'CEL: 71948537',
      },
    ],
    documents: [
      {
        id: 'doc-s1',
        title: 'Cédula de Identidad (CI) Mercedes Sardan',
        type: 'DNI_FRONT',
        fileUrl: createSvgDoc('CÉDULA DE IDENTIDAD (CI)', '#1e3a8a', 'CI BOLIVIA 3649854'),
        fileName: 'ci_mercedes_sardan.png',
        uploadDate: '2022-07-20',
        fileSize: '1.3 MB',
      },
    ],
  },
  {
    id: 'cli-001',
    clientCode: 'CLI-001',
    fullName: 'Roberto Carlos Mendoza Silva',
    paternalSurname: 'Mendoza',
    maternalSurname: 'Silva',
    firstName: 'Roberto Carlos',
    documentType: 'CI',
    documentNumber: '4789123-LP',
    ciExpedition: 'LP',
    ciExpirationDate: '2028-11-10',
    birthDate: '1985-05-20',
    gender: 'MASCULINO',
    maritalStatusCi: 'CASADO(A)',
    maritalStatusDeclared: 'CASADO(A)',
    phone: '+591 706 34155',
    email: 'rmendoza@comercial.bo',
    address: 'Av. Ballivián 1250, Calacoto',
    city: 'La Paz',
    occupation: 'Comerciante Minorista',
    monthlyIncome: 8500,
    registeredBy: 'Fernando Limachi Orellana',
    agency: 'Agencia Central',
    registrationDate: '2026-08-10',
    status: 'HABILITADO',
    homeAddress: {
      locality: 'La Paz',
      street: 'Av. Ballivián',
      number: '1250',
      neighborhood: 'Calacoto',
      housingType: 'Propio',
      locationReference: 'Calle 21 Calacoto',
      cellphone: '70634155',
    },
    sameAddressForBusiness: true,
    caedecCode: '52110',
    activityDescription: 'Comercio Minorista de Abarrotes',
    activitySeniorityMonths: 36,
    economicSector: 'Comercio',
    spouse: {
      fullName: 'Maritza Silva Valdivia',
      ci: '4098712-LP',
      caedec: '52110',
      activity: 'Comercio',
      seniorityMonths: 24,
      economicSector: 'Comercio Minorista',
    },
    references: [
      {
        fullName: 'GONZALO VALDIVIA PÉREZ',
        relationship: 'FAMILIAR',
        address: 'Calle 18 de Calacoto N° 340',
        phone: '77299104',
      },
      {
        fullName: 'TERESA CONDORI MAMANI',
        relationship: 'COMERCIAL',
        address: 'Av. Ballivián N° 1220',
        phone: '70611299',
      },
    ],
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

  // 5. Préstamos de Fernando Mostacedo Ordoñez (Imagen 2)
  // 5.1 Crédito Operación 01213213 - Saldo Bs 15,000 - Vigente
  const schedM1 = generateFrenchSchedule({
    principal: 25000,
    monthlyInterestRatePercent: 3.0,
    termPeriods: 10,
    frequency: 'MENSUAL',
    startDate: '2026-05-10',
    insuranceOrMonthlyFee: 20,
  });
  schedM1[0].status = 'PAGADA';
  schedM1[0].paidAmount = schedM1[0].paymentAmount;
  schedM1[1].status = 'PAGADA';
  schedM1[1].paidAmount = schedM1[1].paymentAmount;
  schedM1[2].status = 'PAGADA';
  schedM1[2].paidAmount = schedM1[2].paymentAmount;
  schedM1[3].status = 'PAGADA';
  schedM1[3].paidAmount = schedM1[3].paymentAmount;

  const loanMostacedo1: Loan = {
    id: 'loan-m-01',
    loanNumber: '01213213',
    clientId: 'cli-mostacedo',
    clientName: 'Fernando Mostacedo Ordoñez',
    clientDocument: 'CI 12646542131',
    principalAmount: 25000,
    currency: 'BOB',
    annualInterestRate: 36.0,
    monthlyInterestRate: 3.0,
    termMonths: 10,
    frequency: 'MENSUAL',
    totalInstallments: 10,
    fixedInstallmentAmount: schedM1[0].paymentAmount,
    startDate: '2026-05-10',
    status: 'ACTIVO',
    collateralDescription: 'Garantía Personal y Pagaré Mercantil',
    collateralEstimatedValue: 35000,
    schedule: schedM1,
    documents: initialClients[0].documents,
    notes: 'Crédito vigente al día con buen comportamiento de pago.',
    totalInterestExpected: 4200,
    totalAmountExpected: 29200,
    totalPaid: 10000,
    outstandingBalance: 15000,
  };

  // 5.2 Crédito Operación 01654654654 - Saldo Bs 00.00 - Cancelado
  const schedM2 = generateFrenchSchedule({
    principal: 10000,
    monthlyInterestRatePercent: 3.5,
    termPeriods: 6,
    frequency: 'MENSUAL',
    startDate: '2025-06-15',
    insuranceOrMonthlyFee: 15,
  });
  schedM2.forEach((s, idx) => {
    s.status = 'PAGADA';
    s.paidAmount = s.paymentAmount;
    s.paidDate = `2025-0${7 + idx}-15`;
    s.remainingBalance = 0;
  });

  const loanMostacedo2: Loan = {
    id: 'loan-m-02',
    loanNumber: '01654654654',
    clientId: 'cli-mostacedo',
    clientName: 'Fernando Mostacedo Ordoñez',
    clientDocument: 'CI 12646542131',
    principalAmount: 10000,
    currency: 'BOB',
    annualInterestRate: 42.0,
    monthlyInterestRate: 3.5,
    termMonths: 6,
    frequency: 'MENSUAL',
    totalInstallments: 6,
    fixedInstallmentAmount: schedM2[0].paymentAmount,
    startDate: '2025-06-15',
    status: 'PAGADO',
    collateralDescription: 'Pagaré a la orden cancelado',
    collateralEstimatedValue: 12000,
    schedule: schedM2,
    documents: initialClients[0].documents,
    notes: 'Crédito cancelado en su totalidad satisfactoriamente.',
    totalInterestExpected: 1800,
    totalAmountExpected: 11800,
    totalPaid: 11800,
    outstandingBalance: 0,
  };

  // 5.3 Crédito Operación 03546445 - Saldo Bs 11,500 - Vencido
  let schedM3 = generateFrenchSchedule({
    principal: 18000,
    monthlyInterestRatePercent: 4.0,
    termPeriods: 8,
    frequency: 'MENSUAL',
    startDate: '2026-03-20',
    insuranceOrMonthlyFee: 20,
  });
  schedM3[0].status = 'PAGADA';
  schedM3[0].paidAmount = schedM3[0].paymentAmount;
  schedM3[1].status = 'PAGADA';
  schedM3[1].paidAmount = schedM3[1].paymentAmount;
  schedM3 = recalculateOverdue(schedM3, today, 0.15, 2);

  const loanMostacedo3: Loan = {
    id: 'loan-m-03',
    loanNumber: '03546445',
    clientId: 'cli-mostacedo',
    clientName: 'Fernando Mostacedo Ordoñez',
    clientDocument: 'CI 12646542131',
    principalAmount: 18000,
    currency: 'BOB',
    annualInterestRate: 48.0,
    monthlyInterestRate: 4.0,
    termMonths: 8,
    frequency: 'MENSUAL',
    totalInstallments: 8,
    fixedInstallmentAmount: schedM3[0].paymentAmount,
    startDate: '2026-03-20',
    status: 'VENCIDO',
    collateralDescription: 'Prenda Mercantil Inventario Almacén',
    collateralEstimatedValue: 22000,
    schedule: schedM3,
    documents: initialClients[0].documents,
    notes: 'Crédito con cuota vencida. Requiere gestión de cobro.',
    totalInterestExpected: 3600,
    totalAmountExpected: 21600,
    totalPaid: 6500,
    outstandingBalance: 11500,
  };

  // 6. Préstamo Mercedes Sardan
  const schedMerc = generateFrenchSchedule({
    principal: 20000,
    monthlyInterestRatePercent: 3.0,
    termPeriods: 12,
    frequency: 'MENSUAL',
    startDate: '2026-04-15',
    insuranceOrMonthlyFee: 25,
  });
  schedMerc[0].status = 'PAGADA';
  schedMerc[0].paidAmount = schedMerc[0].paymentAmount;
  schedMerc[1].status = 'PAGADA';
  schedMerc[1].paidAmount = schedMerc[1].paymentAmount;

  const loanMercedes: Loan = {
    id: 'loan-merc-01',
    loanNumber: 'PRE-2022-922',
    clientId: 'cli-mercedes',
    clientName: 'SARDAN AOIZ VDA. DE AMEZAGA MERCEDES',
    clientDocument: 'CI 3649854',
    principalAmount: 20000,
    currency: 'BOB',
    annualInterestRate: 36.0,
    monthlyInterestRate: 3.0,
    termMonths: 12,
    frequency: 'MENSUAL',
    totalInstallments: 12,
    fixedInstallmentAmount: schedMerc[0].paymentAmount,
    startDate: '2026-04-15',
    status: 'ACTIVO',
    collateralDescription: 'Inventario de Tienda de Barrio y fianza vecinal',
    collateralEstimatedValue: 30000,
    schedule: schedMerc,
    documents: initialClients[1].documents,
    notes: 'Cliente puntual en pagos de cuotas mensuales.',
    totalInterestExpected: 3800,
    totalAmountExpected: 23800,
    totalPaid: 3800,
    outstandingBalance: 16200,
  };

  return [loanMostacedo1, loanMostacedo2, loanMostacedo3, loanMercedes, loan1, loan2, loan3, loan4];
}

export const initialLoans: Loan[] = generateSeedLoans();
