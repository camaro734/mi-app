import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ReportsFilters = ({ 
  reportType, 
  setReportType, 
  dateRange, 
  setDateRange, 
  onGenerateReport 
}) => {
  const reportTypes = [
    { value: 'general', label: 'Informe General' },
    { value: 'workorders', label: 'Partes de Trabajo' },
    { value: 'personnel', label: 'Personal y Horas' },
    { value: 'materials', label: 'Inventario' },
    { value: 'financial', label: 'Financiero' }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="report-type">Tipo de Informe</Label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="start-date">Fecha Inicio</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="end-date">Fecha Fin</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={onGenerateReport} className="w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsFilters;