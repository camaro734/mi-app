import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Download, 
  Filter, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  FileText,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });
  const [selectedReport, setSelectedReport] = useState('');

  // Datos de ejemplo para los informes
  const reportData = {
    workOrders: {
      total: 45,
      completed: 32,
      inProgress: 8,
      pending: 5,
      byTechnician: [
        { name: 'Miguel García', completed: 12, hours: 96 },
        { name: 'Carlos López', completed: 10, hours: 80 },
        { name: 'Ana Rodríguez', completed: 8, hours: 64 },
        { name: 'Luis Fernández', completed: 2, hours: 16 }
      ],
      byClient: [
        { name: 'Construcciones García S.L.', orders: 8, revenue: 12500 },
        { name: 'Transportes Martínez', orders: 6, revenue: 9800 },
        { name: 'Obras Públicas Valencia', orders: 5, revenue: 7200 },
        { name: 'Industrias Pérez', orders: 4, revenue: 15600 }
      ]
    },
    revenue: {
      total: 85600,
      budgets: 45200,
      completed: 40400,
      pending: 25800,
      byMonth: [
        { month: 'Enero', amount: 85600, budgets: 12 }
      ]
    },
    efficiency: {
      averageCompletionTime: 6.5,
      onTimeCompletion: 87,
      customerSatisfaction: 94,
      materialUsage: 78
    }
  };

  const reportTypes = [
    {
      id: 'work-orders',
      title: 'Informe de Partes de Trabajo',
      description: 'Análisis detallado de partes completados, en curso y pendientes',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'technician-performance',
      title: 'Rendimiento de Técnicos',
      description: 'Productividad y eficiencia del personal técnico',
      icon: Users,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'client-activity',
      title: 'Actividad por Cliente',
      description: 'Servicios prestados y facturación por cliente',
      icon: BarChart3,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'financial',
      title: 'Informe Financiero',
      description: 'Ingresos, presupuestos y análisis de rentabilidad',
      icon: DollarSign,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'time-tracking',
      title: 'Control de Tiempos',
      description: 'Análisis de horas trabajadas y eficiencia temporal',
      icon: Clock,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'materials',
      title: 'Uso de Materiales',
      description: 'Consumo de materiales y gestión de inventario',
      icon: PieChart,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un tipo de informe.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Informes - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Generación de informes de actividad, rendimiento y análisis de datos empresariales." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Informes</h1>
            <p className="text-gray-600">Genera informes detallados de actividad y rendimiento</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{reportData.workOrders.total}</div>
              <div className="text-sm text-gray-600">Partes Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">€{reportData.revenue.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Facturación</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{reportData.efficiency.onTimeCompletion}%</div>
              <div className="text-sm text-gray-600">Cumplimiento</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{reportData.efficiency.customerSatisfaction}%</div>
              <div className="text-sm text-gray-600">Satisfacción</div>
            </CardContent>
          </Card>
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Generador de Informes
            </CardTitle>
            <CardDescription>
              Configura y genera informes personalizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleGenerateReport} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generar
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipos de Informes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedReport === report.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${report.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sample Data Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technician Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Rendimiento por Técnico
              </CardTitle>
              <CardDescription>
                Partes completados y horas trabajadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.workOrders.byTechnician.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{tech.name}</p>
                      <p className="text-sm text-gray-600">{tech.completed} partes completados</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{tech.hours}h</p>
                      <p className="text-xs text-gray-500">trabajadas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Facturación por Cliente
              </CardTitle>
              <CardDescription>
                Ingresos generados por cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.workOrders.byClient.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.orders} servicios</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">€{client.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">facturado</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Efficiency Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Métricas de Eficiencia
            </CardTitle>
            <CardDescription>
              Indicadores clave de rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {reportData.efficiency.averageCompletionTime}h
                </div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-xs text-gray-500">por parte completado</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportData.efficiency.onTimeCompletion}%
                </div>
                <p className="text-sm text-gray-600">Cumplimiento</p>
                <p className="text-xs text-gray-500">entregas a tiempo</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {reportData.efficiency.customerSatisfaction}%
                </div>
                <p className="text-sm text-gray-600">Satisfacción</p>
                <p className="text-xs text-gray-500">del cliente</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {reportData.efficiency.materialUsage}%
                </div>
                <p className="text-sm text-gray-600">Uso Materiales</p>
                <p className="text-xs text-gray-500">eficiencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}