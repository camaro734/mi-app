import React from 'react';
import { Play, Pause, CheckCircle, FileSignature, Download, FileCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const WorkOrderActions = ({ 
  workOrder, 
  user, 
  isWorking, 
  onStartWork, 
  onStopWork, 
  onCompleteWork,
  onValidateWork,
  onSignature,
  onExportPDF,
  checkUserWorkedOnOrder
}) => {
  const assignedTechnicians = workOrder.assignedTechnicians || [];
  const currentUserAssigned = assignedTechnicians.includes(user?.name);
  const canComplete = checkUserWorkedOnOrder ? checkUserWorkedOnOrder() : currentUserAssigned;
  const canValidate = user?.role === 'admin' || user?.role === 'supervisor';
  
  const isCompleted = workOrder.status === 'Completado';
  const isPendingValidation = workOrder.status === 'Pendiente de Validación';
  const isValidated = workOrder.status === 'Validado';
  const canWorkOnOrder = workOrder.status === 'Pendiente' || workOrder.status === 'En curso';

  // Verificar si está fichado en presencia
  const checkAttendanceStatus = () => {
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
      return false;
    }
  };

  const isAttendanceActive = checkAttendanceStatus();

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t">
      {/* Attendance Warning */}
      {!isAttendanceActive && canWorkOnOrder && (
        <div className="w-full mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Debes fichar tu presencia en la empresa antes de poder trabajar en un parte. 
              Ve al Dashboard y usa el botón "Fichar Presencia".
            </span>
          </div>
        </div>
      )}

      {/* Start/Stop Work for All Users */}
      {canWorkOnOrder && (
        <>
          {!isWorking ? (
            <Button 
              onClick={onStartWork} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!isAttendanceActive}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Trabajo
            </Button>
          ) : (
            <Button onClick={onStopWork} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pausar Trabajo
            </Button>
          )}
        </>
      )}

      {/* Complete Work */}
      {canComplete && canWorkOnOrder && (
        <Button onClick={onCompleteWork} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Completar Parte
        </Button>
      )}

      {/* Validate Work (for supervisors and admin on pending validation) */}
      {canValidate && isPendingValidation && (
        <Button onClick={onValidateWork} className="bg-purple-600 hover:bg-purple-700">
          <FileCheck className="h-4 w-4 mr-2" />
          Validar Parte
        </Button>
      )}

      {/* Client Signature (only for validated work orders) */}
      {isValidated && !workOrder.clientSignature && canValidate && (
        <Button onClick={onSignature} className="bg-purple-600 hover:bg-purple-700">
          <FileSignature className="h-4 w-4 mr-2" />
          Firma del Cliente
        </Button>
      )}

      {/* Export PDF (only for validated and signed work orders) */}
      {isValidated && workOrder.clientSignature && (
        <Button onClick={onExportPDF} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      )}
    </div>
  );
};

export default WorkOrderActions;