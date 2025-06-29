import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VacationCalendar = ({ approvedVacations, calculateDays }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: prevDate
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: fullDate
      });
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: nextDate
      });
    }

    return days;
  };

  const getVacationsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return approvedVacations.filter(vacation => {
      const startDate = vacation.start_date;
      const endDate = vacation.end_date;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const currentAndFutureVacations = approvedVacations.filter(v => {
    const today = new Date();
    const end = new Date(v.end_date);
    return end >= today;
  });

  return (
    <div className="space-y-6">
      {/* Calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Calendario de Vacaciones
              </CardTitle>
              <CardDescription>
                Visualización mensual de las vacaciones aprobadas
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-lg min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Encabezados de días */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const vacationsForDay = getVacationsForDate(day.fullDate);
              const hasVacations = vacationsForDay.length > 0;
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-1 border border-gray-200 rounded-lg relative
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday(day.fullDate) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${hasVacations ? 'bg-green-50 border-green-200' : ''}
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isToday(day.fullDate) ? 'text-blue-700' : ''}
                  `}>
                    {day.date}
                  </div>
                  
                  {hasVacations && (
                    <div className="space-y-1">
                      {vacationsForDay.slice(0, 2).map((vacation, vIndex) => (
                        <div
                          key={vIndex}
                          className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate"
                          title={`${vacation.user_name} - ${vacation.reason || 'Vacaciones'}`}
                        >
                          {vacation.user_name.split(' ')[0]}
                        </div>
                      ))}
                      {vacationsForDay.length > 2 && (
                        <div className="text-xs text-green-600 font-medium">
                          +{vacationsForDay.length - 2} más
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de vacaciones activas y próximas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal de Vacaciones
          </CardTitle>
          <CardDescription>
            Empleados actualmente de vacaciones y próximas ausencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentAndFutureVacations.length > 0 ? (
              currentAndFutureVacations.map((vacation) => {
                const today = new Date();
                const start = new Date(vacation.start_date);
                const end = new Date(vacation.end_date);
                const isActive = today >= start && today <= end;
                const daysLeft = isActive ? 
                  Math.ceil((end - today) / (1000 * 60 * 60 * 24)) : 
                  Math.ceil((start - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <div 
                    key={vacation.id} 
                    className={`p-4 rounded-lg border ${
                      isActive ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium text-lg">{vacation.user_name}</p>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isActive ? 'De vacaciones' : 'Próximamente'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Fechas:</span> {' '}
                            {new Date(vacation.start_date).toLocaleDateString('es-ES')} - {' '}
                            {new Date(vacation.end_date).toLocaleDateString('es-ES')}
                          </p>
                          {vacation.reason && (
                            <p>
                              <span className="font-medium">Motivo:</span> {vacation.reason}
                            </p>
                          )}
                          {vacation.comments && (
                            <p>
                              <span className="font-medium">Comentarios:</span> {vacation.comments}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {calculateDays(vacation.start_date, vacation.end_date)}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {calculateDays(vacation.start_date, vacation.end_date) === 1 ? 'día' : 'días'}
                        </div>
                        
                        {isActive && daysLeft > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            {daysLeft} {daysLeft === 1 ? 'día restante' : 'días restantes'}
                          </div>
                        )}
                        
                        {!isActive && daysLeft > 0 && (
                          <div className="text-sm text-blue-600 font-medium">
                            En {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay vacaciones programadas
                </h3>
                <p className="text-gray-600">
                  Cuando se aprueben solicitudes de vacaciones aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationCalendar;