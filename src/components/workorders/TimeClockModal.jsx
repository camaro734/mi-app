import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const TimeClockModal = ({ workOrder, onClose }) => {
  const { user } = useAuth();
  const { addTimeEntry, assignTechnician } = useData();
  const { toast } = useToast();
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const isAssigned = workOrder.assignedTechnicians?.includes(user?.name);

  const handleClockIn = () => {
    if (!isAssigned) {
      // Fichar al técnico en el trabajo
      assignTechnician(workOrder.id, user.name);
      toast({
        title: "Fichado en el trabajo",
        description: "Te has fichado correctamente en este parte de trabajo.",
      });
    }
    
    setIsWorking(true);
    setStartTime(new Date());
    
    toast({
      title: "Trabajo iniciado",
      description: "Se ha registrado el inicio del trabajo.",
    });
  };

  const handleClockOut = () => {
    if (!startTime) return;
    
    const endTime = new Date();
    const hours = Math.round(((endTime - startTime) / (1000 * 60 * 60)) * 100) / 100;
    
    const timeEntry = {
      date: new Date().toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      hours: hours,
      technician: user.name
    };
    
    addTimeEntry(workOrder.id, timeEntry);
    
    setIsWorking(false);
    setStartTime(null);
    
    toast({
      title: "Trabajo pausado",
      description: `Se han registrado ${hours} horas de trabajo.`,
    });
    
    onClose();
  };

  const getElapsedTime = () => {
    if (!startTime) return '00:00:00';
    
    const now = new Date();
    const elapsed = now - startTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <div>
                  <CardTitle>Control de Tiempo</CardTitle>
                  <CardDescription>{workOrder.id}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Work Order Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{workOrder.machine}</h4>
              <p className="text-sm text-gray-600">{workOrder.client}</p>
              <p className="text-xs text-gray-500">{workOrder.brand} {workOrder.model} • {workOrder.plate}</p>
            </div>

            {/* Assignment Status */}
            <div className="text-center">
              {isAssigned ? (
                <Badge className="bg-green-100 text-green-800">
                  Asignado a este trabajo
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  No asignado aún
                </Badge>
              )}
            </div>

            {/* Timer Display */}
            {isWorking && (
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                  {getElapsedTime()}
                </div>
                <p className="text-sm text-gray-600">Tiempo trabajado en esta sesión</p>
              </div>
            )}

            {/* Progress Info */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{workOrder.workedHours}h</div>
                <div className="text-sm text-gray-600">Trabajadas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{workOrder.estimatedHours}h</div>
                <div className="text-sm text-gray-600">Estimadas</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isWorking ? (
                <Button 
                  onClick={handleClockIn} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {isAssigned ? 'Iniciar Trabajo' : 'Ficharme y Empezar'}
                </Button>
              ) : (
                <Button 
                  onClick={handleClockOut} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pausar y Registrar Tiempo
                </Button>
              )}
              
              <Button variant="outline" onClick={onClose} className="w-full">
                Cerrar
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Instrucciones:</strong> Haz clic en "Ficharme y Empezar" para asignarte al trabajo e iniciar el cronómetro. 
                Cuando termines o hagas una pausa, haz clic en "Pausar" para registrar el tiempo trabajado.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TimeClockModal;