import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const VacationRequestForm = ({ 
  newRequest, 
  setNewRequest, 
  onSubmit, 
  onCancel, 
  calculateDays 
}) => {
  const handleSubmit = () => {
    // Validar que se hayan seleccionado días
    if (!newRequest.start_date || !newRequest.end_date) {
      alert('Por favor, selecciona las fechas de inicio y fin para tu solicitud de vacaciones.');
      return;
    }

    const days = calculateDays(newRequest.start_date, newRequest.end_date);
    if (days <= 0) {
      alert('Las fechas seleccionadas no son válidas. La fecha de fin debe ser posterior a la de inicio.');
      return;
    }

    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Nueva Solicitud de Vacaciones</CardTitle>
          <CardDescription>
            Completa los detalles de tu solicitud. Debes seleccionar al menos un día.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Fecha de Inicio *</Label>
              <Input
                id="start_date"
                type="date"
                value={newRequest.start_date}
                onChange={(e) => setNewRequest({...newRequest, start_date: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Fecha de Fin *</Label>
              <Input
                id="end_date"
                type="date"
                value={newRequest.end_date}
                onChange={(e) => setNewRequest({...newRequest, end_date: e.target.value})}
                min={newRequest.start_date}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={newRequest.reason}
                onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                placeholder="Ej: Vacaciones familiares, asuntos personales..."
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="comments">Comentarios adicionales</Label>
              <textarea
                id="comments"
                value={newRequest.comments}
                onChange={(e) => setNewRequest({...newRequest, comments: e.target.value})}
                placeholder="Información adicional relevante..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          
          {newRequest.start_date && newRequest.end_date && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                Días solicitados: {calculateDays(newRequest.start_date, newRequest.end_date)}
              </p>
            </div>
          )}
          
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleSubmit}>
              Enviar Solicitud
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VacationRequestForm;