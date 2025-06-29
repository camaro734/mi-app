import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Building, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ClientEditModal = ({ client, onSave, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    contact: client?.contact || '',
    phone: client?.phone || '',
    email: client?.email || '',
    location: client?.location || '',
    notes: client?.notes || '',
    status: client?.status || 'Activo'
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del cliente es obligatorio';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'El contacto es obligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updatedClient = {
      ...client,
      ...formData,
      id: client?.id || Date.now(),
      totalJobs: client?.totalJobs || 0,
      lastJob: client?.lastJob || new Date().toISOString().split('T')[0]
    };

    onSave(updatedClient);
    
    toast({
      title: "Cliente actualizado",
      description: "Los datos del cliente han sido guardados correctamente.",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-red-100 text-red-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                <div>
                  <CardTitle>
                    {client ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </CardTitle>
                  <CardDescription>
                    {client ? 'Modifica los datos del cliente' : 'Completa la información del nuevo cliente'}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Información Básica
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Nombre de la Empresa *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ej: Construcciones García S.L."
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Persona de Contacto *
                    </label>
                    <Input
                      value={formData.contact}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                      placeholder="Ej: Juan García Martínez"
                      className={errors.contact ? 'border-red-500' : ''}
                    />
                    {errors.contact && (
                      <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Estado del Cliente
                    </label>
                    <div className="flex gap-2">
                      {['Activo', 'Inactivo', 'Pendiente'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleInputChange('status', status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            formData.status === status
                              ? getStatusColor(status)
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Información de Contacto
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Teléfono *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+34 963 123 456"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contacto@empresa.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Dirección/Ubicación
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Polígono Industrial Norte, Valencia"
                  />
                </div>
              </div>

              {/* Notas Adicionales */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Información Adicional
                </h3>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Notas y Observaciones
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Información adicional sobre el cliente, condiciones especiales, etc."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Información del Cliente Existente */}
              {client && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Información Actual</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Trabajos realizados:</span>
                      <p className="text-blue-600">{client.totalJobs}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Último trabajo:</span>
                      <p className="text-blue-600">{client.lastJob}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  {client ? 'Actualizar Cliente' : 'Crear Cliente'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ClientEditModal;