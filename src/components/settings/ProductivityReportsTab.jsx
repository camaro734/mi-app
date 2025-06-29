import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, User, FileText, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const ProductivityReportsTab = () => {
  const { personnel, workOrders } = useData();
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] = useState([]);
  const [filters, setFilters] = useState({
    userId: 'all',
    period: 'month',
    startDate: '',
    endDate: ''
  });
  const [productivityData, setProductivityData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateProductivity();
  }, [attendanceData, workOrders, filters]);

  const loadData = () => {
    const globalAttendance = JSON.parse(localStorage.getItem('global_attendance') || '[]');
    setAttendanceData(globalAttendance);
  };

  const calculateProductivity = () => {
    const now = new Date();
    let startDate, endDate;

    // Determinar período
    switch (filters.period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        if (filters.startDate && filters.endDate) {
          startDate = new Date(filters.startDate);
          endDate = new Date(filters.endDate);
        }
    }

    // Filtrar datos por período
    const filteredAttendance = attendanceData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate);
    });

    const filteredWorkOrders = workOrders.filter(wo => {
      const woDate = new Date(wo.createdDate);
      return (!startDate || woDate >= startDate) && (!endDate || woDate <= endDate);
    });

    // Calcular productividad por empleado
    const productivity = personnel.map(employee => {
      // Horas de presencia
      const employeeAttendance = filteredAttendance.filter(entry => 
        entry.userId === employee.id && entry.hoursWorked
      );
      const totalPresenceHours = employeeAttendance.reduce((sum, entry) => 
        sum + (entry.hoursWorked || 0), 0
      );

      // Partes de trabajo asignados
      const assignedWorkOrders = filteredWorkOrders.filter(wo => 
        wo.assignedTechnicians?.includes(employee.name)
      );
      const completedWorkOrders = assignedWorkOrders.filter(wo => 
        wo.status === 'Completado' || wo.status === 'Validado'
      );

      // Horas trabajadas en partes
      const totalWorkOrderHours = assignedWorkOrders.reduce((sum, wo) => 
        sum + (wo.workedHours || 0), 0
      );

      // Eficiencia (horas trabajadas vs horas estimadas)
      const totalEstimatedHours = assignedWorkOrders.reduce((sum, wo) => 
        sum + (wo.estimatedHours || 0), 0
      );
      const efficiency = totalEstimatedHours > 0 ? 
        (totalWorkOrderHours / totalEstimatedHours) * 100 : 0;

      // Productividad (partes completados por hora de presencia)
      const productivity = totalPresenceHours > 0 ? 
        completedWorkOrders.length / totalPresenceHours : 0;

      // Calidad (partes completados sin exceder tiempo estimado)
      const onTimeWorkOrders = completedWorkOrders.filter(wo => 
        (wo.workedHours || 0) <= (wo.estimatedHours || 0)
      );
      const qualityScore = completedWorkOrders.length > 0 ? 
        (onTimeWorkOrders.length / completedWorkOrders.length) * 100 : 0;

      return {
        employee,
        totalPresenceHours: Math.round(totalPresenceHours * 100) / 100,
        totalWorkOrderHours: Math.round(totalWorkOrderHours * 100) / 100,
        assignedWorkOrders: assignedWorkOrders.length,
        completedWorkOrders: completedWorkOrders.length,
        efficiency: Math.round(efficiency * 100) / 100,
        productivity: Math.round(productivity * 1000) / 1000,
        qualityScore: Math.round(qualityScore * 100) / 100,
        attendanceDays: new Set(employeeAttendance.map(entry => entry.date)).size
      };
    });

    // Filtrar por usuario si se especifica
    const finalData = filters.userId === 'all' ? 
      productivity : 
      productivity.filter(p => p.employee.id === parseInt(filters.userId));

    setProductivityData(finalData);
  };

  const getPeriodLabel = () => {
    switch (filters.period) {
      case 'week': return 'Última Semana';
      case 'month': return 'Este Mes';
      case 'quarter': return 'Este Trimestre';
      case 'year': return 'Este Año';
      default: return 'Período Personalizado';
    }
  };

  const getProductivityLevel = (productivity) => {
    if (productivity >= 0.5) return { label: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (productivity >= 0.3) return { label: 'Buena', color: 'bg-blue-100 text-blue-800' };
    if (productivity >= 0.1) return { label: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Baja', color: 'bg-red-100 text-red-800' };
  };

  const getEfficiencyLevel = (efficiency) => {
    if (efficiency <= 100) return { label: 'Eficiente', color: 'bg-green-100 text-green-800' };
    if (efficiency <= 120) return { label: 'Aceptable', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Mejorable', color: 'bg-red-100 text-red-800' };
  };

  const calculateOverallStats = () => {
    if (productivityData.length === 0) return null;

    const totalPresenceHours = productivityData.reduce((sum, p) => sum + p.totalPresenceHours, 0);
    const totalWorkOrderHours = productivityData.reduce((sum, p) => sum + p.totalWorkOrderHours, 0);
    const totalCompleted = productivityData.reduce((sum, p) => sum + p.completedWorkOrders, 0);
    const avgEfficiency = productivityData.reduce((sum, p) => sum + p.efficiency, 0) / productivityData.length;
    const avgQuality = productivityData.reduce((sum, p) => sum + p.qualityScore, 0) / productivityData.length;

    return {
      totalPresenceHours: Math.round(totalPresenceHours * 100) / 100,
      totalWorkOrderHours: Math.round(totalWorkOrderHours * 100) / 100,
      totalCompleted,
      avgEfficiency: Math.round(avgEfficiency * 100) / 100,
      avgQuality: Math.round(avgQuality * 100) / 100,
      utilizationRate: totalPresenceHours > 0 ? 
        Math.round((totalWorkOrderHours / totalPresenceHours) * 10000) / 100 : 0
    };
  };

  const overallStats = calculateOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informes de Productividad</h2>
          <p className="text-gray-600">Análisis de rendimiento y eficiencia del personal técnico</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Filtros de Análisis
          </CardTitle>
          <CardDescription>
            Configura el período y empleado para analizar la productividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                {personnel.filter(p => p.role === 'technician').map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Período
              </label>
              <select
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Última Semana</option>
                <option value="month">Este Mes</option>
                <option value="quarter">Este Trimestre</option>
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
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overallStats.totalPresenceHours}h
              </div>
              <div className="text-sm text-gray-600">Horas Presencia</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {overallStats.totalWorkOrderHours}h
              </div>
              <div className="text-sm text-gray-600">Horas Trabajo</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {overallStats.totalCompleted}
              </div>
              <div className="text-sm text-gray-600">Partes Completados</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {overallStats.utilizationRate}%
              </div>
              <div className="text-sm text-gray-600">Utilización</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {overallStats.avgEfficiency}%
              </div>
              <div className="text-sm text-gray-600">Eficiencia Media</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {overallStats.avgQuality}%
              </div>
              <div className="text-sm text-gray-600">Calidad Media</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Productivity Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Análisis Individual - {getPeriodLabel()}
          </CardTitle>
          <CardDescription>
            Métricas detalladas de productividad por empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productivityData.length > 0 ? (
            <div className="space-y-4">
              {productivityData.map((data, index) => {
                const productivityLevel = getProductivityLevel(data.productivity);
                const efficiencyLevel = getEfficiencyLevel(data.efficiency);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 p-6 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{data.employee.name}</h3>
                          <p className="text-sm text-gray-600">{data.employee.role === 'technician' ? 'Técnico' : data.employee.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Badge className={productivityLevel.color}>
                          {productivityLevel.label}
                        </Badge>
                        <Badge className={efficiencyLevel.color}>
                          {efficiencyLevel.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {data.totalPresenceHours}h
                        </div>
                        <div className="text-xs text-gray-600">Presencia</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {data.totalWorkOrderHours}h
                        </div>
                        <div className="text-xs text-gray-600">Trabajo</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">
                          {data.completedWorkOrders}
                        </div>
                        <div className="text-xs text-gray-600">Completados</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {data.assignedWorkOrders}
                        </div>
                        <div className="text-xs text-gray-600">Asignados</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">
                          {data.efficiency}%
                        </div>
                        <div className="text-xs text-gray-600">Eficiencia</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-indigo-600">
                          {data.qualityScore}%
                        </div>
                        <div className="text-xs text-gray-600">Calidad</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-teal-600">
                          {data.attendanceDays}
                        </div>
                        <div className="text-xs text-gray-600">Días</div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Utilización del tiempo</span>
                          <span>{data.totalPresenceHours > 0 ? Math.round((data.totalWorkOrderHours / data.totalPresenceHours) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${data.totalPresenceHours > 0 ? Math.min((data.totalWorkOrderHours / data.totalPresenceHours) * 100, 100) : 0}%`
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Tasa de finalización</span>
                          <span>{data.assignedWorkOrders > 0 ? Math.round((data.completedWorkOrders / data.assignedWorkOrders) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${data.assignedWorkOrders > 0 ? (data.completedWorkOrders / data.assignedWorkOrders) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No hay datos de productividad para el período seleccionado</p>
              <p className="text-xs mt-1">Verifica que hay partes de trabajo y fichajes registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Explicación de Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Métricas de Tiempo</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Presencia:</strong> Horas totales fichadas en la empresa</li>
                <li><strong>Trabajo:</strong> Horas efectivas trabajadas en partes</li>
                <li><strong>Utilización:</strong> % de tiempo de presencia dedicado a partes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Métricas de Rendimiento</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Eficiencia:</strong> Horas trabajadas vs. horas estimadas</li>
                <li><strong>Calidad:</strong> % de partes completados dentro del tiempo estimado</li>
                <li><strong>Productividad:</strong> Partes completados por hora de presencia</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityReportsTab;