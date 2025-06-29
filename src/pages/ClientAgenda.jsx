import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewAppointmentModal from '@/components/agenda/NewAppointmentModal';
import CalendarView from '@/components/agenda/CalendarView';

export default function ClientAgenda() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      title: 'Mantenimiento Excavadora',
      client: 'Construcciones García S.L.',
      date: '2024-01-18',
      time: '09:00',
      duration: 120,
      technician: 'Miguel García',
      location: 'Polígono Industrial Norte',
      type: 'Mantenimiento',
      status: 'Confirmada',
      machine: 'Excavadora CAT 320D',
      priority: 'Media'
    },
    {
      id: 2,
      title: 'Reparación Urgente Grúa',
      client: 'Transportes Martínez',
      date: '2024-01-18',
      time: '11:30',
      duration: 180,
      technician: 'Carlos López',
      location: 'Obra Centro Comercial',
      type: 'Reparación',
      status: 'Pendiente',
      machine: 'Grúa Liebherr LTM 1050',
      priority: 'Alta'
    },
    {
      id: 3,
      title: 'Inspección Anual',
      client: 'Obras Públicas Valencia',
      date: '2024-01-19',
      time: '08:00',
      duration: 90,
      technician: 'Ana Rodríguez',
      location: 'Taller CMG',
      type: 'Inspección',
      status: 'Confirmada',
      machine: 'Bulldozer Komatsu D65',
      priority: 'Baja'
    },
    {
      id: 4,
      title: 'Presupuesto Nuevo Cliente',
      client: 'Industrias Pérez',
      date: '2024-01-19',
      time: '15:00',
      duration: 60,
      technician: 'Miguel García',
      location: 'Oficinas Cliente',
      type: 'Presupuesto',
      status: 'Confirmada',
      machine: 'Retroexcavadora JCB 3CX',
      priority: 'Media'
    }
  ]);

  // Verificar permisos para crear citas
  const canCreateAppointments = user?.role === 'admin' || user?.role === 'supervisor';

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmada': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      case 'Completada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Mantenimiento': return 'bg-blue-100 text-blue-800';
      case 'Reparación': return 'bg-red-100 text-red-800';
      case 'Inspección': return 'bg-purple-100 text-purple-800';
      case 'Presupuesto': return 'bg-orange-100 text-orange-800';
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

  const formatTime = (time, duration) => {
    const [hours, minutes] = time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return `${time} - ${endTime.toTimeString().slice(0, 5)}`;
  };

  const handleCreateAppointment = () => {
    if (!canCreateAppointments) {
      toast({
        title: "Sin permisos",
        description: "Solo los administradores y jefes de taller pueden crear citas.",
        variant: "destructive"
      });
      return;
    }
    setShowNewAppointmentModal(true);
  };

  const handleSaveAppointment = (appointmentData) => {
    setAppointments(prev => [...prev, appointmentData]);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (canCreateAppointments) {
      setShowNewAppointmentModal(true);
    }
  };

  const handleAppointmentClick = (appointment) => {
    toast({
      title: "Detalles de la cita",
      description: `${appointment.title} - ${appointment.client}`,
    });
  };

  const handleFilter = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.technician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  return (
    <>
      <Helmet>
        <title>Agenda de Clientes - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de citas y agenda de clientes para servicios de maquinaria hidráulica." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda de Clientes</h1>
            <p className="text-gray-600">Gestiona citas y programación de servicios</p>
          </div>
          
          {canCreateAppointments && (
            <Button onClick={handleCreateAppointment} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          )}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, técnico o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 text-sm rounded ${viewMode === 'day' ? 'bg-white shadow' : ''}`}
                  >
                    Día
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 text-sm rounded ${viewMode === 'week' ? 'bg-white shadow' : ''}`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-sm rounded ${viewMode === 'month' ? 'bg-white shadow' : ''}`}
                  >
                    Mes
                  </button>
                </div>
                
                <Button variant="outline" onClick={handleFilter}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <CalendarView
          appointments={filteredAppointments}
          viewMode={viewMode}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onAppointmentClick={handleAppointmentClick}
          onDateClick={handleDateClick}
        />

        {/* Lista de citas (solo para vista de día cuando hay resultados de búsqueda) */}
        {viewMode === 'day' && searchTerm && Object.keys(groupedAppointments).length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {new Date(date).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </CardTitle>
                    <CardDescription>
                      {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''} programada{dayAppointments.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {dayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <Badge className={getTypeColor(appointment.type)}>
                                {appointment.type}
                              </Badge>
                              <Badge className={getPriorityColor(appointment.priority)}>
                                {appointment.priority}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(appointment.time, appointment.duration)}
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {appointment.technician}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {appointment.location}
                              </div>
                              <div className="font-medium text-gray-900">
                                {appointment.client}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-500 mt-1">
                              {appointment.machine}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                            {canCreateAppointments && (
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredAppointments.length === 0 && searchTerm && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron citas
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda{canCreateAppointments ? ' o crear una nueva cita' : ''}.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Citas Hoy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">15</div>
              <div className="text-sm text-gray-600">Esta Semana</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">92%</div>
              <div className="text-sm text-gray-600">Cumplimiento</div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        {showNewAppointmentModal && (
          <NewAppointmentModal
            onClose={() => {
              setShowNewAppointmentModal(false);
              setSelectedDate(null);
            }}
            onSave={handleSaveAppointment}
            selectedDate={selectedDate?.toISOString().split('T')[0]}
          />
        )}
      </div>
    </>
  );
}