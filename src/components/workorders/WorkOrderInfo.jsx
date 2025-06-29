import React from 'react';
import { AlertTriangle, Users, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WorkOrderActions from './WorkOrderActions';

const WorkOrderInfo = ({ 
  workOrder, 
  isWorking, 
  onStartWork, 
  onStopWork, 
  onCompleteWork,
  onValidateWork,
  onSignature,
  onExportPDF,
  user, 
  getProgressPercentage,
  checkUserWorkedOnOrder
}) => {
  const assignedTechnicians = workOrder.assignedTechnicians || [];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pendiente de Validación':
        return { color: 'bg-orange-100 text-orange-800', icon: Clock };
      case 'Validado':
        return { color: 'bg-purple-100 text-purple-800', icon: CheckCircle };
      default:
        return { color: 'bg-blue-100 text-blue-800', icon: null };
    }
  };

  const statusInfo = getStatusInfo(workOrder.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{workOrder.machine}</CardTitle>
            <CardDescription>
              {workOrder.brand} {workOrder.model} • {workOrder.plate}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            {workOrder.clientSignature && (
              <Badge className="bg-green-100 text-green-800">
                Firmado por Cliente
              </Badge>
            )}
            {workOrder.status === 'Validado' && (
              <Badge className="bg-purple-100 text-purple-800">
                Validado para Facturación
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Número de Serie</p>
            <p className="text-sm text-gray-900">{workOrder.serial}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tipo de Trabajo</p>
            <p className="text-sm text-gray-900">{workOrder.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Contacto Cliente</p>
            <p className="text-sm text-gray-900">{workOrder.clientContact}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ubicación</p>
            <p className="text-sm text-gray-900">{workOrder.location}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha Límite</p>
            <p className="text-sm text-gray-900">{workOrder.dueDate}</p>
          </div>
        </div>

        {/* Assigned Technicians */}
        <div>
          <div className="flex items-center mb-3">
            <Users className="h-4 w-4 text-gray-500 mr-2" />
            <p className="text-sm font-medium text-gray-500">Técnicos Asignados</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignedTechnicians.length > 0 ? (
              assignedTechnicians.map((tech, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                  {tech}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                Ningún técnico fichado aún. Cualquier técnico puede ficharse usando "Iniciar Trabajo".
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Descripción del Problema</p>
          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
            {workOrder.description}
          </p>
        </div>

        {/* Work Description (if completed) */}
        {workOrder.workDescription && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Trabajos Realizados</p>
            <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg border border-green-200">
              {workOrder.workDescription}
            </p>
          </div>
        )}

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progreso del Trabajo</span>
            <span className="text-sm text-gray-600">
              {workOrder.workedHours}h / {workOrder.estimatedHours}h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                getProgressPercentage(workOrder.workedHours, workOrder.estimatedHours) > 100
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(getProgressPercentage(workOrder.workedHours, workOrder.estimatedHours), 100)}%`
              }}
            />
          </div>
          {getProgressPercentage(workOrder.workedHours, workOrder.estimatedHours) > 100 && (
            <div className="flex items-center mt-2 text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm">Tiempo estimado superado</span>
            </div>
          )}
        </div>

        {/* Validation Information */}
        {workOrder.validatedHours !== undefined && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Información de Validación</h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p><span className="font-medium">Horas validadas:</span> {workOrder.validatedHours}h</p>
              <p><span className="font-medium">Materiales validados:</span> {workOrder.validatedMaterials?.length || 0}</p>
              {workOrder.validationNotes && (
                <p><span className="font-medium">Notas:</span> {workOrder.validationNotes}</p>
              )}
              {workOrder.validatedAt && (
                <p className="text-xs">
                  Validado el {new Date(workOrder.validatedAt).toLocaleString('es-ES')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Client Signature Info */}
        {workOrder.clientSignature && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Conformidad del Cliente</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><span className="font-medium">Firmado por:</span> {workOrder.clientSignature.clientName}</p>
              {workOrder.clientSignature.clientPosition && (
                <p><span className="font-medium">Cargo:</span> {workOrder.clientSignature.clientPosition}</p>
              )}
              <p><span className="font-medium">Fecha:</span> {workOrder.clientSignature.signedDate}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <WorkOrderActions
          workOrder={workOrder}
          user={user}
          isWorking={isWorking}
          onStartWork={onStartWork}
          onStopWork={onStopWork}
          onCompleteWork={onCompleteWork}
          onValidateWork={onValidateWork}
          onSignature={onSignature}
          onExportPDF={onExportPDF}
          checkUserWorkedOnOrder={checkUserWorkedOnOrder}
        />
      </CardContent>
    </Card>
  );
};

export default WorkOrderInfo;