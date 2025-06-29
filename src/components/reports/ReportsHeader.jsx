import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportsHeader = ({ onExportPDF, onExportExcel }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Informes</h1>
        <p className="text-gray-600">Análisis y estadísticas de la actividad empresarial</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onExportPDF}>
          <Download className="w-4 h-4 mr-2" />
          PDF
        </Button>
        <Button variant="outline" onClick={onExportExcel}>
          <Download className="w-4 h-4 mr-2" />
          Excel
        </Button>
      </div>
    </div>
  );
};

export default ReportsHeader;