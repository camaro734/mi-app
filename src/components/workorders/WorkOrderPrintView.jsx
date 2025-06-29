import React from 'react';
import { Calendar, User, Clock, Wrench, FileText, CheckCircle } from 'lucide-react';

const WorkOrderPrintView = ({ workOrder, signature }) => {
  // Cargar configuración de impresión desde localStorage
  const printSettings = JSON.parse(localStorage.getItem('printTemplateSettings')) || {
    companyName: 'CMG HIDRÁULICA S.L.',
    companySubtitle: 'Reparación y Mantenimiento de Maquinaria Hidráulica',
    companyAddress: 'Polígono Industrial Norte, Calle Hidráulica 123, 46000 Valencia',
    companyPhone: '+34 961 234 567',
    companyEmail: 'info@cmghidraulica.com',
    companyWebsite: 'www.cmghidraulica.com',
    companyCIF: 'B-12345678',
    documentTitle: 'PARTE DE TRABAJO',
    showCompanyInfo: true,
    showClientInfo: true,
    showMachineInfo: true,
    showWorkDetails: true,
    showTimeInfo: true,
    showTechnicians: true,
    showMaterials: true,
    showValidationNotes: true,
    showSignature: true,
    footerText: 'CMG HIDRÁULICA S.L. - Especialistas en Reparación de Maquinaria Hidráulica',
    showFooter: true,
    headerColor: '#2563eb',
    accentColor: '#1d4ed8',
    fontSize: 'medium',
    pageMargins: 'normal'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  // Usar datos validados si están disponibles, sino usar los originales
  const finalHours = workOrder.validatedHours !== undefined ? workOrder.validatedHours : workOrder.workedHours;
  const finalMaterials = workOrder.validatedMaterials || workOrder.materials || [];

  const getFontSizeClass = () => {
    switch (printSettings.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getMarginClass = () => {
    switch (printSettings.pageMargins) {
      case 'narrow': return 'p-4';
      case 'wide': return 'p-12';
      default: return 'p-8';
    }
  };

  return (
    <div className={`bg-white max-w-4xl mx-auto ${getFontSizeClass()} ${getMarginClass()}`} style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Empresarial */}
      {printSettings.showCompanyInfo && (
        <div className="border-b-4 pb-6 mb-8" style={{ borderColor: printSettings.headerColor }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2" style={{ color: printSettings.headerColor }}>
                {printSettings.companyName}
              </h1>
              <p className="text-lg text-gray-600 mb-2">{printSettings.companySubtitle}</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Dirección:</strong> {printSettings.companyAddress}</p>
                <p><strong>CIF:</strong> {printSettings.companyCIF}</p>
                <p><strong>Teléfono:</strong> {printSettings.companyPhone}</p>
                <p><strong>Email:</strong> {printSettings.companyEmail}</p>
                <p><strong>Web:</strong> {printSettings.companyWebsite}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{printSettings.documentTitle}</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-xl font-bold" style={{ color: printSettings.headerColor }}>
                  {workOrder.id}
                </p>
                <p className="text-sm text-gray-600">Fecha: {formatDate(workOrder.createdDate)}</p>
                <p className="text-sm text-gray-600">Estado: {workOrder.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del Cliente */}
      {printSettings.showClientInfo && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2" style={{ borderColor: printSettings.accentColor }}>
            DATOS DEL CLIENTE
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-bold text-gray-800 mb-2">{workOrder.client}</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Contacto:</span> {workOrder.clientContact}</p>
                  {workOrder.clientPhone && (
                    <p><span className="font-semibold">Teléfono:</span> {workOrder.clientPhone}</p>
                  )}
                  {workOrder.clientEmail && (
                    <p><span className="font-semibold">Email:</span> {workOrder.clientEmail}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Ubicación del Trabajo:</p>
                <p className="text-sm text-gray-600">{workOrder.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de la Máquina */}
      {printSettings.showMachineInfo && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2" style={{ borderColor: printSettings.accentColor }}>
            DATOS DE LA MÁQUINA
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="font-semibold text-gray-700">Máquina:</p>
                <p className="text-lg font-bold text-gray-800">{workOrder.machine}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Marca/Modelo:</p>
                <p className="text-gray-800">{workOrder.brand} {workOrder.model}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Matrícula:</p>
                <p className="text-lg font-bold" style={{ color: printSettings.headerColor }}>{workOrder.plate}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Número de Serie:</p>
                <p className="text-gray-800">{workOrder.serial}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Tipo de Trabajo:</p>
                <p className="text-gray-800">{workOrder.type}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Prioridad:</p>
                <p className="text-gray-800">{workOrder.priority}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trabajos Realizados */}
      {printSettings.showWorkDetails && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2" style={{ borderColor: printSettings.accentColor }}>
            TRABAJOS REALIZADOS
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-2">Problema inicial:</p>
              <p className="text-gray-800 bg-white p-4 rounded border">{workOrder.description}</p>
            </div>
            {workOrder.workDescription && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">Trabajos realizados:</p>
                <p className="text-gray-800 bg-white p-4 rounded border">{workOrder.workDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Materiales Utilizados */}
      {printSettings.showMaterials && finalMaterials && finalMaterials.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2" style={{ borderColor: printSettings.accentColor }}>
            MATERIALES UTILIZADOS
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2" style={{ borderColor: printSettings.headerColor }}>
                  <th className="text-left py-3 px-2 font-semibold">Referencia</th>
                  <th className="text-left py-3 px-2 font-semibold">Descripción</th>
                  <th className="text-center py-3 px-2 font-semibold">Cantidad</th>
                  <th className="text-center py-3 px-2 font-semibold">Unidad</th>
                </tr>
              </thead>
              <tbody>
                {finalMaterials.map((material, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="py-3 px-2 font-medium">{material.reference || 'N/A'}</td>
                    <td className="py-3 px-2">{material.name}</td>
                    <td className="text-center py-3 px-2 font-semibold">{material.quantity}</td>
                    <td className="text-center py-3 px-2">{material.unit || 'ud'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Horas de Trabajo */}
      {printSettings.showTimeInfo && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2" style={{ borderColor: printSettings.accentColor }}>
            HORAS DE TRABAJO
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-700">Horas facturadas:</p>
                <p className="text-2xl font-bold" style={{ color: printSettings.headerColor }}>{finalHours}h</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Fecha de finalización:</p>
                <p className="text-gray-800">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Técnicos */}
      {printSettings.showTechnicians && workOrder.assignedTechnicians && workOrder.assignedTechnicians.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2" style={{ borderColor: printSettings.accentColor }}>
            TÉCNICOS ASIGNADOS
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workOrder.assignedTechnicians.map((tech, index) => (
                <div key={index} className="flex items-center bg-white p-3 rounded border">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Firma del Cliente */}
      {printSettings.showSignature && signature && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2" style={{ borderColor: printSettings.accentColor }}>
            CONFORMIDAD DEL CLIENTE
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-700">Nombre completo:</p>
                    <p className="text-lg font-bold text-gray-800">{signature.clientName}</p>
                  </div>
                  {signature.clientPosition && (
                    <div>
                      <p className="font-semibold text-gray-700">Cargo/Posición:</p>
                      <p className="text-gray-800">{signature.clientPosition}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-700">DNI:</p>
                    <p className="text-gray-800">_________________________</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Fecha de firma:</p>
                    <p className="text-gray-800">{signature.signedDate}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-3">Firma digital:</p>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white min-h-32 flex items-center justify-center">
                  <img 
                    src={signature.signatureData} 
                    alt="Firma del cliente" 
                    className="max-w-full max-h-24 object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Firma digital verificada
                </p>
              </div>
            </div>
            
            {/* Declaración de conformidad */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Declaración de conformidad:</strong> El cliente confirma que el trabajo ha sido realizado satisfactoriamente, 
                la maquinaria funciona correctamente, se han utilizado los materiales especificados y está conforme con el servicio prestado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Empresarial */}
      {printSettings.showFooter && (
        <div className="border-t-4 border-gray-300 pt-6 mt-12">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">{printSettings.footerText}</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{printSettings.companyAddress}</p>
              <p>Tel: {printSettings.companyPhone} | Email: {printSettings.companyEmail} | Web: {printSettings.companyWebsite}</p>
              <p>CIF: {printSettings.companyCIF}</p>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default WorkOrderPrintView;