import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CalendarView = ({ appointments, viewMode, currentDate, onDateChange, onAppointmentClick, onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const formatTime = (time, duration) => {
    const [hours, minutes] = time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return `${time} - ${endTime.toTimeString().slice(0, 5)}`;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
    }
    
    onDateChange(newDate);
  };

  const getDateRange = () => {
    const date = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        return date.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('es-ES', { 
          month: 'long', 
          year: 'numeric' 
        });
      default:
        return '';
    }
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        {dayAppointments.length > 0 ? (
          dayAppointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onAppointmentClick(appointment)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{appointment.title}</h3>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <Badge className={getTypeColor(appointment.type)}>
                      {appointment.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
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
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No hay citas programadas para este día</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <Card 
              key={index} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm text-center">
                  <div className="font-medium">
                    {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                    {day.getDate()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div 
                      key={apt.id}
                      className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                    >
                      {apt.time} - {apt.title}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 3} más
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
    
    const weeks = [];
    const currentWeekDate = new Date(startDate);
    
    while (currentWeekDate <= lastDay || currentWeekDate.getDay() !== 1) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentWeekDate));
        currentWeekDate.setDate(currentWeekDate.getDate() + 1);
      }
      weeks.push(week);
      
      if (currentWeekDate.getMonth() !== month && currentWeekDate.getDay() === 1) {
        break;
      }
    }

    return (
      <div className="space-y-2">
        {/* Header días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Semanas */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isCurrentMonth = day.getMonth() === month;
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <Card 
                  key={dayIndex}
                  className={`cursor-pointer hover:shadow-md transition-shadow h-24 ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => onDateClick(day)}
                >
                  <CardContent className="p-2 h-full">
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div 
                          key={apt.id}
                          className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt);
                          }}
                        >
                          {apt.time}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAppointments.length - 2}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {getDateRange()}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDateChange(new Date())}
          >
            Hoy
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  );
};

export default CalendarView;