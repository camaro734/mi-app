import React from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MaterialsHeader = ({ onImportExcel, onExportExcel }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Materiales</h1>
        <p className="text-gray-600">Gestiona el inventario de materiales y repuestos</p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={onImportExcel}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Excel
        </Button>
        <Button variant="outline" onClick={onExportExcel}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
};

export default MaterialsHeader;