import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import WorkOrderForm from '@/components/workorders/WorkOrderForm';

export default function CreateWorkOrder() {
  const navigate = useNavigate();
  const { workOrders, setWorkOrders } = useData();
  const { toast } = useToast();

  const handleSave = (workOrderData) => {
    const newWorkOrders = [...workOrders, workOrderData];
    setWorkOrders(newWorkOrders);
    
    toast({
      title: "Parte creado exitosamente",
      description: `El parte ${workOrderData.id} ha sido creado correctamente.`,
    });
    
    navigate('/partes');
  };

  const handleCancel = () => {
    navigate('/partes');
  };

  return (
    <>
      <Helmet>
        <title>Crear Nuevo Parte - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Crear un nuevo parte de trabajo en el sistema de gestión de CMG HIDRÁULICA S.L." />
      </Helmet>

      <WorkOrderForm
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
}