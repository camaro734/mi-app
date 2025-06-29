import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkOrderDetail } from './WorkOrderDetailLogic';
import WorkOrderHeader from '@/components/workorders/WorkOrderHeader';
import WorkOrderInfo from '@/components/workorders/WorkOrderInfo';
import MaterialsTab from '@/components/workorders/MaterialsTab';
import PhotosTab from '@/components/workorders/PhotosTab';
import TimeEntriesTab from '@/components/workorders/TimeEntriesTab';
import HistoryTab from '@/components/workorders/HistoryTab';
import WorkOrderForm from '@/components/workorders/WorkOrderForm';
import WorkCompletionModal from '@/components/workorders/WorkCompletionModal';
import ValidationModal from '@/components/workorders/ValidationModal';
import ClientSignatureModal from '@/components/workorders/ClientSignatureModal';

export default function WorkOrderDetailContainer() {
  const {
    workOrder,
    isWorking,
    isEditing,
    showCompletionModal,
    showValidationModal,
    showSignatureModal,
    newMaterial,
    user,
    navigate,
    setShowCompletionModal,
    setShowValidationModal,
    setShowSignatureModal,
    setNewMaterial,
    handleStartWork,
    handleStopWork,
    handleCompleteWork,
    handleSaveCompletion,
    handleValidateWork,
    handleSaveValidation,
    handleSignature,
    handleSaveSignature,
    handleExportPDF,
    handleAddMaterial,
    handleAddPhoto,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    checkUserWorkedOnOrder
  } = useWorkOrderDetail();

  const getStatusColor = (status) => {
    switch (status) {
      case 'En curso': return 'bg-blue-100 text-blue-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Pendiente de Validación': return 'bg-orange-100 text-orange-800';
      case 'Validado': return 'bg-purple-100 text-purple-800';
      case 'Urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return 'bg-red-500 text-white';
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (worked, estimated) => {
    return Math.min((worked / estimated) * 100, 100);
  };

  // Permisos diferenciados
  const canEditBasicInfo = user?.role === 'admin' || user?.role === 'supervisor';
  const canEditMaterialsAndPhotos = true; // Todos los usuarios pueden añadir materiales y fotos

  if (isEditing) {
    return (
      <>
        <Helmet>
          <title>Editar {workOrder.id} - CMG HIDRÁULICA S.L.</title>
          <meta name="description" content={`Editar parte de trabajo ${workOrder.id} para ${workOrder.client}`} />
        </Helmet>
        
        <WorkOrderForm
          initialData={workOrder}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          restrictedMode={!canEditBasicInfo}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{workOrder.id} - Detalle del Parte - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content={`Detalle del parte de trabajo ${workOrder.id} para ${workOrder.client}`} />
      </Helmet>

      <div className="space-y-6">
        <WorkOrderHeader
          workOrder={workOrder}
          onBack={() => navigate('/partes')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={canEditBasicInfo}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
        />

        <WorkOrderInfo
          workOrder={workOrder}
          isWorking={isWorking}
          onStartWork={handleStartWork}
          onStopWork={handleStopWork}
          onCompleteWork={handleCompleteWork}
          onValidateWork={handleValidateWork}
          onSignature={handleSignature}
          onExportPDF={handleExportPDF}
          user={user}
          getProgressPercentage={getProgressPercentage}
          checkUserWorkedOnOrder={checkUserWorkedOnOrder}
        />

        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="time">Fichajes</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <MaterialsTab
              workOrder={workOrder}
              newMaterial={newMaterial}
              setNewMaterial={setNewMaterial}
              onAddMaterial={handleAddMaterial}
              canEdit={canEditMaterialsAndPhotos}
            />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosTab
              workOrder={workOrder}
              onAddPhoto={handleAddPhoto}
              canEdit={canEditMaterialsAndPhotos}
            />
          </TabsContent>

          <TabsContent value="time">
            <TimeEntriesTab workOrder={workOrder} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab workOrder={workOrder} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showCompletionModal && (
        <WorkCompletionModal
          workOrder={workOrder}
          onSave={handleSaveCompletion}
          onClose={() => setShowCompletionModal(false)}
        />
      )}

      {showValidationModal && (
        <ValidationModal
          workOrder={workOrder}
          onValidate={handleSaveValidation}
          onClose={() => setShowValidationModal(false)}
        />
      )}

      {showSignatureModal && (
        <ClientSignatureModal
          workOrder={workOrder}
          onSave={handleSaveSignature}
          onClose={() => setShowSignatureModal(false)}
        />
      )}
    </>
  );
}