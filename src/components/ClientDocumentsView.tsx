import React, { useState } from 'react';
import {
  FolderOpen,
  UploadCloud,
  FileImage,
  FileText,
  Search,
  Plus,
  Trash2,
  Eye,
  Download,
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CheckCircle,
  X,
  ZoomIn,
} from 'lucide-react';
import { Client, DocumentAttachment } from '../types';
import { useLoanContext } from '../context/LoanContext';

interface ClientDocumentsViewProps {
  initialClientId?: string;
}

export const ClientDocumentsView: React.FC<ClientDocumentsViewProps> = ({ initialClientId }) => {
  const { clients, addDocumentToClient, deleteDocumentFromClient, addClient } = useLoanContext();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || (clients[0]?.id || '')
  );

  const [searchClient, setSearchClient] = useState('');
  const [activeTab, setActiveTab] = useState<'DOCUMENTOS' | 'DATOS_CLIENTE'>('DOCUMENTOS');

  // Upload modal state
  const [isUploading, setIsUploading] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentAttachment['type']>('DNI_FRONT');
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Zoom / Lightbox modal state
  const [lightboxDoc, setLightboxDoc] = useState<DocumentAttachment | null>(null);

  // New Client modal state
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    fullName: '',
    documentType: 'DNI' as const,
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lima',
    occupation: '',
    monthlyIncome: 3000,
    guarantorName: '',
    guarantorDoc: '',
    guarantorPhone: '',
  });

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const filteredClients = clients.filter(c =>
    c.fullName.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.documentNumber.includes(searchClient)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewFileName(file.name);
    if (!newDocTitle) {
      setNewDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !previewFileUrl) return;

    const newDoc: DocumentAttachment = {
      id: `doc-${Date.now()}`,
      title: newDocTitle || 'Documento Adjunto',
      type: newDocType,
      fileUrl: previewFileUrl,
      fileName: newFileName || 'archivo_adjunto.png',
      uploadDate: new Date().toISOString().slice(0, 10),
      fileSize: '1.5 MB',
    };

    addDocumentToClient(selectedClient.id, newDoc);
    setIsUploading(false);
    setNewDocTitle('');
    setPreviewFileUrl(null);
    setNewFileName('');
  };

  const handleCreateNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cli-${Date.now()}`;
    const newClient: Client = {
      ...newClientForm,
      id,
      documents: [],
    };
    addClient(newClient);
    setSelectedClientId(id);
    setIsNewClientModalOpen(false);
  };

  const getDocTypeBadge = (type: DocumentAttachment['type']) => {
    switch (type) {
      case 'DNI_FRONT':
      case 'DNI_BACK':
        return { label: 'Identificación DNI', color: 'bg-blue-100 text-blue-900 border border-blue-200' };
      case 'GARANTIA_FOTO':
        return { label: 'Garantía / Prenda', color: 'bg-yellow-100 text-amber-900 border border-yellow-300' };
      case 'INGRESOS':
        return { label: 'Sustento Ingresos', color: 'bg-blue-50 text-blue-800 border border-blue-200' };
      case 'RECIBO_SERVICIO':
        return { label: 'Recibo Servicios', color: 'bg-amber-50 text-amber-900 border border-amber-200' };
      case 'PAGARE':
        return { label: 'Pagaré Notarial', color: 'bg-slate-100 text-slate-900 border border-slate-300 font-bold' };
      default:
        return { label: 'Expediente', color: 'bg-slate-100 text-slate-800' };
    }
  };

  if (!selectedClient) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500 text-xs">No hay clientes registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <FolderOpen className="w-5 h-5 text-blue-800" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Expedientes Digitales &amp; Carga de Documentos (KYC)
            </h2>
            <p className="text-xs text-slate-500">
              Almacena fotografías de DNI, sustento de ingresos, fotos de garantías prendarias y títulos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-sm shadow-yellow-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Nuevo Cliente</span>
          </button>
          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-yellow-300 bg-blue-700 hover:bg-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-yellow-300" />
            <span>Cargar Imagen / Documento</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Client List on left, Profile & Docs on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Client selector list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase">Lista de Clientes</h3>
            <span className="text-[11px] text-slate-500 font-semibold">{clients.length}</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchClient}
              onChange={e => setSearchClient(e.target.value)}
              className="w-full text-xs pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {filteredClients.map(client => {
              const isSelected = client.id === selectedClientId;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-300 text-blue-950 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <span className="font-bold truncate text-slate-900">{client.fullName}</span>
                  <span className="text-[11px] text-slate-500">
                    {client.documentType}: {client.documentNumber}
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold">
                    📁 {client.documents.length} documento(s) adjuntos
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 cols: Selected Client Details & Documents Gallery */}
        <div className="lg:col-span-3 space-y-4">
          {/* Client Header Info Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-700" />
                  {selectedClient.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedClient.documentType} N° {selectedClient.documentNumber} | {selectedClient.occupation}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('DOCUMENTOS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'DOCUMENTOS'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Documentos ({selectedClient.documents.length})
                </button>
                <button
                  onClick={() => setActiveTab('DATOS_CLIENTE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'DATOS_CLIENTE'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Datos KYC &amp; Garante
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Teléfono</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {selectedClient.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Dirección</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {selectedClient.address}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ingreso Declarado</span>
                <span className="font-bold text-emerald-700">
                  $ {selectedClient.monthlyIncome.toFixed(2)} / mes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Garante Solidario</span>
                <span className="font-semibold text-slate-800">
                  {selectedClient.guarantorName || 'Sin Garante'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab 1: Documents & Image Gallery */}
          {activeTab === 'DOCUMENTOS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase">
                  Galería de Archivos, Fotografías y Garantías
                </h4>
                <button
                  onClick={() => setIsUploading(true)}
                  className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subir Nuevo Archivo</span>
                </button>
              </div>

              {selectedClient.documents.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">
                      No hay imágenes ni documentos cargados para este prestatario
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Carga fotos de DNI, recibos o fotografías de prendas para respaldo legal.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUploading(true)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-yellow-300 text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4 text-yellow-300" />
                    <span>Cargar Primer Documento</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedClient.documents.map(doc => {
                    const badge = getDocTypeBadge(doc.type);
                    const isImage = doc.fileUrl.startsWith('data:image') || doc.fileUrl.includes('.png') || doc.fileUrl.includes('.jpg');

                    return (
                      <div
                        key={doc.id}
                        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col group hover:border-blue-400 transition-all"
                      >
                        {/* Thumbnail / Image Preview */}
                        <div
                          onClick={() => setLightboxDoc(doc)}
                          className="h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group"
                        >
                          {isImage ? (
                            <img
                              src={doc.fileUrl}
                              alt={doc.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <FileText className="w-12 h-12 text-slate-400" />
                          )}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <ZoomIn className="w-4 h-4 text-yellow-400" />
                            <span>Ver Completo</span>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badge.color}`}
                              >
                                {badge.label}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {doc.uploadDate}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-800 text-xs truncate" title={doc.title}>
                              {doc.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate">
                              {doc.fileName} {doc.fileSize && `(${doc.fileSize})`}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => setLightboxDoc(doc)}
                              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visualizar</span>
                            </button>

                            <button
                              onClick={() => deleteDocumentFromClient(selectedClient.id, doc.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Eliminar documento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Client KYC Data */}
          {activeTab === 'DATOS_CLIENTE' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                Ficha de Conocimiento del Cliente (KYC)
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nombre Completo</span>
                  <span className="font-bold text-slate-800">{selectedClient.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Documento Identidad</span>
                  <span className="font-bold text-slate-800">
                    {selectedClient.documentType}: {selectedClient.documentNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Teléfono Celular</span>
                  <span className="font-semibold text-slate-800">{selectedClient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Correo Electrónico</span>
                  <span className="font-semibold text-slate-800">{selectedClient.email || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Domicilio Legal</span>
                  <span className="font-semibold text-slate-800">{selectedClient.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ciudad / Jurisdicción</span>
                  <span className="font-semibold text-slate-800">{selectedClient.city}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 space-y-2">
                <h5 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-700" />
                  Garante Solidario / Aval Registrado
                </h5>
                {selectedClient.guarantorName ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nombre del Fiador</span>
                      <span className="font-bold text-slate-800">{selectedClient.guarantorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Documento Identidad</span>
                      <span className="font-bold text-slate-800">
                        {selectedClient.guarantorDoc || 'N/D'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Teléfono Garante</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.guarantorPhone || 'N/D'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Domicilio Garante</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.guarantorAddress || selectedClient.address}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">
                    No se registró fiador solidario independiente para este titular.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-yellow-400" />
                Cargar Archivo al Expediente: {selectedClient.fullName}
              </h3>
              <button
                onClick={() => {
                  setIsUploading(false);
                  setPreviewFileUrl(null);
                }}
                className="text-yellow-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoría del Documento
                </label>
                <select
                  value={newDocType}
                  onChange={e => setNewDocType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="DNI_FRONT">Fotografía DNI (Anverso)</option>
                  <option value="DNI_BACK">Fotografía DNI (Reverso)</option>
                  <option value="GARANTIA_FOTO">Fotografía de Garantía / Prenda</option>
                  <option value="INGRESOS">Sustento de Ingresos / Boletas</option>
                  <option value="RECIBO_SERVICIO">Recibo de Servicios Públicos</option>
                  <option value="PAGARE">Pagaré / Título Valor</option>
                  <option value="CONTRATO_FIRMADO">Contrato Firmado / Huella</option>
                  <option value="OTRO">Otro Documento Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título Descriptivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Foto Tarjeta Vehicular o DNI Anverso"
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seleccionar Imagen o Documento desde su Dispositivo
                </label>
                <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center hover:bg-blue-50/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileUploadInput"
                  />
                  <label
                    htmlFor="fileUploadInput"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-8 h-8 text-blue-700" />
                    <span className="font-bold text-slate-800">
                      Haz clic para buscar imagen (PNG, JPG, WEBP, PDF)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {newFileName || 'Ningún archivo seleccionado'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {previewFileUrl && (
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Vista previa de imagen cargada:
                  </span>
                  <img
                    src={previewFileUrl}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded object-contain"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!previewFileUrl}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-950 rounded-lg font-black shadow-sm cursor-pointer"
                >
                  Guardar en Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {lightboxDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs truncate">{lightboxDoc.title}</span>
              <button
                onClick={() => setLightboxDoc(null)}
                className="text-slate-400 hover:text-white font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-950/90">
              <img
                src={lightboxDoc.fileUrl}
                alt={lightboxDoc.title}
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
            <div className="p-3 bg-slate-900 text-slate-300 text-xs flex justify-between items-center">
              <span>{lightboxDoc.fileName} - {lightboxDoc.uploadDate}</span>
              <a
                href={lightboxDoc.fileUrl}
                download={lightboxDoc.fileName}
                className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded font-black text-xs flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Descargar</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Registrar Nuevo Prestatario</h3>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-yellow-300 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newClientForm.fullName}
                  onChange={e => setNewClientForm({ ...newClientForm, fullName: e.target.value })}
                  placeholder="Ej. Juan Pérez Quispe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo Doc.</label>
                  <select
                    value={newClientForm.documentType}
                    onChange={e => setNewClientForm({ ...newClientForm, documentType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CI">CI</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° Documento</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.documentNumber}
                    onChange={e => setNewClientForm({ ...newClientForm, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.phone}
                    onChange={e => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ingreso Mensual ($)</label>
                  <input
                    type="number"
                    value={newClientForm.monthlyIncome}
                    onChange={e => setNewClientForm({ ...newClientForm, monthlyIncome: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección Domiciliaria</label>
                <input
                  type="text"
                  required
                  value={newClientForm.address}
                  onChange={e => setNewClientForm({ ...newClientForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-700 block mb-1">Garante Solidario (Opcional)</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre Garante"
                    value={newClientForm.guarantorName}
                    onChange={e => setNewClientForm({ ...newClientForm, guarantorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="DNI Garante"
                    value={newClientForm.guarantorDoc}
                    onChange={e => setNewClientForm({ ...newClientForm, guarantorDoc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-yellow-300 rounded-lg font-bold cursor-pointer shadow-sm"
                >
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
