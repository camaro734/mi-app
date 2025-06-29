import React from 'react';
import { motion } from 'framer-motion';
import { X, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkOrderValidation } from './WorkOrderValidationLogic';

const ValidationModal = ({ workOrder, onValidate, onClose }) => {
  const {
    validatedHours,
    setValidatedHours,
    validatedMaterials,
    newMaterial,
    setNewMaterial,
    validationNotes,
    setValidationNotes,
    handleAddMaterial,
    handleRemoveMaterial,
    handleMaterialQuantityChange,
    getValidationData
  } = useWorkOrderValidation(workOrder);

  const handleValidate = () => {
    const validationData = getValidationData();
    onValidate(validationData);
  };

  const totalOriginalHours = workOrder.workedHours || 0;
  const totalValidatedMaterials = validatedMaterials.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <div>
                  <CardTitle>Validación de Parte de Trabajo</CardTitle>
                  <CardDescription>
                    Revisar y ajustar horas y materiales para facturación
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Work Order Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Información del Parte</h4>
                  <p className="text-sm"><span className="font-medium">ID:</span> {workOrder.id}</p>
                  <p className="text-sm"><span className="font-medium">Cliente:</span> {workOrder.client}</p>
                  <p className="text-sm"><span className="font-medium">Máquina:</span> {workOrder.machine}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Trabajos Realizados</h4>
                  <div className="bg-white p-3 rounded border text-sm max-h-24 overflow-y-auto">
                    {workOrder.workDescription || 'Sin descripción disponible'}
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Validation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Validación de Horas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Horas Trabajadas</h4>
                  <div className="text-2xl font-bold text-blue-600">{totalOriginalHours}h</div>
                  <p className="text-xs text-blue-700">Registradas por técnicos</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Horas a Facturar</h4>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={validatedHours}
                    onChange={(e) => setValidatedHours(e.target.value)}
                    className="text-lg font-bold text-center"
                  />
                  <p className="text-xs text-green-700 mt-1">Horas validadas</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Diferencia</h4>
                  <div className={`text-2xl font-bold ${
                    (validatedHours - totalOriginalHours) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validatedHours - totalOriginalHours >= 0 ? '+' : ''}{(validatedHours - totalOriginalHours).toFixed(1)}h
                  </div>
                  <p className="text-xs text-yellow-700">Ajuste aplicado</p>
                </div>
              </div>
            </div>

            {/* Materials Validation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Validación de Materiales</h3>
              
              {/* Add New Material */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Añadir Material Adicional</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Nombre del material"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  />
                  <Input
                    placeholder="Cantidad"
                    type="number"
                    min="0"
                    step="0.1"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
                  />
                  <select
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ud">Unidades</option>
                    <option value="L">Litros</option>
                    <option value="kg">Kilogramos</option>
                    <option value="m">Metros</option>
                    <option value="m²">Metros²</option>
                  </select>
                  <Button onClick={handleAddMaterial}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir
                  </Button>
                </div>
              </div>

              {/* Materials List */}
              <div className="space-y-2">
                <h4 className="font-medium">Materiales a Facturar ({totalValidatedMaterials})</h4>
                {validatedMaterials.length > 0 ? (
                  validatedMaterials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{material.name}</p>
                          {material.addedInValidation && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Añadido
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{material.unit}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={material.quantity}
                          onChange={(e) => handleMaterialQuantityChange(material.id, e.target.value)}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay materiales para facturar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Notas de Validación</h3>
              <textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder="Añade notas sobre los ajustes realizados (opcional)..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Resumen de Validación</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p>• <span className="font-medium">Horas a facturar:</span> {validatedHours}h</p>
                  <p>• <span className="font-medium">Materiales validados:</span> {totalValidatedMaterials}</p>
                </div>
                <div>
                  <p>• El parte pasará a estado "Validado"</p>
                  <p>• El cliente podrá firmar el documento</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleValidate}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Validar Parte
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ValidationModal;