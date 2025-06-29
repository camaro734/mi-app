import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AgendaList = ({ appointments, onAppointmentClick, canEdit }) => {

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
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return `${time} - ${endTime.toTimeString().slice(0, 5)}`;
  };
  
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  return (
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
                {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { 
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
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2 flex-wrap">
                        <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        <Badge className={getTypeColor(appointment.type)}>{appointment.type}</Badge>
                        <Badge className={getPriorityColor(appointment.priority)}>{appointment.priority}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center"><Clock className="h-4 w-4 mr-1" />{formatTime(appointment.time, appointment.duration)}</div>
                        <div className="flex items-center"><User className="h-4 w-4 mr-1" />{appointment.technician}</div>
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{appointment.location}</div>
                        <div className="font-medium text-gray-900">{appointment.client}</div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1">{appointment.machine}</p>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm">Ver</Button>
                      {canEdit && <Button variant="outline" size="sm">Editar</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AgendaList;
