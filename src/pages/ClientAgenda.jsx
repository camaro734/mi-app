import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

import NewAppointmentModal from '@/components/agenda/NewAppointmentModal';
import CalendarView from '@/components/agenda/CalendarView';
import AgendaHeader from '@/components/agenda/AgendaHeader';
import AgendaFilters from '@/components/agenda/AgendaFilters';
import AgendaList from '@/components/agenda/AgendaList';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function ClientAgenda() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { appointments, addAppointment } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const canCreateAppointments = user?.role === 'admin' || user?.role === 'supervisor';

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
    addAppointment(appointmentData);
    toast({
      title: "Cita creada",
      description: `Se ha programado la cita para ${appointmentData.client}.`
    });
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

  const filteredAppointments = appointments.filter(appointment =>
    appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.technician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Agenda de Clientes - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de citas y agenda de clientes para servicios de maquinaria hidráulica." />
      </Helmet>

      <div className="space-y-6">
        <AgendaHeader 
          canCreate={canCreateAppointments} 
          onCreate={handleCreateAppointment} 
        />
        
        <AgendaFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <CalendarView
          appointments={filteredAppointments}
          viewMode={viewMode}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onAppointmentClick={handleAppointmentClick}
          onDateClick={handleDateClick}
        />

        {viewMode === 'day' && filteredAppointments.length > 0 && (
          <AgendaList
            appointments={filteredAppointments}
            onAppointmentClick={handleAppointmentClick}
            canEdit={canCreateAppointments}
          />
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
