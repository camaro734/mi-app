import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Printer, Eye, RotateCcw, FileText, Building, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const PrintTemplateTab = () => {
  const { toast } = useToast();
  
  const [printSettings, setPrintSettings] = useState({
    // Company Header
    companyName: 'CMG HIDRÁULICA S.L.',
    companySubtitle: 'Reparación y Mantenimiento de Maquinaria Hidráulica',
    companyAddress: 'Polígono Industrial, Calle Ejemplo 123, 46000 Valencia',
    companyPhone: '+34 961 234 567',
    companyEmail: 'info@cmghidraulica.com',
    companyWebsite: 'www.cmghidraulica.com',
    companyCIF: 'B-12345678',
    
    // Document Settings
    documentTitle: 'PARTE DE TRABAJO',
    showLogo: true,
    showCompanyInfo: true,
    showClientInfo: true,
    showMachineInfo: true,
    showWorkDetails: true,
    showTimeInfo: true,
    showTechnicians: true,
    showMaterials: true,
    showValidationNotes: true,
    showSignature: true,
    
    // Footer Settings
    footerText: 'CMG HIDRÁULICA S.L. - Especialistas en Reparación de Maquinaria Hidráulica',
    showFooter: true,
    
    // Style Settings
    headerColor: '#2563eb',
    accentColor: '#1d4ed8',
    fontSize: 'medium',
    pageMargins: 'normal'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field, value) => {
    setPrintSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleField = (field) => {
    setPrintSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = () => {
    // Guardar configuración en localStorage
    localStorage.setItem('printTemplateSettings', JSON.stringify(printSettings));
    
    toast({
      title: "Configuración guardada",
      description: "El modelo de impresión ha sido actualizado correctamente.",
    });
  };

  const handleReset = () => {
    setPrintSettings({
      companyName: 'CMG HIDRÁULICA S.L.',
      companySubtitle: 'Reparación y Mantenimiento de Maquinaria Hidráulica',
      companyAddress: 'Polígono Industrial, Calle Ejemplo 123, 46000 Valencia',
      companyPhone: '+34 961 234 567',
      companyEmail: 'info@cmghidraulica.com',
      companyWebsite: 'www.cmghidraulica.com',
      companyCIF: 'B-12345678',
      documentTitle: 'PARTE DE TRABAJO',
      showLogo: true,
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
    });
    
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto del modelo de impresión.",
    });
  };

  const handlePreview = () => {
    setPreviewMode(true);
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Vista Previa del Modelo de Impresión</h3>
          <Button onClick={() => setPreviewMode(false)} variant="outline">
            Volver a Configuración
          </Button>
        </div>
        
        <PrintPreview settings={printSettings} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Modelo de Impresión</h3>
          <p className="text-sm text-gray-600">
            Configura cómo se verán los partes de trabajo al imprimirse
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Información de la Empresa
            </CardTitle>
            <CardDescription>
              Datos que aparecerán en el encabezado del documento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nombre de la Empresa
              </label>
              <Input
                value={printSettings.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Subtítulo/Descripción
              </label>
              <Input
                value={printSettings.companySubtitle}
                onChange={(e) => handleInputChange('companySubtitle', e.target.value)}
                placeholder="Descripción de la actividad"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Dirección
              </label>
              <Input
                value={printSettings.companyAddress}
                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Teléfono
                </label>
                <Input
                  value={printSettings.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  placeholder="+34 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  CIF/NIF
                </label>
                <Input
                  value={printSettings.companyCIF}
                  onChange={(e) => handleInputChange('companyCIF', e.target.value)}
                  placeholder="B-XXXXXXXX"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <Input
                  value={printSettings.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Sitio Web
                </label>
                <Input
                  value={printSettings.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  placeholder="www.empresa.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Configuración del Documento
            </CardTitle>
            <CardDescription>
              Personaliza el formato y contenido del documento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Título del Documento
              </label>
              <Input
                value={printSettings.documentTitle}
                onChange={(e) => handleInputChange('documentTitle', e.target.value)}
                placeholder="PARTE DE TRABAJO"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Texto del Pie de Página
              </label>
              <textarea
                value={printSettings.footerText}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                placeholder="Texto que aparecerá en el pie de página"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Color del Encabezado
                </label>
                <input
                  type="color"
                  value={printSettings.headerColor}
                  onChange={(e) => handleInputChange('headerColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Color de Acentos
                </label>
                <input
                  type="color"
                  value={printSettings.accentColor}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tamaño de Fuente
                </label>
                <select
                  value={printSettings.fontSize}
                  onChange={(e) => handleInputChange('fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Pequeña</option>
                  <option value="medium">Mediana</option>
                  <option value="large">Grande</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Márgenes de Página
                </label>
                <select
                  value={printSettings.pageMargins}
                  onChange={(e) => handleInputChange('pageMargins', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="narrow">Estrechos</option>
                  <option value="normal">Normales</option>
                  <option value="wide">Amplios</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections to Include */}
      <Card>
        <CardHeader>
          <CardTitle>Secciones a Incluir</CardTitle>
          <CardDescription>
            Selecciona qué información aparecerá en el documento impreso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { key: 'showCompanyInfo', label: 'Información de Empresa', icon: Building },
              { key: 'showClientInfo', label: 'Datos del Cliente', icon: Phone },
              { key: 'showMachineInfo', label: 'Información de Máquina', icon: FileText },
              { key: 'showWorkDetails', label: 'Detalles del Trabajo', icon: FileText },
              { key: 'showTimeInfo', label: 'Tiempo de Trabajo', icon: FileText },
              { key: 'showTechnicians', label: 'Técnicos Asignados', icon: FileText },
              { key: 'showMaterials', label: 'Materiales Utilizados', icon: FileText },
              { key: 'showValidationNotes', label: 'Notas de Validación', icon: FileText },
              { key: 'showSignature', label: 'Firma del Cliente', icon: FileText },
              { key: 'showFooter', label: 'Pie de Página', icon: FileText }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={printSettings[key]}
                  onChange={() => handleToggleField(key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={key} className="text-sm font-medium text-gray-700 flex items-center cursor-pointer">
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de vista previa
const PrintPreview = ({ settings }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
      {/* Header */}
      {settings.showCompanyInfo && (
        <div className="border-b-2 pb-6 mb-6" style={{ borderColor: settings.headerColor }}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: settings.headerColor }}>
                {settings.companyName}
              </h1>
              <p className="text-gray-600">{settings.companySubtitle}</p>
              <p className="text-sm text-gray-500">
                CIF: {settings.companyCIF} | Tel: {settings.companyPhone}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">{settings.documentTitle}</h2>
              <p className="text-lg font-semibold" style={{ color: settings.headerColor }}>
                WO-2024-001
              </p>
              <p className="text-sm text-gray-500">Fecha: 15/01/2024</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div className="space-y-6">
        {settings.showClientInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-3">Información del Cliente</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Cliente:</span> Construcciones García S.L.</p>
              <p><span className="font-medium">Contacto:</span> Juan García - 666 123 456</p>
              <p><span className="font-medium">Ubicación:</span> Valencia</p>
            </div>
          </div>
        )}

        {settings.showMachineInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-3">Información de la Máquina</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Máquina:</span> Excavadora CAT 320D</p>
              <p><span className="font-medium">Matrícula:</span> ABC-1234</p>
              <p><span className="font-medium">Nº Serie:</span> CAT320D2024001</p>
            </div>
          </div>
        )}

        {settings.showWorkDetails && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-3">Detalles del Trabajo</h3>
            <p className="text-sm text-gray-700">
              Reparación del sistema hidráulico principal. Cambio de filtros y aceite hidráulico.
            </p>
          </div>
        )}

        {settings.showTimeInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-3">Tiempo de Trabajo</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Horas facturadas:</span> 6h</p>
              <p><span className="font-medium">Fecha finalización:</span> 17/01/2024</p>
            </div>
          </div>
        )}

        {settings.showMaterials && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-3">Materiales Facturados</h3>
            <div className="text-sm">
              <p>• Filtro hidráulico HF6177 - 2 ud</p>
              <p>• Aceite hidráulico ISO 46 - 20 L</p>
            </div>
          </div>
        )}

        {settings.showSignature && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-3">Conformidad del Cliente</h3>
            <div className="text-sm">
              <p><span className="font-medium">Firmado por:</span> Juan García</p>
              <p><span className="font-medium">Fecha:</span> 17/01/2024</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {settings.showFooter && (
        <div className="border-t-2 border-gray-300 pt-4 mt-8">
          <div className="text-center text-sm text-gray-600">
            <p>{settings.footerText}</p>
            <p>{settings.companyAddress}</p>
            <p>Email: {settings.companyEmail} | Web: {settings.companyWebsite}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintTemplateTab;