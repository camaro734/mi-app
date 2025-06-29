import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, FileText, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const WorkCompletionModal = ({ workOrder, onSave, onClose }) => {
  const [workDescription, setWorkDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!workDescription.trim()) {
      newErrors.workDescription = 'La descripción de los trabajos realizados es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const completionData = {
        workDescription: workDescription.trim(),
        completedAt: new Date().toISOString(),
        completedBy: 'current_user' // Se reemplazará con el usuario actual
      };
      
      onSave(completionData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <div>
                  <CardTitle>Completar Parte de Trabajo</CardTitle>
                  <CardDescription>Parte: {workOrder.id} - {workOrder.client}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Work Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Resumen del Trabajo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Máquina:</span> {workOrder.machine}
                </div>
                <div>
                  <span className="font-medium">Marca/Modelo:</span> {workOrder.brand} {workOrder.model}
                </div>
                <div>
                  <span className="font-medium">Matrícula:</span> {workOrder.plate}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {workOrder.type}
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium">Problema inicial:</span>
                <p className="text-gray-600 mt-1 text-sm">{workOrder.description}</p>
              </div>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">{workOrder.workedHours}h</div>
                <div className="text-xs text-blue-700">Horas Trabajadas</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <Package className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">
                  {workOrder.materials?.length || 0}
                </div>
                <div className="text-xs text-green-700">Materiales Utilizados</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <FileText className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-600">
                  {workOrder.assignedTechnicians?.length || 0}
                </div>
                <div className="text-xs text-purple-700">Técnicos Asignados</div>
              </div>
            </div>

            {/* Work Description */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Descripción de los Trabajos Realizados *
                </label>
                <textarea
                  value={workDescription}
                  onChange={(e) => {
                    setWorkDescription(e.target.value);
                    if (errors.workDescription) {
                      setErrors(prev => ({ ...prev, workDescription: '' }));
                    }
                  }}
                  placeholder="Describe detalladamente todos los trabajos realizados, reparaciones efectuadas, piezas cambiadas, ajustes realizados, etc..."
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.workDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.workDescription && (
                  <p className="text-red-500 text-xs mt-1">{errors.workDescription}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Esta información será revisada por el jefe de taller antes de la validación final.
                </p>
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Proceso de Validación</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• El parte pasará a estado "Pendiente de Validación"</p>
                <p>• El jefe de taller revisará y podrá modificar horas y materiales</p>
                <p>• Una vez validado, el cliente podrá firmar el parte</p>
                <p>• Solo se imprimirán las horas y materiales validados finalmente</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Completar y Enviar a Validación
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default WorkCompletionModal;