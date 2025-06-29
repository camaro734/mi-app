import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Download, Filter, User, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const AttendanceReports = () => {
  const { personnel } = useData();
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    period: 'week', // day, week, month, year
    startDate: '',
    endDate: '',
    userId: 'all'
  });

  useEffect(() => {
    loadAttendanceData();
  }, []);

  useEffect(() => {
    filterAttendanceData();
  }, [attendanceData, filters]);

  const loadAttendanceData = () => {
    const globalAttendance = JSON.parse(localStorage.getItem('global_attendance') || '[]');
    setAttendanceData(globalAttendance);
  };

  const filterAttendanceData = () => {
    let filtered = [...attendanceData];

    // Filtrar por usuario
    if (filters.userId !== 'all') {
      filtered = filtered.filter(entry => entry.userId === parseInt(filters.userId));
    }

    // Filtrar por período
    const now = new Date();
    let startDate, endDate;

    switch (filters.period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        if (filters.startDate && filters.endDate) {
          startDate = new Date(filters.startDate);
          endDate = new Date(filters.endDate);
          endDate.setDate(endDate.getDate() + 1);
        }
    }

    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate < endDate;
      });
    }

    setFilteredData(filtered);
  };

  const calculateStats = () => {
    const stats = {
      totalHours: 0,
      totalDays: 0,
      averageHours: 0,
      byUser: {}
    };

    // Agrupar por usuario
    filteredData.forEach(entry => {
      if (!entry.hoursWorked) return;

      const userId = entry.userId;
      if (!stats.byUser[userId]) {
        stats.byUser[userId] = {
          name: entry.user,
          totalHours: 0,
          days: new Set(),
          entries: []
        };
      }

      stats.byUser[userId].totalHours += entry.hoursWorked;
      stats.byUser[userId].days.add(entry.date);
      stats.byUser[userId].entries.push(entry);
      stats.totalHours += entry.hoursWorked;
    });

    // Calcular días únicos
    const uniqueDays = new Set();
    filteredData.forEach(entry => {
      if (entry.hoursWorked) {
        uniqueDays.add(entry.date);
      }
    });
    stats.totalDays = uniqueDays.size;

    // Calcular promedio
    const userCount = Object.keys(stats.byUser).length;
    stats.averageHours = userCount > 0 ? stats.totalHours / userCount : 0;

    return stats;
  };

  const stats = calculateStats();

  const getPeriodLabel = () => {
    switch (filters.period) {
      case 'day': return 'Hoy';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mes';
      case 'year': return 'Este Año';
      default: return 'Período Personalizado';
    }
  };

  const handleExport = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informes de Presencia</h2>
          <p className="text-gray-600">Análisis de horas trabajadas y asistencia del personal</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Período
              </label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {filters.period === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha Inicio
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha Fin
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Empleado
              </label>
              <select
                value={filters.userId}
                onChange={(e) => setFilters({...filters, userId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los empleados</option>
                {personnel.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatHours(stats.totalHours)}
            </div>
            <div className="text-sm text-gray-600">Horas Totales</div>
            <div className="text-xs text-gray-500">{getPeriodLabel()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalDays}
            </div>
            <div className="text-sm text-gray-600">Días Trabajados</div>
            <div className="text-xs text-gray-500">{getPeriodLabel()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatHours(stats.averageHours)}
            </div>
            <div className="text-sm text-gray-600">Promedio por Empleado</div>
            <div className="text-xs text-gray-500">{getPeriodLabel()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(stats.byUser).length}
            </div>
            <div className="text-sm text-gray-600">Empleados Activos</div>
            <div className="text-xs text-gray-500">{getPeriodLabel()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Detalle por Empleado - {getPeriodLabel()}
          </CardTitle>
          <CardDescription>
            Horas trabajadas y días de asistencia por empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.byUser).length > 0 ? (
            <div className="space-y-4">
              {Object.values(stats.byUser).map((userStats, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{userStats.name}</p>
                      <p className="text-sm text-gray-600">
                        {userStats.days.size} días trabajados
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {formatHours(userStats.totalHours)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userStats.days.size > 0 ? formatHours(userStats.totalHours / userStats.days.size) : '0h'} promedio/día
                      </p>
                    </div>
                    
                    <Badge className="bg-green-100 text-green-800">
                      {userStats.entries.length} fichajes
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No hay datos de asistencia para el período seleccionado</p>
              <p className="text-xs mt-1">Los empleados deben fichar para generar informes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReports;