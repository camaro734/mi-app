
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ClientSelector from '@/components/workorders/ClientSelector';
import ClientEditModal from '@/components/workorders/ClientEditModal';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import ClientInfoSection from './form/ClientInfoSection';
import MachineInfoSection from './form/MachineInfoSection';
import JobDetailsSection from './form/JobDetailsSection';
import PlanningSection from './form/PlanningSection';
import AttachmentsSection from './form/AttachmentsSection';
import FormActions from './form/FormActions';

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
    attachments: initialData?.attachments || initialData?.photos || [],
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  const [selectedClientFromDB, setSelectedClientFromDB] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

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
        history: initialData?.history || [{ date: new Date().toLocaleString(), action: 'Parte creado', user: 'Sistema' }]
      };
      delete workOrderData.photos;
      onSave(workOrderData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleAttachmentsChange = (newAttachments) => {
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
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
    toast({ title: "Cliente seleccionado", description: `${client.name} ha sido seleccionado.` });
  };

  const handleClearClient = () => {
    setSelectedClientFromDB(null);
    setFormData(prev => ({ ...prev, client: '', clientContact: '', clientPhone: '', clientEmail: '', location: '' }));
    toast({ title: "Cliente limpiado", description: "Ahora puedes introducir los datos manualmente." });
  };

  const handleEditClient = () => {
    const clientToEdit = selectedClientFromDB || {
      name: formData.client,
      contact: formData.clientContact,
      phone: formData.clientPhone,
      email: formData.clientEmail,
      location: formData.location,
      status: 'Activo',
      notes: ''
    };
    setEditingClient(clientToEdit);
    setShowClientEditModal(true);
  };

  const handleSaveClient = (clientData) => {
    let updatedClient = clientData;
    if (selectedClientFromDB) {
      const updatedClients = clients.map(c => c.id === selectedClientFromDB.id ? clientData : c);
      setClients(updatedClients);
    } else {
      updatedClient = { ...clientData, id: Date.now(), totalJobs: 0, lastJob: new Date().toISOString().split('T')[0] };
      setClients(prev => [...prev, updatedClient]);
    }
    setSelectedClientFromDB(updatedClient);
    setFormData(prev => ({ ...prev, ...updatedClient }));
    setShowClientEditModal(false);
    setEditingClient(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            {initialData ? 'Editar Parte de Trabajo' : 'Nuevo Parte de Trabajo'}
          </CardTitle>
          <CardDescription>
            {initialData ? 'Modifica los datos del parte' : 'Completa los campos para crear un nuevo parte.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <ClientInfoSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              selectedClientFromDB={selectedClientFromDB}
              setShowClientSelector={setShowClientSelector}
              handleClearClient={handleClearClient}
              handleEditClient={handleEditClient}
            />
            <MachineInfoSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />
            <JobDetailsSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />
            <AttachmentsSection
              attachments={formData.attachments}
              onAttachmentsChange={handleAttachmentsChange}
            />
            <PlanningSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />
            <FormActions onCancel={onCancel} initialData={initialData} />
          </form>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {showClientSelector && (
          <ClientSelector onSelect={handleSelectClient} onClose={() => setShowClientSelector(false)} selectedClient={selectedClientFromDB} />
        )}
        {showClientEditModal && (
          <ClientEditModal client={editingClient} onSave={handleSaveClient} onClose={() => setShowClientEditModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkOrderForm;
