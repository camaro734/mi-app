import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Wrench,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AttendanceClockModal from '@/components/attendance/AttendanceClockModal';
import AttendanceReports from '@/components/attendance/AttendanceReports';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAttendanceClock, setShowAttendanceClock] = useState(false);
  const [showAttendanceReports, setShowAttendanceReports] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const stats = [
    {
      title: 'Partes Abiertos',
      value: '12',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2 desde ayer'
    },
    {
      title: 'Citas Hoy',
      value: '8',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '3 completadas'
    },
    {
      title: 'Técnicos Activos',
      value: '6',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: 'Todos disponibles'
    },
    {
      title: 'Urgentes',
      value: '3',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: 'Requieren atención'
    }
  ];

  const recentWorkOrders = [
    {
      id: 'WO-2024-001',
      client: 'Construcciones García S.L.',
      machine: 'Excavadora CAT 320D',
      status: 'En curso',
      technician: 'Miguel García',
      priority: 'Alta'
    },
    {
      id: 'WO-2024-002',
      client: 'Transportes Martínez',
      machine: 'Grúa Liebherr LTM 1050',
      status: 'Pendiente',
      technician: 'Carlos López',
      priority: 'Media'
    },
    {
      id: 'WO-2024-003',
      client: 'Obras Públicas Valencia',
      machine: 'Bulldozer Komatsu D65',
      status: 'Completado',
      technician: 'Ana Rodríguez',
      priority: 'Baja'
    }
  ];

  const upcomingAppointments = [
    {
      time: '09:00',
      client: 'Industrias Pérez',
      type: 'Mantenimiento preventivo',
      technician: 'Miguel García'
    },
    {
      time: '11:30',
      client: 'Construcciones López',
      type: 'Reparación urgente',
      technician: 'Carlos López'
    },
    {
      time: '14:00',
      client: 'Transportes Valencia',
      type: 'Revisión anual',
      technician: 'Ana Rodríguez'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'En curso': return 'bg-blue-100 text-blue-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Completado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showAttendanceReports) {
    return (
      <>
        <Helmet>
          <title>Informes de Presencia - CMG HIDRÁULICA S.L.</title>
          <meta name="description" content="Informes de asistencia y horas trabajadas del personal." />
        </Helmet>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowAttendanceReports(false)}
            >
              ← Volver al Dashboard
            </Button>
          </div>
          <AttendanceReports />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel de Control - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Panel de control principal del sistema de gestión de CMG HIDRÁULICA S.L." />
      </Helmet>

      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()}, {user?.name}
              </h1>
              <p className="text-blue-100">
                Bienvenido al sistema de gestión de CMG HIDRÁULICA S.L.
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            
            {/* Attendance Clock Button */}
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => setShowAttendanceClock(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Fichar Presencia
              </Button>
              
              {(user?.role === 'admin' || user?.role === 'supervisor') && (
                <Button 
                  onClick={() => setShowAttendanceReports(true)}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Ver Informes
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Work Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Partes de Trabajo Recientes
                </CardTitle>
                <CardDescription>
                  Últimos partes de trabajo registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWorkOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.client}</p>
                        <p className="text-xs text-gray-500">{order.machine}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Próximas Citas
                </CardTitle>
                <CardDescription>
                  Agenda de hoy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{appointment.client}</p>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <p className="text-xs text-gray-500">Técnico: {appointment.technician}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        {user?.role !== 'technician' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Accesos directos a las funciones más utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => navigate('/partes/nuevo')}
                    className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                  >
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium">Nuevo Parte</span>
                  </button>
                  <button 
                    onClick={() => navigate('/agenda')}
                    className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
                  >
                    <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium">Nueva Cita</span>
                  </button>
                  <button 
                    onClick={() => navigate('/ajustes')}
                    className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
                  >
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium">Gestión Personal</span>
                  </button>
                  <button 
                    onClick={() => setShowAttendanceReports(true)}
                    className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center"
                  >
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <span className="text-sm font-medium">Ver Informes</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Attendance Clock Modal */}
        {showAttendanceClock && (
          <AttendanceClockModal onClose={() => setShowAttendanceClock(false)} />
        )}
      </div>
    </>
  );
}
