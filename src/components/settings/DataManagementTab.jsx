import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  Package, 
  AlertCircle,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const DataManagementTab = () => {
  const { toast } = useToast();
  const { clients, setClients, materials, setMaterials } = useData();
  const [importResults, setImportResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event, dataType) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let data;

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(content, dataType);
        } else {
          throw new Error('Formato de archivo no soportado');
        }

        setPreviewData(data);
        setShowPreview(true);
      } catch (error) {
        toast({
          title: "Error al leer el archivo",
          description: `No se pudo procesar el archivo: ${error.message}`,
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (content, dataType) => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const item = {};
      
      if (dataType === 'clients') {
        item.id = Date.now() + index;
        item.name = values[0] || '';
        item.contact = values[1] || '';
        item.phone = values[2] || '';
        item.email = values[3] || '';
        item.location = values[4] || '';
        item.status = values[5] || 'Activo';
        item.totalJobs = parseInt(values[6]) || 0;
        item.lastJob = values[7] || new Date().toISOString().split('T')[0];
        item.notes = values[8] || '';
      } else if (dataType === 'materials') {
        item.id = Date.now() + index;
        item.name = values[0] || '';
        item.category = values[1] || '';
        item.stock = parseInt(values[2]) || 0;
        item.minStock = parseInt(values[3]) || 0;
        item.price = parseFloat(values[4]) || 0;
        item.supplier = values[5] || '';
        item.lastUsed = values[6] || new Date().toISOString().split('T')[0];
        item.totalUsed = parseInt(values[7]) || 0;
      }
      
      return item;
    });
  };

  const confirmImport = (dataType) => {
    try {
      if (dataType === 'clients') {
        const validClients = previewData.filter(client => client.name && client.name.trim());
        setClients(prev => [...prev, ...validClients]);
        
        setImportResults({
          type: 'clients',
          total: previewData.length,
          imported: validClients.length,
          errors: previewData.length - validClients.length
        });
      } else if (dataType === 'materials') {
        const validMaterials = previewData.filter(material => material.name && material.name.trim());
        setMaterials(prev => [...prev, ...validMaterials]);
        
        setImportResults({
          type: 'materials',
          total: previewData.length,
          imported: validMaterials.length,
          errors: previewData.length - validMaterials.length
        });
      }

      setShowPreview(false);
      setPreviewData([]);
      
      toast({
        title: "Importación completada",
        description: `Se han importado ${importResults?.imported || 0} registros correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error en la importación",
        description: "Hubo un problema al importar los datos.",
        variant: "destructive"
      });
    }
  };

  const exportData = (dataType) => {
    let data, filename;
    
    if (dataType === 'clients') {
      data = clients;
      filename = 'clientes_cmg_hidraulica.json';
    } else if (dataType === 'materials') {
      data = materials;
      filename = 'materiales_cmg_hidraulica.json';
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportación completada",
      description: `Los datos se han exportado como ${filename}`,
    });
  };

  const downloadTemplate = (dataType) => {
    let csvContent, filename;
    
    if (dataType === 'clients') {
      csvContent = 'Nombre,Contacto,Teléfono,Email,Ubicación,Estado,Total Trabajos,Último Trabajo,Notas\n';
      csvContent += 'Ejemplo Cliente S.L.,Juan Pérez,963123456,juan@ejemplo.com,Valencia,Activo,5,2024-01-15,Cliente de ejemplo';
      filename = 'plantilla_clientes.csv';
    } else if (dataType === 'materials') {
      csvContent = 'Nombre,Categoría,Stock,Stock Mínimo,Precio,Proveedor,Último Uso,Total Usado\n';
      csvContent += 'Filtro Hidráulico,Filtros,10,5,85.00,Proveedor Ejemplo,2024-01-15,24';
      filename = 'plantilla_materiales.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plantilla descargada",
      description: `Se ha descargado la plantilla ${filename}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Import Results */}
      {importResults && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h4 className="font-medium text-green-900">Importación Completada</h4>
              <p className="text-sm text-green-700">
                {importResults.imported} de {importResults.total} registros importados correctamente
                {importResults.errors > 0 && ` (${importResults.errors} errores)`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Clients Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Gestión de Clientes
          </CardTitle>
          <CardDescription>
            Importar y exportar datos de clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Importar Clientes</h4>
              <p className="text-sm text-gray-600">Sube un archivo CSV o JSON con datos de clientes</p>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => handleFileUpload(e, 'clients')}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline" 
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Archivo
                </Button>
                <Button 
                  onClick={() => downloadTemplate('clients')}
                  variant="ghost" 
                  size="sm"
                  className="w-full text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Descargar Plantilla CSV
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Exportar Clientes</h4>
              <p className="text-sm text-gray-600">Descarga todos los datos de clientes</p>
              <Button 
                onClick={() => exportData('clients')}
                variant="outline" 
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Estado Actual</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total clientes:</span>
                  <Badge variant="secondary">{clients.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Activos:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {clients.filter(c => c.status === 'Activo').length}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inactivos:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {clients.filter(c => c.status === 'Inactivo').length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Gestión de Materiales
          </CardTitle>
          <CardDescription>
            Importar y exportar inventario de materiales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Importar Materiales</h4>
              <p className="text-sm text-gray-600">Sube un archivo CSV o JSON con inventario</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline" 
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Archivo
                </Button>
                <Button 
                  onClick={() => downloadTemplate('materials')}
                  variant="ghost" 
                  size="sm"
                  className="w-full text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Descargar Plantilla CSV
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Exportar Materiales</h4>
              <p className="text-sm text-gray-600">Descarga todo el inventario</p>
              <Button 
                onClick={() => exportData('materials')}
                variant="outline" 
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Estado Actual</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total materiales:</span>
                  <Badge variant="secondary">{materials.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Stock bajo:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {materials.filter(m => m.stock <= m.minStock).length}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sin stock:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {materials.filter(m => m.stock === 0).length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Instrucciones de Importación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">Formatos soportados:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><strong>CSV:</strong> Archivo separado por comas con encabezados</li>
                <li><strong>JSON:</strong> Archivo con estructura de datos válida</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Recomendaciones:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Descarga la plantilla CSV para ver el formato correcto</li>
                <li>Asegúrate de que los campos obligatorios estén completos</li>
                <li>Revisa los datos antes de confirmar la importación</li>
                <li>Haz una copia de seguridad antes de importar datos masivos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">Vista Previa de Importación</h3>
                <p className="text-sm text-gray-600">
                  {previewData.length} registros encontrados
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-2">
                {previewData.slice(0, 10).map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(item).slice(0, 4).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium text-gray-600">{key}:</span>
                          <span className="ml-1">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {previewData.length > 10 && (
                  <p className="text-center text-gray-500 text-sm">
                    ... y {previewData.length - 10} registros más
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancelar
              </Button>
              <Button onClick={() => confirmImport(previewData[0]?.name ? 'clients' : 'materials')}>
                Confirmar Importación
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DataManagementTab;