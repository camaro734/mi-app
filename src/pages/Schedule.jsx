import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Schedule = () => {
  const { appointments, addAppointment } = useData();
  const { hasPermission } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  const handleNewAppointment = () => {
    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <>
      <Helmet>
        <title>Agenda de Clientes - CMG Hidráulica</title>
        <meta name="description" content="Gestión de citas y agenda de clientes de CMG Hidráulica S.L." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda de Clientes</h1>
            <p className="text-gray-600">Gestiona citas y trabajos programados</p>
          </div>
          {hasPermission('schedule') && (
            <Button onClick={handleNewAppointment} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nueva Cita</span>
            </Button>
          )}
        </div>

        {/* Calendar Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button variant="outline" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewMode('month')}
                  size="sm"
                >
                  Mes
                </Button>
                <Button 
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  onClick={() => setViewMode('week')}
                  size="sm"
                >
                  Semana
                </Button>
                <Button 
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  onClick={() => setViewMode('day')}
                  size="sm"
                >
                  Día
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayAppointments = getAppointmentsForDate(day);
                const isToday = day && day.toDateString() === today.toDateString();
                const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={`
                      min-h-[100px] p-2 border border-gray-200 rounded-lg
                      ${!day ? 'bg-gray-50' : ''}
                      ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                      ${!isCurrentMonth ? 'text-gray-400' : ''}
                      hover:bg-gray-50 transition-colors cursor-pointer
                    `}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((apt, aptIndex) => (
                            <div
                              key={aptIndex}
                              className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                            >
                              {apt.time} - {apt.client}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayAppointments.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Próximas Citas
              </CardTitle>
              <CardDescription>
                Citas programadas para los próximos días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.client}</p>
                        <p className="text-sm text-gray-600">{apt.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {apt.time}
                          {apt.location && (
                            <>
                              <MapPin className="w-3 h-3 ml-2 mr-1" />
                              {apt.location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(apt.date).toLocaleDateString()}</p>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Confirmada
                      </span>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No hay citas programadas</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen del Día</CardTitle>
              <CardDescription>
                Estadísticas de citas para hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">Citas Programadas</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {getAppointmentsForDate(today).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">Citas Completadas</span>
                  <span className="text-2xl font-bold text-green-600">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-800 font-medium">Citas Pendientes</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {getAppointmentsForDate(today).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Schedule;