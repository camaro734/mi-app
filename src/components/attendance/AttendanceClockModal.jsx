import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AttendanceClockModal = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cargar asistencia del día actual
    loadTodayAttendance();

    return () => clearInterval(timer);
  }, []);

  const loadTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const attendanceKey = `attendance_${user.id}_${today}`;
    const savedAttendance = localStorage.getItem(attendanceKey);
    
    if (savedAttendance) {
      const attendance = JSON.parse(savedAttendance);
      setTodayAttendance(attendance);
      
      // Verificar si está trabajando actualmente
      const lastEntry = attendance[attendance.length - 1];
      if (lastEntry && lastEntry.type === 'clock_in' && !lastEntry.clockOut) {
        setIsWorking(true);
      }
      
      // Calcular horas totales del día
      calculateTotalHours(attendance);
    }
  };

  const calculateTotalHours = (attendance) => {
    let total = 0;
    
    for (let i = 0; i < attendance.length; i++) {
      const entry = attendance[i];
      if (entry.type === 'clock_in' && entry.clockOut) {
        const clockIn = new Date(entry.timestamp);
        const clockOut = new Date(entry.clockOut);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);
        total += hours;
      }
    }
    
    // Si está trabajando actualmente, añadir tiempo transcurrido
    const currentEntry = attendance.find(entry => 
      entry.type === 'clock_in' && !entry.clockOut
    );
    
    if (currentEntry) {
      const clockIn = new Date(currentEntry.timestamp);
      const now = new Date();
      const currentHours = (now - clockIn) / (1000 * 60 * 60);
      total += currentHours;
    }
    
    setTotalHours(total);
  };

  const handleClockIn = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const attendanceKey = `attendance_${user.id}_${today}`;
    
    const newEntry = {
      id: Date.now(),
      type: 'clock_in',
      timestamp: now.toISOString(),
      user: user.name,
      userId: user.id,
      date: today,
      time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedAttendance = [...todayAttendance, newEntry];
    setTodayAttendance(updatedAttendance);
    localStorage.setItem(attendanceKey, JSON.stringify(updatedAttendance));
    
    // Guardar en registro global de asistencia
    saveToGlobalAttendance(newEntry);
    
    setIsWorking(true);
    
    toast({
      title: "Entrada registrada",
      description: `Has fichado entrada a las ${newEntry.time}`,
    });
  };

  const handleClockOut = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const attendanceKey = `attendance_${user.id}_${today}`;
    
    // Encontrar la entrada sin salida
    const updatedAttendance = todayAttendance.map(entry => {
      if (entry.type === 'clock_in' && !entry.clockOut) {
        const clockOut = now.toISOString();
        const clockIn = new Date(entry.timestamp);
        const hours = (now - clockIn) / (1000 * 60 * 60);
        
        return {
          ...entry,
          clockOut,
          clockOutTime: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          hoursWorked: hours
        };
      }
      return entry;
    });
    
    setTodayAttendance(updatedAttendance);
    localStorage.setItem(attendanceKey, JSON.stringify(updatedAttendance));
    
    // Actualizar registro global
    const lastEntry = updatedAttendance[updatedAttendance.length - 1];
    saveToGlobalAttendance(lastEntry);
    
    setIsWorking(false);
    calculateTotalHours(updatedAttendance);
    
    toast({
      title: "Salida registrada",
      description: `Has fichado salida a las ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
    });
  };

  const saveToGlobalAttendance = (entry) => {
    const globalAttendance = JSON.parse(localStorage.getItem('global_attendance') || '[]');
    
    if (entry.clockOut) {
      // Actualizar entrada existente
      const updatedGlobal = globalAttendance.map(item => 
        item.id === entry.id ? entry : item
      );
      localStorage.setItem('global_attendance', JSON.stringify(updatedGlobal));
    } else {
      // Nueva entrada
      globalAttendance.push(entry);
      localStorage.setItem('global_attendance', JSON.stringify(globalAttendance));
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Control de Presencia
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Registra tu entrada y salida del trabajo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Time */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-blue-700">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role === 'admin' ? 'Administrador' : user.role === 'supervisor' ? 'Jefe de Taller' : 'Técnico'}</p>
              </div>
              <div className="ml-auto">
                <Badge className={isWorking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {isWorking ? 'Trabajando' : 'Fuera'}
                </Badge>
              </div>
            </div>

            {/* Today's Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {totalHours.toFixed(1)}h
                </div>
                <div className="text-sm text-blue-700">Horas Hoy</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {todayAttendance.filter(entry => entry.type === 'clock_in').length}
                </div>
                <div className="text-sm text-green-700">Entradas</div>
              </div>
            </div>

            {/* Clock In/Out Buttons */}
            <div className="space-y-3">
              {!isWorking ? (
                <Button 
                  onClick={handleClockIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Fichar Entrada
                </Button>
              ) : (
                <Button 
                  onClick={handleClockOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Fichar Salida
                </Button>
              )}
            </div>

            {/* Today's Entries */}
            {todayAttendance.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Registros de Hoy</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {todayAttendance.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center">
                        <LogIn className="h-4 w-4 text-green-600 mr-2" />
                        <span>Entrada: {entry.time}</span>
                      </div>
                      {entry.clockOut && (
                        <div className="flex items-center text-red-600">
                          <LogOut className="h-4 w-4 mr-1" />
                          <span>{entry.clockOutTime}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AttendanceClockModal;