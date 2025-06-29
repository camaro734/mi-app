import React from 'react';
import { Upload, Download, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const UploadStep = ({ 
  dragActive, 
  onDragHandlers, 
  onFileSelect, 
  fileInputRef, 
  onDownloadTemplate 
}) => (
  <>
    {/* Template Download */}
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-blue-800">Plantilla de Excel</h4>
          <p className="text-sm text-blue-600">
            Descarga la plantilla con el formato correcto: primera columna referencia, segunda descripción
          </p>
        </div>
        <Button variant="outline" onClick={onDownloadTemplate} className="border-blue-300">
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </Button>
      </div>
    </div>

    {/* File Upload Area */}
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      {...onDragHandlers}
    >
      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Arrastra tu archivo aquí
      </h3>
      <p className="text-gray-600 mb-4">
        o haz clic para seleccionar un archivo Excel (.xlsx, .xls) o CSV
      </p>
      <Button onClick={() => fileInputRef.current?.click()}>
        Seleccionar Archivo
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>

    {/* Format Requirements */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium mb-2">Formato requerido:</h4>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>• <strong>Primera columna:</strong> referencia</li>
        <li>• <strong>Segunda columna:</strong> descripción</li>
        <li>• Los encabezados son opcionales</li>
        <li>• Formatos soportados: .xlsx, .xls, .csv</li>
      </ul>
    </div>
  </>
);

export const PreviewStep = ({ 
  importData, 
  validationErrors, 
  onBack, 
  onImport 
}) => (
  <>
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Vista Previa de Datos</h3>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button 
          onClick={onImport}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-2" />
          Importar Datos
        </Button>
      </div>
    </div>

    {/* Validation Summary */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {importData.length}
          </div>
          <div className="text-sm text-gray-600">Total Registros</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {importData.length - validationErrors.length}
          </div>
          <div className="text-sm text-gray-600">Válidos</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {validationErrors.length}
          </div>
          <div className="text-sm text-gray-600">Con Errores</div>
        </CardContent>
      </Card>
    </div>

    {/* Validation Errors */}
    {validationErrors.length > 0 && (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <h4 className="font-medium text-yellow-800">
            Advertencias ({validationErrors.length})
          </h4>
        </div>
        <p className="text-sm text-yellow-700 mb-2">
          Los siguientes registros tienen campos vacíos y no se importarán:
        </p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {validationErrors.slice(0, 5).map((error, index) => (
            <p key={index} className="text-sm text-yellow-700">
              Fila {error.row}: {error.message}
            </p>
          ))}
          {validationErrors.length > 5 && (
            <p className="text-sm text-yellow-600">
              ... y {validationErrors.length - 5} más
            </p>
          )}
        </div>
      </div>
    )}

    {/* Data Preview */}
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Fila</th>
              <th className="px-4 py-2 text-left">Referencia</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {importData.map((row, index) => {
              const rowErrors = validationErrors.filter(e => e.row === index + 1);
              const hasErrors = rowErrors.length > 0;
              
              return (
                <tr key={index} className={hasErrors ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    {row.referencia || <span className="text-yellow-500">Vacío</span>}
                  </td>
                  <td className="px-4 py-2">
                    {row.descripcion || <span className="text-yellow-500">Vacío</span>}
                  </td>
                  <td className="px-4 py-2">
                    {hasErrors ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Válido</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

export const SuccessStep = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Check className="h-8 w-8 text-green-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      ¡Importación Completada!
    </h3>
    <p className="text-gray-600">
      Los materiales se han importado correctamente al inventario.
    </p>
  </div>
);