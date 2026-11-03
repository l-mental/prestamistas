import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import {
  Client,
  BolivianDepartment,
  ClientAddressDetail,
  ClientPersonalReference,
  ClientSpouseData,
  ClientChangeRequest,
  Loan,
} from '../types';
import { exportClientInfoSheetPDF } from '../utils/pdfGenerator';
import {
  Search,
  UserCheck,
  UserPlus,
  Edit3,
  Printer,
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  MapPin,
  Briefcase,
  Users,
  ShieldCheck,
  Clock,
  Check,
  ChevronRight,
  ArrowLeft,
  X,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '../utils/frenchAmortization';

interface ClientsModuleProps {
  onOpenNewLoanModal?: (preselectedClientId?: string) => void;
  onOpenPaymentModal?: (loan: Loan) => void;
  onOpenContractView?: (loan: Loan) => void;
}

const BOLIVIAN_DEPARTMENTS: { code: BolivianDepartment; name: string }[] = [
  { code: 'LP', name: 'La Paz (LP)' },
  { code: 'CB', name: 'Cochabamba (CB)' },
  { code: 'SC', name: 'Santa Cruz (SC)' },
  { code: 'OR', name: 'Oruro (OR)' },
  { code: 'PT', name: 'Potosí (PT)' },
  { code: 'TJ', name: 'Tarija (TJ)' },
  { code: 'CH', name: 'Chuquisaca (CH)' },
  { code: 'BE', name: 'Beni (BE)' },
  { code: 'PA', name: 'Pando (PA)' },
  { code: 'SE', name: 'Sin Expedición (SE)' },
];

const CAEDEC_OPTIONS = [
  { code: 'G4711', label: 'G4711 - Comercio al por menor en comercios no especializados' },
  { code: 'G4721', label: 'G4721 - Comercio al por menor de alimentos, bebidas y tabaco' },
  { code: 'G4771', label: 'G4771 - Comercio de prendas de vestir y calzado' },
  { code: 'C1010', label: 'C1010 - Elaboración y procesamiento de carne y alimentos' },
  { code: 'C1410', label: 'C1410 - Confección de prendas de vestir' },
  { code: 'H4921', label: 'H4921 - Transporte urbano y suburbano de pasajeros' },
  { code: 'H4923', label: 'H4923 - Transporte de carga por carretera' },
  { code: 'I5610', label: 'I5610 - Actividades de restaurantes y comida al paso' },
  { code: 'S9602', label: 'S9602 - Peluquería y otros tratamientos de belleza' },
  { code: 'A0111', label: 'A0111 - Cultivo de cereales y legumbres' },
  { code: 'OTRO', label: 'OTRO - Otra actividad económica no especificada' },
];

export const ClientsModule: React.FC<ClientsModuleProps> = ({
  onOpenNewLoanModal,
  onOpenPaymentModal,
  onOpenContractView,
}) => {
  const {
    clients,
    loans,
    companySettings,
    currentUser,
    addClient,
    updateClient,
    addClientChangeRequest,
    clientChangeRequests,
  } = useLoanContext();

  // Search state
  const [searchDocNumber, setSearchDocNumber] = useState('12646542131');
  const [searchExpedition, setSearchExpedition] = useState<BolivianDepartment>('LP');
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(() => {
    return clients.find(c => c.documentNumber === '12646542131') || clients[0] || null;
  });

  // Flow views: 'FOUND' | 'REGISTER_WIZARD' | 'EDIT_MODE'
  const [viewMode, setViewMode] = useState<'FOUND' | 'REGISTER_WIZARD' | 'EDIT_MODE'>('FOUND');

  // Selected Loan for inspection modal
  const [inspectedLoan, setInspectedLoan] = useState<Loan | null>(null);

  // Wizard State (Steps 1 to 5)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: General Data
  const [wizDocNumber, setWizDocNumber] = useState('');
  const [wizExpedition, setWizExpedition] = useState<BolivianDepartment>('LP');
  const [wizComplement, setWizComplement] = useState('');
  const [wizPaternal, setWizPaternal] = useState('');
  const [wizMaternal, setWizMaternal] = useState('');
  const [wizMarried, setWizMarried] = useState('');
  const [wizNames, setWizNames] = useState('');
  const [wizDocExpDate, setWizDocExpDate] = useState('2028-12-31');
  const [wizBirthDate, setWizBirthDate] = useState('1988-06-15');
  const [wizGender, setWizGender] = useState<'M' | 'F'>('M');
  const [wizCivilFromId, setWizCivilFromId] = useState<'Soltero(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viudo(a)' | 'Conviviente'>('Casado(a)');
  const [wizCivilDeclared, setWizCivilDeclared] = useState<'Soltero(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viudo(a)' | 'Conviviente'>('Casado(a)');
  const [wizDeclaredActivity, setWizDeclaredActivity] = useState('');

  // Spouse Data (conditional)
  const [wizSpouseName, setWizSpouseName] = useState('');
  const [wizSpouseCI, setWizSpouseCI] = useState('');
  const [wizSpouseExp, setWizSpouseExp] = useState<BolivianDepartment>('LP');
  const [wizSpouseCaedec, setWizSpouseCaedec] = useState('G4711');
  const [wizSpouseActivity, setWizSpouseActivity] = useState('');
  const [wizSpouseSeniority, setWizSpouseSeniority] = useState(12);
  const [wizSpouseSector, setWizSpouseSector] = useState<'Comercio' | 'Servicio' | 'Producción'>('Comercio');

  // Step 2: Addresses
  const [wizHomeDept, setWizHomeDept] = useState<BolivianDepartment>('LP');
  const [wizHomeCity, setWizHomeCity] = useState('La Paz');
  const [wizHomeStreet, setWizHomeStreet] = useState('');
  const [wizHomeNumber, setWizHomeNumber] = useState('');
  const [wizHomeZone, setWizHomeZone] = useState('');
  const [wizHomeHousingType, setWizHomeHousingType] = useState<ClientAddressDetail['housingType']>('Propio');
  const [wizHomeReference, setWizHomeReference] = useState('');
  const [wizHomePhone, setWizHomePhone] = useState('');

  // Business same address checkbox
  const [wizSameAddress, setWizSameAddress] = useState(true);
  const [wizBizStreet, setWizBizStreet] = useState('');
  const [wizBizNumber, setWizBizNumber] = useState('');
  const [wizBizZone, setWizBizZone] = useState('');
  const [wizBizReference, setWizBizReference] = useState('');
  const [wizBizPhone, setWizBizPhone] = useState('');

  // Step 3: Economic Activity
  const [wizCaedec, setWizCaedec] = useState('G4711');
  const [wizActivityDesc, setWizActivityDesc] = useState('');
  const [wizActivitySeniority, setWizActivitySeniority] = useState(24);
  const [wizEconomicSector, setWizEconomicSector] = useState<'Comercio' | 'Servicio' | 'Producción'>('Comercio');

  // Step 4: References
  const [wizRef1Name, setWizRef1Name] = useState('');
  const [wizRef1Rel, setWizRef1Rel] = useState('Vecino');
  const [wizRef1Address, setWizRef1Address] = useState('');
  const [wizRef1Phone, setWizRef1Phone] = useState('');

  const [wizRef2Name, setWizRef2Name] = useState('');
  const [wizRef2Rel, setWizRef2Rel] = useState('Familiar');
  const [wizRef2Address, setWizRef2Address] = useState('');
  const [wizRef2Phone, setWizRef2Phone] = useState('');

  // Step 5: Validation
  const [isClientCreatedSuccess, setIsClientCreatedSuccess] = useState(false);

  // Edit Mode state
  const [editClientData, setEditClientData] = useState<Client | null>(null);
  const [isRequestChangeModalOpen, setIsRequestChangeModalOpen] = useState(false);

  // Solicitud de Cambio de Datos Generales (Imagen 2)
  const [reqPaternal, setReqPaternal] = useState('');
  const [reqMaternal, setReqMaternal] = useState('');
  const [reqMarried, setReqMarried] = useState('');
  const [reqNames, setReqNames] = useState('');
  const [reqDocNumber, setReqDocNumber] = useState('');
  const [reqCivilStatus, setReqCivilStatus] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [changeSubmittedNotice, setChangeSubmittedNotice] = useState(false);

  // Handler for Search
  const handleConsultar = (ciToSearch?: string) => {
    const ci = (ciToSearch || searchDocNumber).trim();
    setHasSearched(true);
    const found = clients.find(
      c => c.documentNumber.replace(/\s+/g, '') === ci.replace(/\s+/g, '')
    );

    if (found) {
      setSelectedClient(found);
      setViewMode('FOUND');
    } else {
      setSelectedClient(null);
      // Pre-fill Step 1 with the queried CI
      setWizDocNumber(ci);
      setWizExpedition(searchExpedition);
      setViewMode('REGISTER_WIZARD');
      setCurrentStep(1);
    }
  };

  // Helper to start editing
  const handleStartEdit = () => {
    if (!selectedClient) return;
    setEditClientData({ ...selectedClient });
    // Preload change request modal fields
    setReqPaternal(selectedClient.paternalLastName || '');
    setReqMaternal(selectedClient.maternalLastName || '');
    setReqMarried(selectedClient.marriedLastName || '');
    setReqNames(selectedClient.firstName || selectedClient.fullName);
    setReqDocNumber(selectedClient.documentNumber);
    setReqCivilStatus(selectedClient.civilStatusDeclared || selectedClient.civilStatus || 'Casado(a)');
    setReqReason('');
    setViewMode('EDIT_MODE');
  };

  // Submit Change Request for General Data (Requires Jefe de Agencia authorization)
  const handleSubmitChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClientData) return;

    if (!reqReason.trim()) {
      alert('Debe ingresar un motivo o justificación formal para solicitar la modificación de Datos Generales.');
      return;
    }

    const changedFields: ClientChangeRequest['changedFields'] = [];

    if (reqPaternal !== (editClientData.paternalLastName || '')) {
      changedFields.push({
        fieldName: 'Apellido Paterno',
        fieldKey: 'paternalLastName',
        oldValue: editClientData.paternalLastName || '',
        newValue: reqPaternal,
        reason: reqReason,
      });
    }

    if (reqMaternal !== (editClientData.maternalLastName || '')) {
      changedFields.push({
        fieldName: 'Apellido Materno',
        fieldKey: 'maternalLastName',
        oldValue: editClientData.maternalLastName || '',
        newValue: reqMaternal,
        reason: reqReason,
      });
    }

    if (reqMarried !== (editClientData.marriedLastName || '')) {
      changedFields.push({
        fieldName: 'Apellido de Casada',
        fieldKey: 'marriedLastName',
        oldValue: editClientData.marriedLastName || '',
        newValue: reqMarried,
        reason: reqReason,
      });
    }

    if (reqNames !== (editClientData.firstName || editClientData.fullName)) {
      changedFields.push({
        fieldName: 'Nombres',
        fieldKey: 'firstName',
        oldValue: editClientData.firstName || editClientData.fullName,
        newValue: reqNames,
        reason: reqReason,
      });
    }

    if (reqDocNumber !== editClientData.documentNumber) {
      changedFields.push({
        fieldName: 'Cédula de Identidad',
        fieldKey: 'documentNumber',
        oldValue: editClientData.documentNumber,
        newValue: reqDocNumber,
        reason: reqReason,
      });
    }

    if (reqCivilStatus !== (editClientData.civilStatusDeclared || '')) {
      changedFields.push({
        fieldName: 'Estado Civil Declarado',
        fieldKey: 'civilStatusDeclared',
        oldValue: editClientData.civilStatusDeclared || '',
        newValue: reqCivilStatus,
        reason: reqReason,
      });
    }

    if (changedFields.length === 0) {
      alert('No se detectaron cambios en los campos respecto a la información actual.');
      return;
    }

    const newReq: ClientChangeRequest = {
      id: `req-${Date.now()}`,
      clientId: editClientData.id,
      clientName: editClientData.fullName,
      clientDocument: editClientData.documentNumber,
      requestedBy: currentUser.fullName,
      requestedAt: new Date().toISOString(),
      status: 'PENDIENTE',
      changedFields,
    };

    addClientChangeRequest(newReq);
    setIsRequestChangeModalOpen(false);
    setChangeSubmittedNotice(true);
    setTimeout(() => setChangeSubmittedNotice(false), 6000);
  };

  // Direct save for Address, Economic Activity & References (Allowed without Jefe de Agencia)
  const handleSavePermittedEdits = () => {
    if (!editClientData) return;
    updateClient(editClientData);
    setSelectedClient(editClientData);
    setViewMode('FOUND');
    alert('Información de Direcciones, Actividad Económica y Referencias actualizada correctamente.');
  };

  // Final Step 5 Wizard Handler: Habilitar Cliente
  const handleHabilitarCliente = () => {
    const newCode = `00${clients.length + 1}`.slice(-3);
    const fullNameConstructed = `${wizPaternal} ${wizMaternal} ${wizNames}`.trim() || `Cliente CI ${wizDocNumber}`;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      clientCode: newCode,
      fullName: fullNameConstructed,
      firstName: wizNames,
      paternalLastName: wizPaternal,
      maternalLastName: wizMaternal,
      marriedLastName: wizMarried,
      documentType: 'CI',
      documentNumber: wizDocNumber,
      documentExpedition: wizExpedition,
      documentComplement: wizComplement,
      idCardExpirationDate: wizDocExpDate,
      birthDate: wizBirthDate,
      gender: wizGender,
      civilStatusFromId: wizCivilFromId,
      civilStatusDeclared: wizCivilDeclared,
      civilStatus: (wizCivilDeclared === 'Casado(a)' ? 'CASADO' : wizCivilDeclared === 'Conviviente' ? 'CONVIVIENTE' : 'SOLTERO') as any,
      declaredActivity: wizDeclaredActivity || 'Comerciante Independiente',
      occupation: wizDeclaredActivity || 'Comerciante',
      monthlyIncome: 850,
      phone: wizHomePhone || '71548792',
      email: `${wizDocNumber}@crediplus.bo`,
      address: `${wizHomeStreet} N° ${wizHomeNumber}, Zona ${wizHomeZone}, ${wizHomeCity}`,
      city: wizHomeCity || 'La Paz',
      registeredBy: currentUser.fullName,
      agency: 'Agencia Central',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      // Addresses
      homeAddress: {
        department: wizHomeDept,
        city: wizHomeCity,
        street: wizHomeStreet,
        number: wizHomeNumber,
        zone: wizHomeZone,
        housingType: wizHomeHousingType,
        reference: wizHomeReference,
        phone: wizHomePhone,
      },
      businessIsSameAddress: wizSameAddress,
      businessAddress: wizSameAddress
        ? {
            department: wizHomeDept,
            city: wizHomeCity,
            street: wizHomeStreet,
            number: wizHomeNumber,
            zone: wizHomeZone,
            housingType: wizHomeHousingType,
            reference: wizHomeReference,
            phone: wizHomePhone,
          }
        : {
            department: wizHomeDept,
            city: wizHomeCity,
            street: wizBizStreet,
            number: wizBizNumber,
            zone: wizBizZone,
            housingType: 'Alquiler',
            reference: wizBizReference,
            phone: wizBizPhone,
          },
      // Economic Activity
      caedecCode: wizCaedec,
      activityDescription: wizActivityDesc,
      activitySeniorityMonths: Number(wizActivitySeniority) || 12,
      economicSector: wizEconomicSector,
      // Spouse
      spouse:
        wizCivilDeclared === 'Casado(a)' || wizCivilDeclared === 'Conviviente'
          ? {
              fullName: wizSpouseName,
              documentNumber: wizSpouseCI,
              documentExpedition: wizSpouseExp,
              caedec: wizSpouseCaedec,
              activity: wizSpouseActivity,
              seniorityMonths: Number(wizSpouseSeniority) || 12,
              sector: wizSpouseSector,
            }
          : undefined,
      // References
      personalReferences: [
        {
          name: wizRef1Name || 'Vecino Referencial 1',
          relationship: wizRef1Rel,
          address: wizRef1Address || 'Misma zona',
          phone: wizRef1Phone || '70123456',
        },
        {
          name: wizRef2Name || 'Familiar Referencial 2',
          relationship: wizRef2Rel,
          address: wizRef2Address || 'Zona Central',
          phone: wizRef2Phone || '70654321',
        },
      ],
    };

    addClient(newClient);
    setSelectedClient(newClient);
    setIsClientCreatedSuccess(true);
    setTimeout(() => {
      setIsClientCreatedSuccess(false);
      setViewMode('FOUND');
    }, 1500);
  };

  // Loans associated with selected client
  const clientLoans = selectedClient ? loans.filter(l => l.clientId === selectedClient.id) : [];

  // Active / pending change requests for this client
  const clientRequests = selectedClient
    ? clientChangeRequests.filter(r => r.clientId === selectedClient.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-slate-900 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>MÓDULO DE CLIENTES & EXPEDIENTES</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Gestión Integral de Clientes (CrediPlus / SATEL)
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Búsqueda por Cédula de Identidad boliviana, flujo secuencial de 5 submódulos para altas nuevas,
              autorizaciones controladas de Datos Generales y emisión de Fichas Oficiales.
            </p>
          </div>

          {/* Quick Demo Preloads */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">C.I. de prueba:</span>
            <button
              onClick={() => {
                setSearchDocNumber('12646542131');
                setSearchExpedition('LP');
                handleConsultar('12646542131');
              }}
              className="px-2.5 py-1 text-xs font-medium rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 transition-colors"
            >
              F. Mostacedo (12646542131)
            </button>
            <button
              onClick={() => {
                setSearchDocNumber('3649854');
                setSearchExpedition('LP');
                handleConsultar('3649854');
              }}
              className="px-2.5 py-1 text-xs font-medium rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 transition-colors"
            >
              M. Sardan (3649854)
            </button>
            <button
              onClick={() => {
                setSearchDocNumber('98765432');
                setSearchExpedition('SC');
                handleConsultar('98765432');
              }}
              className="px-2.5 py-1 text-xs font-medium rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 transition-colors"
            >
              + Alta Nueva (98765432)
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH BOX (Imagen 2: CEDULA DE IDENTIDAD + Botón Consultar) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleConsultar();
          }}
          className="flex flex-col md:flex-row items-center gap-3"
        >
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Cédula de Identidad (C.I.)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchDocNumber}
                  onChange={e => setSearchDocNumber(e.target.value)}
                  placeholder="Ej: 12646542131 o 3649854"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Expedición
              </label>
              <select
                value={searchExpedition}
                onChange={e => setSearchExpedition(e.target.value as BolivianDepartment)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-yellow-400 text-sm font-medium"
              >
                {BOLIVIAN_DEPARTMENTS.map(dept => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full md:w-auto pt-0 md:pt-5">
            <button
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-transform active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>CONSULTAR</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notice for changes submitted */}
      {changeSubmittedNotice && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-yellow-300">Solicitud de Modificación Enviada</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              La solicitud para modificar Datos Generales del cliente fue remitida a la bandeja de autorización
              del Jefe de Agencia. Una vez aprobada, se actualizará automáticamente en la base de datos.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FLOW A: CLIENT FOUND (Image 2)                                  */}
      {/* ============================================================== */}
      {viewMode === 'FOUND' && selectedClient && (
        <div className="space-y-6">
          {/* Client Header Card as seen in Image 2 */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-900/60 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-black bg-blue-700 text-white rounded">
                    Cod. cliente Nro [{selectedClient.clientCode || '001'}]
                  </span>
                  <span className="text-xs text-blue-300 font-semibold">
                    Asesor: [{selectedClient.registeredBy || 'Fernando Limachi Orellana'}]
                  </span>
                  <span className="text-xs text-slate-400">
                    - {selectedClient.agency || 'Agencia Central'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-wide uppercase">
                  Sr(a). [{selectedClient.fullName}]
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span>
                    <strong className="text-yellow-400">C.I.:</strong> {selectedClient.documentNumber}{' '}
                    {selectedClient.documentExpedition || 'LP'}
                  </span>
                  <span>
                    <strong className="text-slate-400">Teléf:</strong> {selectedClient.phone}
                  </span>
                  <span>
                    <strong className="text-slate-400">Actividad:</strong>{' '}
                    {selectedClient.declaredActivity || selectedClient.occupation} ({selectedClient.caedecCode || 'G4711'})
                  </span>
                  <span>
                    <strong className="text-slate-400">Dirección:</strong> {selectedClient.address}
                  </span>
                </div>
              </div>

              {/* Action Buttons: [+ Crear Préstamo], [EDITAR], [IMPRIMIR FICHA] */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {onOpenNewLoanModal && (
                  <button
                    onClick={() => onOpenNewLoanModal(selectedClient.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4 text-yellow-300" />
                    <span>+ Crear Préstamo</span>
                  </button>
                )}

                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-black shadow-sm transition-all active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>EDITAR</span>
                </button>

                <button
                  onClick={() => exportClientInfoSheetPDF(selectedClient, companySettings)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all active:scale-95"
                  title="Descargar Ficha SATEL / CrediPlus en PDF"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>IMPRIMIR FICHA</span>
                </button>
              </div>
            </div>

            {/* Pending change request banner if any */}
            {clientRequests.some(r => r.status === 'PENDIENTE') && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-yellow-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4" />
                  Este cliente tiene una solicitud de modificación de datos pendiente de autorización por el Jefe de Agencia.
                </span>
                <span className="font-bold underline cursor-pointer" onClick={handleStartEdit}>
                  Ver detalle
                </span>
              </div>
            )}
          </div>

          {/* List of Registered Loans for this Client (as shown in Image 2) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-yellow-400" />
                  Créditos Registrados del Cliente ({clientLoans.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Historial de operaciones, saldos vigentes, estados de mora y cronogramas franceses.
                </p>
              </div>
            </div>

            {clientLoans.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400">El cliente aún no cuenta con operaciones de préstamo registradas.</p>
                {onOpenNewLoanModal && (
                  <button
                    onClick={() => onOpenNewLoanModal(selectedClient.id)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-slate-900 text-xs font-bold hover:bg-yellow-500"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Crear Primer Préstamo para este Cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {clientLoans.map(loan => {
                  const isVigente = loan.status === 'ACTIVO';
                  const isCancelado = loan.status === 'PAGADO';
                  const isVencido = loan.status === 'VENCIDO';

                  return (
                    <div
                      key={loan.id}
                      className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black text-sm ${
                            isVencido
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : isCancelado
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-blue-600/20 text-blue-400 border border-blue-600/40'
                          }`}
                        >
                          {isVencido ? '!' : isCancelado ? '✓' : 'Op'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              Op. {loan.loanNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isVencido
                                  ? 'bg-red-500 text-white'
                                  : isCancelado
                                  ? 'bg-slate-700 text-slate-300'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {isVencido ? 'VENCIDO' : isCancelado ? 'CANCELADO' : 'VIGENTE'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>
                              Monto Capital: <strong>{formatCurrency(loan.principalAmount, loan.currency)}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Saldo Insoluto:{' '}
                              <strong
                                className={
                                  isVencido ? 'text-red-400 font-bold' : isCancelado ? 'text-slate-400' : 'text-emerald-400'
                                }
                              >
                                {formatCurrency(loan.outstandingBalance, loan.currency)}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              {loan.totalInstallments} cuotas ({loan.frequency})
                            </span>
                            <span>•</span>
                            <span>Desembolso: {loan.startDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: [VER] and [Cobrar] / [Contrato] */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {onOpenPaymentModal && !isCancelado && (
                          <button
                            onClick={() => onOpenPaymentModal(loan)}
                            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded font-bold text-xs shadow-sm transition-colors"
                          >
                            Cobrar
                          </button>
                        )}

                        {onOpenContractView && (
                          <button
                            onClick={() => onOpenContractView(loan)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-xs border border-slate-700 transition-colors"
                          >
                            Contrato
                          </button>
                        )}

                        <button
                          onClick={() => setInspectedLoan(loan)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VER</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FLOW B: SEQUENTIAL 5-SUBMODULE REGISTRATION WIZARD (Image 2)   */}
      {/* ============================================================== */}
      {viewMode === 'REGISTER_WIZARD' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Alta de Nuevo Cliente
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                Proceso de Registro Secuencial en 5 Submódulos
              </h2>
              <p className="text-xs text-slate-400">
                La cédula consultada <strong className="text-white">{wizDocNumber}</strong> no existe. Complete cada etapa
                para habilitar el cliente en la cartera oficial.
              </p>
            </div>
            <button
              onClick={() => {
                if (clients.length > 0) {
                  setSelectedClient(clients[0]);
                  setViewMode('FOUND');
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cancelar y volver
            </button>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { num: 1, title: 'Datos Generales', icon: UserPlus },
              { num: 2, title: 'Direcciones', icon: MapPin },
              { num: 3, title: 'Actividad Económica', icon: Briefcase },
              { num: 4, title: 'Referencias', icon: Users },
              { num: 5, title: 'Validación', icon: ShieldCheck },
            ].map(step => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all ${
                    isActive
                      ? 'bg-blue-900/60 border-yellow-400 text-white'
                      : isPast
                      ? 'bg-slate-950/70 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive
                        ? 'bg-yellow-400 text-slate-900'
                        : isPast
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? '✓' : step.num}
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] uppercase font-bold tracking-wider leading-none text-slate-400">
                      Paso {step.num}
                    </p>
                    <p className="text-xs font-bold truncate mt-0.5">{step.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUBMODULE 1: DATOS GENERALES */}
          {currentStep === 1 && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-lg text-xs text-blue-200">
                <strong>Submódulo 1:</strong> Ingrese los datos de identidad civil del prestatario conforme al C.I.
                Si el estado civil es Casado o Conviviente, se solicitarán obligatoriamente los datos del cónyuge.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cédula de Identidad *</label>
                  <input
                    type="text"
                    value={wizDocNumber}
                    onChange={e => setWizDocNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Expedido *</label>
                  <select
                    value={wizExpedition}
                    onChange={e => setWizExpedition(e.target.value as BolivianDepartment)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    {BOLIVIAN_DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Complemento / Alfanumérico</label>
                  <input
                    type="text"
                    value={wizComplement}
                    onChange={e => setWizComplement(e.target.value)}
                    placeholder="Ej: 1A (opcional)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Apellido Paterno *</label>
                  <input
                    type="text"
                    value={wizPaternal}
                    onChange={e => setWizPaternal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Apellido Materno *</label>
                  <input
                    type="text"
                    value={wizMaternal}
                    onChange={e => setWizMaternal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Apellido de Casada</label>
                  <input
                    type="text"
                    value={wizMarried}
                    onChange={e => setWizMarried(e.target.value)}
                    placeholder="De ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombres Completos *</label>
                  <input
                    type="text"
                    value={wizNames}
                    onChange={e => setWizNames(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Vencimiento C.I.</label>
                  <input
                    type="date"
                    value={wizDocExpDate}
                    onChange={e => setWizDocExpDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={wizBirthDate}
                    onChange={e => setWizBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Género</label>
                  <select
                    value={wizGender}
                    onChange={e => setWizGender(e.target.value as 'M' | 'F')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estado Civil según C.I.</label>
                  <select
                    value={wizCivilFromId}
                    onChange={e => setWizCivilFromId(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                    <option value="Conviviente">Conviviente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estado Civil Declarado *</label>
                  <select
                    value={wizCivilDeclared}
                    onChange={e => setWizCivilDeclared(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-semibold"
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                    <option value="Conviviente">Conviviente</option>
                  </select>
                </div>
              </div>

              {/* Conditional Spouse Section (Image 2 logic) */}
              <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    Datos del Cónyuge / Conviviente
                  </h4>
                  {wizCivilDeclared === 'Soltero(a)' || wizCivilDeclared === 'Divorciado(a)' || wizCivilDeclared === 'Viudo(a)' ? (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Bloqueado (No aplica para estado civil soltero/divorciado/viudo)
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-bold">
                      Requerido para Casado / Conviviente
                    </span>
                  )}
                </div>

                {wizCivilDeclared === 'Casado(a)' || wizCivilDeclared === 'Conviviente' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Nombre Completo Cónyuge *</label>
                      <input
                        type="text"
                        value={wizSpouseName}
                        onChange={e => setWizSpouseName(e.target.value)}
                        placeholder="Nombres y Apellidos"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">C.I. Cónyuge *</label>
                      <input
                        type="text"
                        value={wizSpouseCI}
                        onChange={e => setWizSpouseCI(e.target.value)}
                        placeholder="Número de CI"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Expedición</label>
                      <select
                        value={wizSpouseExp}
                        onChange={e => setWizSpouseExp(e.target.value as BolivianDepartment)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      >
                        {BOLIVIAN_DEPARTMENTS.map(d => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Actividad Cónyuge</label>
                      <input
                        type="text"
                        value={wizSpouseActivity}
                        onChange={e => setWizSpouseActivity(e.target.value)}
                        placeholder="Ej: Empleada pública / Comercio"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Antigüedad (meses)</label>
                      <input
                        type="number"
                        value={wizSpouseSeniority}
                        onChange={e => setWizSpouseSeniority(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Sector Económico</label>
                      <select
                        value={wizSpouseSector}
                        onChange={e => setWizSpouseSector(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      >
                        <option value="Comercio">Comercio</option>
                        <option value="Servicio">Servicio</option>
                        <option value="Producción">Producción</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Campos inhabilitados automáticamente según normativa de validación civil.
                  </p>
                )}
              </div>

              {/* Botón Siguiente (Bloquea y avanza) */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!wizDocNumber || !wizPaternal || !wizNames) {
                      alert('Por favor complete C.I., Apellido Paterno y Nombres para continuar.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-6 py-2.5 rounded-lg text-sm shadow-md transition-all"
                >
                  <span>SIGUIENTE (bloquea modificación y avanza)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBMODULE 2: DIRECCIONES */}
          {currentStep === 2 && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-lg text-xs text-blue-200">
                <strong>Submódulo 2:</strong> Ingrese la dirección del domicilio permanente y del negocio.
                Active la casilla si el negocio funciona en el mismo domicilio para replicar los datos automáticamente.
              </div>

              {/* Domicilio */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Dirección del Domicilio
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Departamento</label>
                    <select
                      value={wizHomeDept}
                      onChange={e => setWizHomeDept(e.target.value as BolivianDepartment)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    >
                      {BOLIVIAN_DEPARTMENTS.map(d => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Localidad / Ciudad *</label>
                    <input
                      type="text"
                      value={wizHomeCity}
                      onChange={e => setWizHomeCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Zona / Barrio *</label>
                    <input
                      type="text"
                      value={wizHomeZone}
                      onChange={e => setWizHomeZone(e.target.value)}
                      placeholder="Ej: Max Paredes / San Pedro"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">Calle / Avenida *</label>
                    <input
                      type="text"
                      value={wizHomeStreet}
                      onChange={e => setWizHomeStreet(e.target.value)}
                      placeholder="Ej: Av. Buenos Aires esquina Chorolque"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Número de Inmueble</label>
                    <input
                      type="text"
                      value={wizHomeNumber}
                      onChange={e => setWizHomeNumber(e.target.value)}
                      placeholder="Ej: 542 o S/N"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tipo de Vivienda</label>
                    <select
                      value={wizHomeHousingType}
                      onChange={e => setWizHomeHousingType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    >
                      <option value="Propio">Propio</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Anticrético">Anticrético</option>
                      <option value="Alquiler">Alquiler</option>
                      <option value="Cedido">Cedido</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Celular / Teléfono *</label>
                    <input
                      type="text"
                      value={wizHomePhone}
                      onChange={e => setWizHomePhone(e.target.value)}
                      placeholder="Ej: 71548792"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Referencia de Ubicación</label>
                    <input
                      type="text"
                      value={wizHomeReference}
                      onChange={e => setWizHomeReference(e.target.value)}
                      placeholder="Frente a la farmacia / tienda"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Caseta Checkbox (Image 2 Requirement) */}
              <div className="p-3 bg-yellow-400/10 border border-yellow-400/40 rounded-lg flex items-center gap-3">
                <input
                  type="checkbox"
                  id="chkCaseta"
                  checked={wizSameAddress}
                  onChange={e => setWizSameAddress(e.target.checked)}
                  className="w-4 h-4 text-yellow-500 rounded bg-slate-900 border-slate-700 focus:ring-yellow-400"
                />
                <label htmlFor="chkCaseta" className="text-xs font-bold text-yellow-300 cursor-pointer">
                  CASETA SI ES EL NEGOCIO MISMO DOMICILIO YA NO LLENAR NEGOCIO Y JALAR TODA LA INFORMACIÓN
                </label>
              </div>

              {/* Negocio (if not same address) */}
              {!wizSameAddress && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    Dirección Independiente del Negocio
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-300 mb-1">Calle / Puesto / Mercado</label>
                      <input
                        type="text"
                        value={wizBizStreet}
                        onChange={e => setWizBizStreet(e.target.value)}
                        placeholder="Ej: Mercado Rodríguez Puesto 45"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Número / Caseta</label>
                      <input
                        type="text"
                        value={wizBizNumber}
                        onChange={e => setWizBizNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!wizHomeCity || !wizHomeStreet) {
                      alert('Ingrese la ciudad y calle del domicilio para continuar.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-6 py-2.5 rounded-lg text-sm shadow-md transition-all"
                >
                  <span>SIGUIENTE (bloquea modificación y avanza)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBMODULE 3: ACTIVIDAD ECONÓMICA */}
          {currentStep === 3 && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-lg text-xs text-blue-200">
                <strong>Submódulo 3:</strong> Clasifique la actividad económica principal según el catálogo CAEDEC
                y especifique la antigüedad del negocio y sector económico.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Código y Actividad CAEDEC *
                  </label>
                  <select
                    value={wizCaedec}
                    onChange={e => setWizCaedec(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    {CAEDEC_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Descripción Detallada de la Actividad *
                  </label>
                  <textarea
                    rows={2}
                    value={wizActivityDesc}
                    onChange={e => setWizActivityDesc(e.target.value)}
                    placeholder="Ej: Venta de abarrotes, víveres secos y bebidas en puesto fijo de mercado."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Antigüedad en la Actividad (Meses) *
                  </label>
                  <input
                    type="number"
                    value={wizActivitySeniority}
                    onChange={e => setWizActivitySeniority(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Sector Económico *</label>
                  <select
                    value={wizEconomicSector}
                    onChange={e => setWizEconomicSector(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-semibold"
                  >
                    <option value="Comercio">Comercio</option>
                    <option value="Servicio">Servicio</option>
                    <option value="Producción">Producción</option>
                  </select>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!wizActivityDesc) {
                      alert('Por favor ingrese una descripción de la actividad económica.');
                      return;
                    }
                    setCurrentStep(4);
                  }}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-6 py-2.5 rounded-lg text-sm shadow-md transition-all"
                >
                  <span>SIGUIENTE (bloquea modificación y avanza)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBMODULE 4: REFERENCIAS */}
          {currentStep === 4 && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-lg text-xs text-blue-200">
                <strong>Submódulo 4:</strong> Registre dos referencias personales, familiares o comerciales verificables.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ref 1 */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    Referencia 1 (Obligatoria)
                  </h4>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Nombre y Apellido *</label>
                    <input
                      type="text"
                      value={wizRef1Name}
                      onChange={e => setWizRef1Name(e.target.value)}
                      placeholder="Ej: Carmen Quispe Limachi"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Relación / Parentesco</label>
                    <input
                      type="text"
                      value={wizRef1Rel}
                      onChange={e => setWizRef1Rel(e.target.value)}
                      placeholder="Ej: Vecina de puesto / Hermano"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Teléfono / Celular *</label>
                    <input
                      type="text"
                      value={wizRef1Phone}
                      onChange={e => setWizRef1Phone(e.target.value)}
                      placeholder="Ej: 71982345"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Dirección / Zona</label>
                    <input
                      type="text"
                      value={wizRef1Address}
                      onChange={e => setWizRef1Address(e.target.value)}
                      placeholder="Ej: Misma zona / El Alto"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Ref 2 */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    Referencia 2 (Obligatoria)
                  </h4>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Nombre y Apellido *</label>
                    <input
                      type="text"
                      value={wizRef2Name}
                      onChange={e => setWizRef2Name(e.target.value)}
                      placeholder="Ej: Gonzalo Condori Mendoza"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Relación / Parentesco</label>
                    <input
                      type="text"
                      value={wizRef2Rel}
                      onChange={e => setWizRef2Rel(e.target.value)}
                      placeholder="Ej: Proveedor comercial"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Teléfono / Celular *</label>
                    <input
                      type="text"
                      value={wizRef2Phone}
                      onChange={e => setWizRef2Phone(e.target.value)}
                      placeholder="Ej: 76541298"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Dirección / Zona</label>
                    <input
                      type="text"
                      value={wizRef2Address}
                      onChange={e => setWizRef2Address(e.target.value)}
                      placeholder="Ej: Mercado Rodríguez"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!wizRef1Name || !wizRef2Name) {
                      alert('Por favor complete el nombre de las dos referencias personales.');
                      return;
                    }
                    setCurrentStep(5);
                  }}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-6 py-2.5 rounded-lg text-sm shadow-md transition-all"
                >
                  <span>SIGUIENTE (bloquea modificación y avanza)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBMODULE 5: VALIDACIÓN DE REGISTROS */}
          {currentStep === 5 && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Checklist de Validación de los 4 Submódulos Anteriores
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Todos los campos requeridos han sido bloqueados y validados. Confirme para habilitar al cliente
                  y generar su Código Único de Cartera.
                </p>
              </div>

              {/* Validation Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> 1. Datos Generales
                  </span>
                  <p className="text-slate-300">
                    {wizPaternal} {wizMaternal} {wizNames} — C.I.: {wizDocNumber} {wizExpedition}
                  </p>
                  <p className="text-slate-400">Estado Civil: {wizCivilDeclared}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> 2. Direcciones
                  </span>
                  <p className="text-slate-300">
                    {wizHomeStreet} N° {wizHomeNumber}, {wizHomeZone} ({wizHomeCity})
                  </p>
                  <p className="text-slate-400">
                    Negocio en mismo domicilio: {wizSameAddress ? 'SÍ (Caseta)' : 'NO'}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> 3. Actividad Económica
                  </span>
                  <p className="text-slate-300">{wizActivityDesc}</p>
                  <p className="text-slate-400">
                    CAEDEC: {wizCaedec} • Antigüedad: {wizActivitySeniority} meses
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> 4. Referencias
                  </span>
                  <p className="text-slate-300">Ref 1: {wizRef1Name} ({wizRef1Phone})</p>
                  <p className="text-slate-300">Ref 2: {wizRef2Name} ({wizRef2Phone})</p>
                </div>
              </div>

              {/* Assignment Notice */}
              <div className="p-3 bg-blue-900/30 border border-blue-700/40 rounded-lg text-xs text-blue-200 flex items-center justify-between">
                <span>
                  Asignación automática a la cartera del Asesor:{' '}
                  <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.agency})
                </span>
                <span className="font-bold text-yellow-400">
                  Código Cliente Proyectado: 00{clients.length + 1}
                </span>
              </div>

              {/* Botón Habilitar Cliente (Imagen 2) */}
              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={handleHabilitarCliente}
                  disabled={isClientCreatedSuccess}
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black px-8 py-3 rounded-xl text-base shadow-xl transition-transform active:scale-95"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>BOTON HABILITAR CLIENTE</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* FLOW C: EDIT CLIENT FICHA (Image 2 Rules)                       */}
      {/* ============================================================== */}
      {viewMode === 'EDIT_MODE' && editClientData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Edición de Ficha de Cliente
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                Modificación de Datos: [{editClientData.fullName}] (Cod. {editClientData.clientCode || '001'})
              </h2>
              <p className="text-xs text-slate-400">
                Los submódulos 2, 3 y 4 se modifican libremente. El submódulo 1 (Datos Generales) requiere solicitud
                y aprobación del Jefe de Agencia.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportClientInfoSheetPDF(editClientData, companySettings)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>IMPRIMIR FICHA DEL CLIENTE</span>
              </button>
              <button
                onClick={() => setViewMode('FOUND')}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Volver
              </button>
            </div>
          </div>

          {/* Submodule 1: DATOS GENERALES (Requires Authorization) */}
          <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  1. DATOS GENERALES (¿Si Existen cambios?)
                </h4>
                <p className="text-xs text-slate-300">
                  Por seguridad institucional, los cambios en C.I., Apellidos, Nombres y Estado Civil deben ser
                  revisados y autorizados por el Jefe de Agencia.
                </p>
              </div>

              <button
                onClick={() => setIsRequestChangeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-black shadow-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Solicitar Cambios</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Cédula:</span>
                <strong>{editClientData.documentNumber} {editClientData.documentExpedition}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Apellidos:</span>
                <strong>{editClientData.paternalLastName} {editClientData.maternalLastName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Nombres:</span>
                <strong>{editClientData.firstName || editClientData.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Estado Civil:</span>
                <strong>{editClientData.civilStatusDeclared || editClientData.civilStatus}</strong>
              </div>
            </div>
          </div>

          {/* Submodule 2: DIRECCIONES (Free modification) */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                2. DIRECCIONES (Modificación Libre)
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300">
                Acceso directo asesor
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Localidad / Ciudad</label>
                <input
                  type="text"
                  value={editClientData.homeAddress?.city || ''}
                  onChange={e =>
                    setEditClientData({
                      ...editClientData,
                      homeAddress: {
                        ...(editClientData.homeAddress || {
                          department: 'LP',
                          city: '',
                          street: '',
                          number: '',
                          zone: '',
                          housingType: 'Propio',
                          reference: '',
                          phone: '',
                        }),
                        city: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Zona / Barrio</label>
                <input
                  type="text"
                  value={editClientData.homeAddress?.zone || ''}
                  onChange={e =>
                    setEditClientData({
                      ...editClientData,
                      homeAddress: {
                        ...(editClientData.homeAddress || {
                          department: 'LP',
                          city: '',
                          street: '',
                          number: '',
                          zone: '',
                          housingType: 'Propio',
                          reference: '',
                          phone: '',
                        }),
                        zone: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Calle / Avenida</label>
                <input
                  type="text"
                  value={editClientData.homeAddress?.street || editClientData.address}
                  onChange={e => {
                    const newStreet = e.target.value;
                    setEditClientData({
                      ...editClientData,
                      address: newStreet,
                      homeAddress: {
                        ...(editClientData.homeAddress || {
                          department: 'LP',
                          city: '',
                          street: '',
                          number: '',
                          zone: '',
                          housingType: 'Propio',
                          reference: '',
                          phone: '',
                        }),
                        street: newStreet,
                      },
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submodule 3: ACTIVIDAD ECONÓMICA (Free modification) */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                3. ACTIVIDAD ECONÓMICA (Modificación Libre)
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300">
                Acceso directo asesor
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">CAEDEC</label>
                <select
                  value={editClientData.caedecCode || 'G4711'}
                  onChange={e =>
                    setEditClientData({
                      ...editClientData,
                      caedecCode: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                >
                  {CAEDEC_OPTIONS.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-300 mb-1">Descripción de Actividad</label>
                <input
                  type="text"
                  value={editClientData.activityDescription || editClientData.declaredActivity || ''}
                  onChange={e =>
                    setEditClientData({
                      ...editClientData,
                      activityDescription: e.target.value,
                      declaredActivity: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submodule 4: REFERENCIAS (Free modification) */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                4. REFERENCIAS PERSONALES (Modificación Libre)
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300">
                Acceso directo asesor
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(editClientData.personalReferences || []).map((ref, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-yellow-400">Referencia #{idx + 1}</span>
                  <input
                    type="text"
                    value={ref.name}
                    onChange={e => {
                      const newRefs = [...(editClientData.personalReferences || [])];
                      newRefs[idx] = { ...newRefs[idx], name: e.target.value };
                      setEditClientData({ ...editClientData, personalReferences: newRefs });
                    }}
                    placeholder="Nombre completo"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ref.relationship}
                      onChange={e => {
                        const newRefs = [...(editClientData.personalReferences || [])];
                        newRefs[idx] = { ...newRefs[idx], relationship: e.target.value };
                        setEditClientData({ ...editClientData, personalReferences: newRefs });
                      }}
                      placeholder="Relación"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
                    />
                    <input
                      type="text"
                      value={ref.phone}
                      onChange={e => {
                        const newRefs = [...(editClientData.personalReferences || [])];
                        newRefs[idx] = { ...newRefs[idx], phone: e.target.value };
                        setEditClientData({ ...editClientData, personalReferences: newRefs });
                      }}
                      placeholder="Celular"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Action for Submodules 2, 3, 4 */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-800">
            <button
              onClick={() => setViewMode('FOUND')}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancelar
            </button>

            <button
              onClick={handleSavePermittedEdits}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-sm font-black shadow-md transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>ACTUALIZAR INFORMACIÓN</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: COMPARATIVO SOLICITAR CAMBIOS DATOS GENERALES (Image 2) */}
      {/* ============================================================== */}
      {isRequestChangeModalOpen && editClientData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">
                  Control de Modificación Oficial
                </span>
                <h3 className="text-lg font-bold text-white">
                  Solicitud de Modificación de Datos Generales
                </h3>
              </div>
              <button
                onClick={() => setIsRequestChangeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Complete la casilla de modificación para los campos que requieran corrección y registre el
              motivo formal. El Jefe de Agencia recibirá la solicitud para su aprobación en su bandeja.
            </p>

            <form onSubmit={handleSubmitChangeRequest} className="space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-3">Campo</th>
                      <th className="p-3">Información Actual</th>
                      <th className="p-3">Casilla de Modificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-white">Apellido Paterno</td>
                      <td className="p-3 text-slate-400">{editClientData.paternalLastName || '-'}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={reqPaternal}
                          onChange={e => setReqPaternal(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:border-yellow-400"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Apellido Materno</td>
                      <td className="p-3 text-slate-400">{editClientData.maternalLastName || '-'}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={reqMaternal}
                          onChange={e => setReqMaternal(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:border-yellow-400"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Nombres</td>
                      <td className="p-3 text-slate-400">{editClientData.firstName || editClientData.fullName}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={reqNames}
                          onChange={e => setReqNames(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:border-yellow-400"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Cédula de Identidad</td>
                      <td className="p-3 text-slate-400">{editClientData.documentNumber}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={reqDocNumber}
                          onChange={e => setReqDocNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:border-yellow-400"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Estado Civil</td>
                      <td className="p-3 text-slate-400">
                        {editClientData.civilStatusDeclared || editClientData.civilStatus}
                      </td>
                      <td className="p-3">
                        <select
                          value={reqCivilStatus}
                          onChange={e => setReqCivilStatus(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
                        >
                          <option value="Soltero(a)">Soltero(a)</option>
                          <option value="Casado(a)">Casado(a)</option>
                          <option value="Divorciado(a)">Divorciado(a)</option>
                          <option value="Viudo(a)">Viudo(a)</option>
                          <option value="Conviviente">Conviviente</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Justification Textarea */}
              <div>
                <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">
                  Motivo de Modificación (Justificación Obligatoria) *
                </label>
                <textarea
                  rows={3}
                  value={reqReason}
                  onChange={e => setReqReason(e.target.value)}
                  placeholder="Describa el motivo, ej: Corrección de error tipográfico en certificado de nacimiento o renovación de C.I. por matrimonio."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestChangeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-xs shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Solicitud a Jefe de Agencia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: INSPECCIONAR PRESTAMO [VER] (Cronograma Francés)         */}
      {/* ============================================================== */}
      {inspectedLoan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase">
                  Detalle de Operación Crediticia
                </span>
                <h3 className="text-lg font-bold text-white">
                  Crédito N° {inspectedLoan.loanNumber} — Plan de Pagos Francés
                </h3>
              </div>
              <button onClick={() => setInspectedLoan(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loan Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Monto Capital:</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(inspectedLoan.principalAmount, inspectedLoan.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Saldo Restante:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(inspectedLoan.outstandingBalance, inspectedLoan.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Tasa Mensual:</span>
                <span className="text-sm font-bold text-white">{inspectedLoan.monthlyInterestRate}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estado Operativo:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    inspectedLoan.status === 'VENCIDO'
                      ? 'bg-red-500 text-white'
                      : inspectedLoan.status === 'PAGADO'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {inspectedLoan.status}
                </span>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Cuota</th>
                    <th className="p-2.5">Vencimiento</th>
                    <th className="p-2.5 text-right">Cuota Fija</th>
                    <th className="p-2.5 text-right">Capital</th>
                    <th className="p-2.5 text-right">Interés</th>
                    <th className="p-2.5 text-right">Saldo</th>
                    <th className="p-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {inspectedLoan.schedule.map(inst => (
                    <tr key={inst.number} className="hover:bg-slate-800/50">
                      <td className="p-2.5 font-bold">#{inst.number}</td>
                      <td className="p-2.5">{inst.dueDate}</td>
                      <td className="p-2.5 text-right font-medium">
                        {formatCurrency(inst.paymentAmount, inspectedLoan.currency)}
                      </td>
                      <td className="p-2.5 text-right text-slate-400">
                        {formatCurrency(inst.principalAmount, inspectedLoan.currency)}
                      </td>
                      <td className="p-2.5 text-right text-slate-400">
                        {formatCurrency(inst.interestAmount, inspectedLoan.currency)}
                      </td>
                      <td className="p-2.5 text-right font-bold text-white">
                        {formatCurrency(inst.remainingBalance, inspectedLoan.currency)}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            inst.status === 'PAGADA'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : inst.status === 'VENCIDA'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {onOpenPaymentModal && inspectedLoan.status !== 'PAGADO' && (
                <button
                  onClick={() => {
                    const l = inspectedLoan;
                    setInspectedLoan(null);
                    onOpenPaymentModal(l);
                  }}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg font-bold text-xs shadow-md"
                >
                  Cobrar Cuota
                </button>
              )}
              <button
                onClick={() => setInspectedLoan(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
