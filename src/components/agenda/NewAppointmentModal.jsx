import React, { useState } from 'react';
import { X, Calendar, Clock, User, MapPin, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const NewAppointmentModal = ({ onClose, onSave, selectedDate }) => {
  const { toast } = useToast();
  const { personnel, clients } = useData();
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 120,
    technician: '',
    location: '',
    type: 'Mantenimiento',
    priority: 'Media',
    machine: '',
    description: '',
    clientContact: '',
    clientPhone: ''
  });

  const appointmentTypes = [
    'Mantenimiento',
    'Reparación',
    'Inspección',
    'Presupuesto',
    'Instalación',
    'Consultoría'
  ];

  const priorities = ['Baja', 'Media', 'Alta', 'Crítica'];

  const technicians = personnel.filter(p => p.role === 'technician' || p.role === 'supervisor');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.client || !formData.date || !formData.time || !formData.technician) {
      toast({
        title: "Campos obligatorios",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    const newAppointment = {
      id: Date.now(),
      ...formData,
      status: 'Confirmada',
      createdAt: new Date().toISOString(),
      createdBy: 'Usuario Actual'
    };

    onSave(newAppointment);
    
    toast({
      title: "Cita creada",
      description: `La cita con ${formData.client} ha sido programada correctamente.`,
    });
    
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Nueva Cita
              </CardTitle>
              <CardDescription>
                Programa una nueva cita con el cliente
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Título de la Cita *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Mantenimiento Excavadora"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Cliente *
                </label>
                <Input
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Fecha *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Hora *
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Duración (minutos)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1.5 horas</option>
                  <option value={120}>2 horas</option>
                  <option value={180}>3 horas</option>
                  <option value={240}>4 horas</option>
                  <option value={480}>8 horas</option>
                </select>
              </div>
            </div>

            {/* Técnico y Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Técnico Asignado *
                </label>
                <select
                  value={formData.technician}
                  onChange={(e) => handleInputChange('technician', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar técnico</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.name}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tipo de Servicio
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {appointmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ubicación y Máquina */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Ubicación
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Dirección o ubicación del servicio"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Máquina/Equipo
                </label>
                <Input
                  value={formData.machine}
                  onChange={(e) => handleInputChange('machine', e.target.value)}
                  placeholder="Ej: Excavadora CAT 320D"
                />
              </div>
            </div>

            {/* Contacto del Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Contacto del Cliente
                </label>
                <Input
                  value={formData.clientContact}
                  onChange={(e) => handleInputChange('clientContact', e.target.value)}
                  placeholder="Nombre del contacto"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Teléfono
                </label>
                <Input
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="Teléfono de contacto"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Descripción del Servicio
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el trabajo a realizar..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                Crear Cita
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAppointmentModal;