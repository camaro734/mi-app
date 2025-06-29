import React, { useState } from 'react';
import { Download, Calendar, Users, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import jsPDF from 'jspdf';

const AttendanceExportTab = () => {
  const { toast } = useToast();
  const { personnel } = useData();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    selectedEmployee: 'all',
    format: 'csv'
  });

  // Generar datos de fichadas simulados para demostración
  const generateAttendanceData = () => {
    const data = [];
    const startDate = new Date(filters.startDate || '2024-01-01');
    const endDate = new Date(filters.endDate || new Date());
    
    const employees = filters.selectedEmployee === 'all' 
      ? personnel 
      : personnel.filter(p => p.id.toString() === filters.selectedEmployee);

    employees.forEach(employee => {
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Simular fichadas (no todos los días)
        if (Math.random() > 0.2) { // 80% probabilidad de fichar
          const entryTime = new Date(currentDate);
          entryTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
          
          const exitTime = new Date(currentDate);
          exitTime.setHours(16 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
          
          const hoursWorked = ((exitTime - entryTime) / (1000 * 60 * 60)).toFixed(2);
          
          data.push({
            date: currentDate.toISOString().split('T')[0],
            employee: employee.name,
            entryTime: entryTime.toTimeString().slice(0, 5),
            exitTime: exitTime.toTimeString().slice(0, 5),
            hoursWorked: parseFloat(hoursWorked),
            status: hoursWorked >= 8 ? 'Completa' : 'Parcial'
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const exportToCSV = () => {
    const data = generateAttendanceData();
    
    if (data.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos de fichadas para exportar en el rango seleccionado.",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Fecha', 'Empleado', 'Hora Entrada', 'Hora Salida', 'Horas Trabajadas', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.date,
        `"${row.employee}"`,
        row.entryTime,
        row.exitTime,
        row.hoursWorked,
        row.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fichadas_${filters.startDate}_${filters.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV exportado",
      description: `Se han exportado ${data.length} registros de fichadas en formato CSV.`,
    });
  };

  const exportToJSON = () => {
    const data = generateAttendanceData();
    
    if (data.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos de fichadas para exportar en el rango seleccionado.",
        variant: "destructive"
      });
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fichadas_${filters.startDate}_${filters.endDate}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "JSON exportado",
      description: `Se han exportado ${data.length} registros de fichadas en formato JSON.`,
    });
  };

  const exportToPDF = () => {
    const data = generateAttendanceData();
    
    if (data.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos de fichadas para exportar en el rango seleccionado.",
        variant: "destructive"
      });
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Header
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CMG HIDRÁULICA S.L.', margin, 15);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('INFORME DE FICHADAS DE PRESENCIA', margin, 22);

    yPosition = 40;

    // Información del informe
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const reportInfo = [
      `Período: ${filters.startDate || 'Inicio'} - ${filters.endDate || 'Fin'}`,
      `Empleado: ${filters.selectedEmployee === 'all' ? 'Todos' : personnel.find(p => p.id.toString() === filters.selectedEmployee)?.name}`,
      `Total registros: ${data.length}`,
      `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`
    ];
    
    reportInfo.forEach(info => {
      pdf.text(info, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 10;

    // Estadísticas
    const totalHours = data.reduce((sum, record) => sum + record.hoursWorked, 0);
    const totalEmployees = [...new Set(data.map(record => record.employee))].length;
    const completeSessions = data.filter(record => record.status === 'Completa').length;

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('RESUMEN ESTADÍSTICO', margin + 5, yPosition + 8);
    
    yPosition += 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const stats = [
      `Total horas trabajadas: ${totalHours.toFixed(2)}h`,
      `Empleados únicos: ${totalEmployees}`,
      `Sesiones completas: ${completeSessions}`,
      `Promedio horas/día: ${(totalHours / data.length).toFixed(2)}h`
    ];
    
    stats.forEach((stat, index) => {
      const x = margin + 5 + (index % 2) * 90;
      const y = yPosition + Math.floor(index / 2) * 5;
      pdf.text(stat, x, y);
    });

    yPosition += 15;

    // Tabla de datos
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    
    const colPositions = [margin + 2, margin + 25, margin + 65, margin + 85, margin + 105, margin + 130, margin + 155];
    const headers = ['Fecha', 'Empleado', 'Entrada', 'Salida', 'Horas', 'Estado'];
    
    headers.forEach((header, index) => {
      pdf.text(header, colPositions[index], yPosition + 6);
    });
    
    yPosition += 12;

    // Datos de la tabla
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    
    data.slice(0, 35).forEach((record, index) => { // Máximo 35 registros por página
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');
      }
      
      const rowData = [
        record.date,
        record.employee.length > 15 ? record.employee.substring(0, 12) + '...' : record.employee,
        record.entryTime,
        record.exitTime,
        record.hoursWorked + 'h',
        record.status
      ];
      
      rowData.forEach((cell, cellIndex) => {
        pdf.text(cell.toString(), colPositions[cellIndex], yPosition + 3);
      });
      
      yPosition += 6;
    });

    if (data.length > 35) {
      pdf.setFont('helvetica', 'italic');
      pdf.text(`... y ${data.length - 35} registros más`, margin + 2, yPosition + 5);
    }

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, footerY - 5, pageWidth, 25, 'F');
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('CMG HIDRÁULICA S.L. - Sistema de Control de Presencia', pageWidth / 2, footerY + 5, { align: 'center' });
    pdf.text('Polígono Industrial Norte, Valencia | Tel: +34 961 234 567', pageWidth / 2, footerY + 10, { align: 'center' });

    // Guardar PDF
    const fileName = `Informe_Fichadas_${filters.startDate || 'inicio'}_${filters.endDate || 'fin'}.pdf`;
    pdf.save(fileName);

    toast({
      title: "PDF generado",
      description: `Informe de fichadas exportado correctamente en formato PDF.`,
    });
  };

  const handleExport = () => {
    switch (filters.format) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'pdf':
        exportToPDF();
        break;
      default:
        exportToCSV();
    }
  };

  const previewData = generateAttendanceData().slice(0, 5);
  const totalRecords = generateAttendanceData().length;
  const totalHours = generateAttendanceData().reduce((sum, record) => sum + record.hoursWorked, 0);
  const uniqueEmployees = [...new Set(generateAttendanceData().map(record => record.employee))].length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Exportación de Fichadas de Presencia
          </CardTitle>
          <CardDescription>
            Exporta los registros de fichadas de presencia del personal en diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fecha de Inicio
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fecha de Fin
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Empleado
              </label>
              <select
                value={filters.selectedEmployee}
                onChange={(e) => setFilters({...filters, selectedEmployee: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los empleados</option>
                {personnel.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Formato
              </label>
              <select
                value={filters.format}
                onChange={(e) => setFilters({...filters, format: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV (Excel)</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
                  <div className="text-sm text-blue-700">Total Fichajes</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{totalHours.toFixed(1)}h</div>
                  <div className="text-sm text-green-700">Horas Totales</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{uniqueEmployees}</div>
                  <div className="text-sm text-purple-700">Empleados</div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {generateAttendanceData().filter(r => r.status === 'Completa').length}
                  </div>
                  <div className="text-sm text-orange-700">Sesiones Completas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Vista Previa de Datos</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Empleado</th>
                    <th className="px-4 py-2 text-left">Entrada</th>
                    <th className="px-4 py-2 text-left">Salida</th>
                    <th className="px-4 py-2 text-left">Horas</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((record, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2">{record.date}</td>
                      <td className="px-4 py-2">{record.employee}</td>
                      <td className="px-4 py-2">{record.entryTime}</td>
                      <td className="px-4 py-2">{record.exitTime}</td>
                      <td className="px-4 py-2">{record.hoursWorked}h</td>
                      <td className="px-4 py-2">
                        <Badge className={record.status === 'Completa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalRecords > 5 && (
                <div className="px-4 py-2 text-center text-gray-500 text-sm border-t border-gray-200">
                  ... y {totalRecords - 5} registros más
                </div>
              )}
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="flex gap-3">
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar {filters.format.toUpperCase()}
            </Button>
            
            {filters.format !== 'pdf' && (
              <Button onClick={exportToPDF} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceExportTab;