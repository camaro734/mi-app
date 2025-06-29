import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Calendar, Wrench, Search, Building, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ClientSelector from '@/components/workorders/ClientSelector';
import ClientEditModal from '@/components/workorders/ClientEditModal';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const WorkOrderForm = ({ onSave, onCancel, initialData = null }) => {
  const { clients, setClients } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client: initialData?.client || '',
    clientContact: initialData?.clientContact || '',
    clientPhone: initialData?.clientPhone || '',
    clientEmail: initialData?.clientEmail || '',
    location: initialData?.location || '',
    machine: initialData?.machine || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    plate: initialData?.plate || '',
    serial: initialData?.serial || '',
    type: initialData?.type || 'Reparación',
    priority: initialData?.priority || 'Media',
    description: initialData?.description || '',
    estimatedHours: initialData?.estimatedHours || '',
    dueDate: initialData?.dueDate || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  const [selectedClientFromDB, setSelectedClientFromDB] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const workTypes = [
    'Reparación',
    'Mantenimiento',
    'Inspección',
    'Instalación',
    'Diagnóstico',
    'Revisión'
  ];

  const priorities = [
    { value: 'Baja', color: 'bg-green-100 text-green-800' },
    { value: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Alta', color: 'bg-red-100 text-red-800' },
    { value: 'Crítica', color: 'bg-red-500 text-white' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.client.trim()) newErrors.client = 'El cliente es obligatorio';
    if (!formData.machine.trim()) newErrors.machine = 'La máquina es obligatoria';
    if (!formData.brand.trim()) newErrors.brand = 'La marca es obligatoria';
    if (!formData.model.trim()) newErrors.model = 'El modelo es obligatorio';
    if (!formData.plate.trim()) newErrors.plate = 'La matrícula es obligatoria';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.estimatedHours || formData.estimatedHours <= 0) {
      newErrors.estimatedHours = 'Las horas estimadas deben ser mayor a 0';
    }
    if (!formData.dueDate) newErrors.dueDate = 'La fecha límite es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const workOrderData = {
        ...formData,
        id: initialData?.id || `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        status: initialData?.status || 'Pendiente',
        workedHours: initialData?.workedHours || 0,
        createdDate: initialData?.createdDate || new Date().toISOString().split('T')[0],
        assignedTechnicians: initialData?.assignedTechnicians || [],
        materials: initialData?.materials || [],
        timeEntries: initialData?.timeEntries || [],
        photos: initialData?.photos || [],
        history: initialData?.history || [
          {
            date: new Date().toLocaleString(),
            action: 'Parte creado',
            user: 'Sistema'
          }
        ]
      };
      onSave(workOrderData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClientFromDB(client);
    setFormData(prev => ({
      ...prev,
      client: client.name,
      clientContact: client.contact,
      clientPhone: client.phone,
      clientEmail: client.email || '',
      location: client.location || prev.location
    }));
    
    toast({
      title: "Cliente seleccionado",
      description: `${client.name} ha sido seleccionado y los datos se han completado automáticamente.`,
    });
  };

  const handleClearClient = () => {
    setSelectedClientFromDB(null);
    setFormData(prev => ({
      ...prev,
      client: '',
      clientContact: '',
      clientPhone: '',
      clientEmail: '',
      location: ''
    }));
    
    toast({
      title: "Cliente limpiado",
      description: "Ahora puedes introducir los datos manualmente o seleccionar otro cliente.",
    });
  };

  const handleEditClient = () => {
    if (selectedClientFromDB) {
      setEditingClient(selectedClientFromDB);
      setShowClientEditModal(true);
    } else {
      // Crear nuevo cliente con los datos actuales del formulario
      setEditingClient({
        name: formData.client,
        contact: formData.clientContact,
        phone: formData.clientPhone,
        email: formData.clientEmail,
        location: formData.location,
        status: 'Activo',
        notes: ''
      });
      setShowClientEditModal(true);
    }
  };

  const handleSaveClient = (clientData) => {
    if (selectedClientFromDB) {
      // Actualizar cliente existente
      const updatedClients = clients.map(c => 
        c.id === selectedClientFromDB.id ? clientData : c
      );
      setClients(updatedClients);
      setSelectedClientFromDB(clientData);
    } else {
      // Crear nuevo cliente
      const newClient = {
        ...clientData,
        id: Date.now(),
        totalJobs: 0,
        lastJob: new Date().toISOString().split('T')[0]
      };
      setClients(prev => [...prev, newClient]);
      setSelectedClientFromDB(newClient);
    }

    // Actualizar formulario con los datos del cliente
    setFormData(prev => ({
      ...prev,
      client: clientData.name,
      clientContact: clientData.contact,
      clientPhone: clientData.phone,
      clientEmail: clientData.email || '',
      location: clientData.location || prev.location
    }));

    setShowClientEditModal(false);
    setEditingClient(null);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            {initialData ? 'Editar Parte de Trabajo' : 'Nuevo Parte de Trabajo'}
          </CardTitle>
          <CardDescription>
            {initialData ? 'Modifica los datos del parte existente' : 'Completa todos los campos para crear un nuevo parte. Los técnicos se asignarán cuando se fichen en el trabajo.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente y Contacto */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex-1">
                  Información del Cliente
                </h3>
                <div className="flex gap-2 ml-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClientSelector(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar en BD
                  </Button>
                  {selectedClientFromDB && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearClient}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {/* Indicador de cliente seleccionado */}
              {selectedClientFromDB && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Cliente seleccionado desde la base de datos
                      </span>
                      <Badge className={`ml-2 ${getStatusColor(selectedClientFromDB.status)}`}>
                        {selectedClientFromDB.status}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleEditClient}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Cliente
                    </Button>
                  </div>
                  {selectedClientFromDB.notes && (
                    <p className="text-xs text-green-700 mt-2">
                      <strong>Notas:</strong> {selectedClientFromDB.notes}
                    </p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Cliente *
                  </label>
                  <Input
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    placeholder="Nombre del cliente"
                    className={errors.client ? 'border-red-500' : ''}
                    disabled={!!selectedClientFromDB}
                  />
                  {errors.client && (
                    <p className="text-red-500 text-xs mt-1">{errors.client}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Contacto del Cliente
                  </label>
                  <Input
                    value={formData.clientContact}
                    onChange={(e) => handleInputChange('clientContact', e.target.value)}
                    placeholder="Nombre del contacto"
                    disabled={!!selectedClientFromDB}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Teléfono del Cliente
                  </label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    placeholder="+34 666 123 456"
                    disabled={!!selectedClientFromDB}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email del Cliente
                  </label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    placeholder="contacto@cliente.com"
                    disabled={!!selectedClientFromDB}
                  />
                </div>
              </div>

              {/* Botón para editar/crear cliente cuando no hay uno seleccionado */}
              {!selectedClientFromDB && (formData.client || formData.clientContact) && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEditClient}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear/Editar Cliente
                  </Button>
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Ubicación del Trabajo
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Dirección o ubicación donde se realizará el trabajo"
              />
            </div>

            {/* Información de la Máquina */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Información de la Máquina
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Máquina/Equipo *
                  </label>
                  <Input
                    value={formData.machine}
                    onChange={(e) => handleInputChange('machine', e.target.value)}
                    placeholder="Ej: Grúa Hiab 166 E-5"
                    className={errors.machine ? 'border-red-500' : ''}
                  />
                  {errors.machine && (
                    <p className="text-red-500 text-xs mt-1">{errors.machine}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Marca *
                  </label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Ej: Hiab, Dhollandia, Palfinger"
                    className={errors.brand ? 'border-red-500' : ''}
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Modelo *
                  </label>
                  <Input
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Ej: 166 E-5, DH-SM.15, PK 15002"
                    className={errors.model ? 'border-red-500' : ''}
                  />
                  {errors.model && (
                    <p className="text-red-500 text-xs mt-1">{errors.model}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Matrícula *
                  </label>
                  <Input
                    value={formData.plate}
                    onChange={(e) => handleInputChange('plate', e.target.value)}
                    placeholder="Ej: 1234-HBG, 5678-DHL"
                    className={errors.plate ? 'border-red-500' : ''}
                  />
                  {errors.plate && (
                    <p className="text-red-500 text-xs mt-1">{errors.plate}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Número de Serie
                </label>
                <Input
                  value={formData.serial}
                  onChange={(e) => handleInputChange('serial', e.target.value)}
                  placeholder="Número de serie del equipo"
                />
              </div>
            </div>

            {/* Detalles del Trabajo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Detalles del Trabajo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Tipo de Trabajo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {workTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Prioridad
                  </label>
                  <div className="flex gap-2">
                    {priorities.map(priority => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => handleInputChange('priority', priority.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          formData.priority === priority.value
                            ? priority.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {priority.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Descripción del Problema *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe detalladamente el problema o trabajo a realizar..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Planificación */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Planificación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Horas Estimadas *
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value))}
                    placeholder="8"
                    className={errors.estimatedHours ? 'border-red-500' : ''}
                  />
                  {errors.estimatedHours && (
                    <p className="text-red-500 text-xs mt-1">{errors.estimatedHours}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha Límite *
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className={errors.dueDate ? 'border-red-500' : ''}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Asignación de Técnicos</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Los técnicos se asignarán automáticamente cuando se fichen en este parte de trabajo. 
                      Varios técnicos pueden trabajar en el mismo parte.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {initialData ? 'Actualizar Parte' : 'Crear Parte'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Client Selector Modal */}
      <AnimatePresence>
        {showClientSelector && (
          <ClientSelector
            onSelect={handleSelectClient}
            onClose={() => setShowClientSelector(false)}
            selectedClient={selectedClientFromDB}
          />
        )}
      </AnimatePresence>

      {/* Client Edit Modal */}
      <AnimatePresence>
        {showClientEditModal && (
          <ClientEditModal
            client={editingClient}
            onSave={handleSaveClient}
            onClose={() => {
              setShowClientEditModal(false);
              setEditingClient(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkOrderForm;