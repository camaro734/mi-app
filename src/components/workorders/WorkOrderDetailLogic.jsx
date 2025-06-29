import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { generateWorkOrderPDF } from '@/utils/pdfGenerator';

export function useWorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workOrders, setWorkOrders, addTimeEntry, assignTechnician } = useData();
  const { toast } = useToast();
  
  const [isWorking, setIsWorking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '', unit: '' });
  const [startTime, setStartTime] = useState(null);

  // Buscar el parte de trabajo por ID
  const workOrder = workOrders.find(wo => wo.id === id);

  // Cargar estado de trabajo persistido - SIEMPRE se ejecuta
  useEffect(() => {
    if (!workOrder || !user?.id) return;
    
    const workStateKey = `workState_${workOrder.id}_${user.id}`;
    const savedWorkState = localStorage.getItem(workStateKey);
    
    if (savedWorkState) {
      try {
        const { isWorking: savedIsWorking, startTime: savedStartTime } = JSON.parse(savedWorkState);
        setIsWorking(savedIsWorking);
        if (savedStartTime) {
          setStartTime(new Date(savedStartTime));
        }
      } catch (error) {
        console.error('Error al cargar estado de trabajo:', error);
      }
    }
  }, [workOrder?.id, user?.id]);

  // Guardar estado de trabajo
  const saveWorkState = (workingState, startTimeState) => {
    if (!workOrder || !user?.id) return;
    
    const workStateKey = `workState_${workOrder.id}_${user.id}`;
    const workState = {
      isWorking: workingState,
      startTime: startTimeState?.toISOString() || null
    };
    localStorage.setItem(workStateKey, JSON.stringify(workState));
  };

  // Verificar si el usuario está fichado en presencia
  const checkAttendanceStatus = () => {
    if (!user?.id) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const attendanceKey = `attendance_${user.id}_${today}`;
    const savedAttendance = localStorage.getItem(attendanceKey);
    
    if (!savedAttendance) {
      return false;
    }
    
    try {
      const attendance = JSON.parse(savedAttendance);
      const hasActiveEntry = attendance.some(entry => 
        entry.type === 'clock_in' && !entry.clockOut
      );
      return hasActiveEntry;
    } catch (error) {
      console.error('Error al verificar presencia:', error);
      return false;
    }
  };

  // Verificar si el usuario está fichado en este parte específico
  const checkUserWorkedOnOrder = () => {
    if (!workOrder || !user?.name) return false;
    
    const assignedTechnicians = workOrder.assignedTechnicians || [];
    return assignedTechnicians.includes(user.name);
  };

  // Liberar a otros usuarios del parte cuando uno lo cierra
  const releaseOtherUsers = () => {
    if (!workOrder || !user?.id) return;
    
    const assignedTechnicians = workOrder.assignedTechnicians || [];
    
    // Limpiar estados de trabajo de otros usuarios
    assignedTechnicians.forEach(techName => {
      // Buscar el ID del usuario por nombre (simplificado)
      const techUser = JSON.parse(localStorage.getItem('cmg_users') || '[]')
        .find(u => u.name === techName);
      
      if (techUser && techUser.id !== user.id) {
        const workStateKey = `workState_${workOrder.id}_${techUser.id}`;
        localStorage.removeItem(workStateKey);
      }
    });
  };

  const updateWorkOrder = (updates) => {
    if (!workOrder) return;
    
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === workOrder.id ? { ...wo, ...updates } : wo
    );
    setWorkOrders(updatedWorkOrders);
  };

  const handleStartWork = () => {
    if (!workOrder || !user) return;
    
    if (!checkAttendanceStatus()) {
      toast({
        title: "Error - No fichado en presencia",
        description: "Debes fichar tu presencia en la empresa antes de poder trabajar en un parte. Ve al Dashboard y usa el botón 'Fichar Presencia'.",
        variant: "destructive"
      });
      return;
    }

    const currentUserAssigned = workOrder.assignedTechnicians?.includes(user.name);
    
    if (!currentUserAssigned) {
      assignTechnician(workOrder.id, user.name);
      
      toast({
        title: "Fichado en el trabajo",
        description: "Te has fichado correctamente en este parte de trabajo.",
      });
    }
    
    const newStartTime = new Date();
    setIsWorking(true);
    setStartTime(newStartTime);
    saveWorkState(true, newStartTime);
    
    toast({
      title: "Trabajo iniciado",
      description: "Se ha registrado el inicio del trabajo efectivo en este parte.",
    });
  };

  const handleStopWork = () => {
    if (!workOrder || !user || !startTime) return;
    
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
    saveWorkState(false, null);
    
    toast({
      title: "Trabajo pausado",
      description: `Se han registrado ${hours} horas de trabajo efectivo en este parte.`,
    });
  };

  const handleCompleteWork = () => {
    if (!workOrder || !user) return;
    
    // Verificar que el usuario esté fichado en este parte
    if (!checkUserWorkedOnOrder()) {
      toast({
        title: "Error - No autorizado",
        description: "Solo los usuarios que han trabajado en este parte pueden cerrarlo.",
        variant: "destructive"
      });
      return;
    }
    
    setShowCompletionModal(true);
  };

  const handleSaveCompletion = (completionData) => {
    if (!workOrder || !user) return;
    
    // Liberar a otros usuarios del parte
    releaseOtherUsers();
    
    const updates = {
      status: 'Pendiente de Validación',
      workDescription: completionData.workDescription,
      completedAt: completionData.completedAt,
      completedBy: user.name,
      history: [
        ...(workOrder.history || []),
        {
          date: new Date().toLocaleString(),
          action: `Parte completado por ${user.name} - Otros técnicos liberados - Pendiente de validación`,
          user: user.name
        }
      ]
    };
    
    updateWorkOrder(updates);
    setShowCompletionModal(false);
    
    toast({
      title: "Parte completado",
      description: "El parte ha sido cerrado y otros técnicos han sido liberados. Enviado para validación.",
    });
  };

  const handleValidateWork = () => {
    setShowValidationModal(true);
  };

  const handleSaveValidation = (validationData) => {
    if (!workOrder || !user) return;
    
    const updates = {
      status: 'Validado',
      validatedHours: validationData.validatedHours,
      validatedMaterials: validationData.validatedMaterials,
      validationNotes: validationData.validationNotes,
      validatedAt: validationData.validatedAt,
      validatedBy: user.name,
      history: [
        ...(workOrder.history || []),
        {
          date: new Date().toLocaleString(),
          action: `Parte validado por ${user.name} - Listo para firma del cliente`,
          user: user.name
        }
      ]
    };
    
    updateWorkOrder(updates);
    setShowValidationModal(false);
    
    toast({
      title: "Parte validado",
      description: "El parte ha sido validado y está listo para la firma del cliente.",
    });
  };

  const handleSignature = () => {
    setShowSignatureModal(true);
  };

  const handleSaveSignature = (signatureInfo) => {
    if (!workOrder || !user) return;
    
    const updates = {
      clientSignature: signatureInfo,
      history: [
        ...(workOrder.history || []),
        {
          date: new Date().toLocaleString(),
          action: `Parte firmado por ${signatureInfo.clientName}`,
          user: user.name
        }
      ]
    };
    
    updateWorkOrder(updates);
    setShowSignatureModal(false);
    
    toast({
      title: "Firma guardada",
      description: "La firma del cliente ha sido guardada correctamente. Ahora puedes exportar el parte en PDF.",
    });
  };

  const handleExportPDF = async () => {
    if (!workOrder) return;
    
    try {
      await generateWorkOrderPDF(workOrder);
      toast({
        title: "PDF generado",
        description: "El parte de trabajo se ha exportado correctamente en formato PDF.",
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "Ha ocurrido un error al exportar el parte. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleAddMaterial = (materialToAdd = newMaterial) => {
    if (!workOrder || !user) return;
    
    if (materialToAdd.name && materialToAdd.quantity) {
      const updates = {
        materials: [
          ...(workOrder.materials || []),
          {
            id: Date.now(),
            name: materialToAdd.name,
            quantity: materialToAdd.quantity,
            unit: materialToAdd.unit || 'ud',
            used: false,
            ...(materialToAdd.originalMaterialId && { originalMaterialId: materialToAdd.originalMaterialId }),
            ...(materialToAdd.category && { category: materialToAdd.category })
          }
        ],
        history: [
          ...(workOrder.history || []),
          {
            date: new Date().toLocaleString(),
            action: `Material añadido: ${materialToAdd.name} (${materialToAdd.quantity} ${materialToAdd.unit || 'ud'})`,
            user: user.name
          }
        ]
      };
      
      updateWorkOrder(updates);
      
      toast({
        title: "Material añadido",
        description: `${materialToAdd.name} añadido correctamente.`,
      });
      
      if (materialToAdd === newMaterial) {
        setNewMaterial({ name: '', quantity: '', unit: '' });
      }
    }
  };

  const handleAddPhoto = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedWorkOrder) => {
    if (!workOrder) return;
    
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
    );
    setWorkOrders(updatedWorkOrders);
    setIsEditing(false);
    
    toast({
      title: "Parte actualizado",
      description: "Los cambios han sido guardados correctamente.",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!workOrder) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este parte de trabajo? Esta acción no se puede deshacer.')) {
      const updatedWorkOrders = workOrders.filter(wo => wo.id !== workOrder.id);
      setWorkOrders(updatedWorkOrders);
      toast({
        title: "Parte eliminado",
        description: "El parte de trabajo ha sido eliminado correctamente.",
      });
      navigate('/partes');
    }
  };

  // Si no se encuentra el parte, devolver estado de error
  if (!workOrder) {
    return {
      workOrder: null,
      error: 'Parte de trabajo no encontrado',
      navigate,
      isWorking: false,
      isEditing: false,
      showCompletionModal: false,
      showValidationModal: false,
      showSignatureModal: false,
      newMaterial: { name: '', quantity: '', unit: '' },
      startTime: null,
      user,
      setShowCompletionModal: () => {},
      setShowValidationModal: () => {},
      setShowSignatureModal: () => {},
      setNewMaterial: () => {},
      handleStartWork: () => {},
      handleStopWork: () => {},
      handleCompleteWork: () => {},
      handleSaveCompletion: () => {},
      handleValidateWork: () => {},
      handleSaveValidation: () => {},
      handleSignature: () => {},
      handleSaveSignature: () => {},
      handleExportPDF: () => {},
      handleAddMaterial: () => {},
      handleAddPhoto: () => {},
      handleEdit: () => {},
      handleSaveEdit: () => {},
      handleCancelEdit: () => {},
      handleDelete: () => {},
      checkUserWorkedOnOrder: () => false
    };
  }

  return {
    workOrder,
    isWorking,
    isEditing,
    showCompletionModal,
    showValidationModal,
    showSignatureModal,
    newMaterial,
    startTime,
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
  };
}