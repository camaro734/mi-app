import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ClientSignatureModal = ({ workOrder, onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [clientName, setClientName] = useState(workOrder.clientContact?.split(' - ')[0] || '');
  const [clientPosition, setClientPosition] = useState('');
  const [signatureData, setSignatureData] = useState(null);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    setSignatureData(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSave = () => {
    if (!signatureData || !clientName.trim()) {
      return;
    }

    const signatureInfo = {
      clientName: clientName.trim(),
      clientPosition: clientPosition.trim(),
      signatureData,
      signedAt: new Date().toISOString(),
      signedDate: new Date().toLocaleDateString('es-ES')
    };

    onSave(signatureInfo);
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
                  <CardTitle>Firma del Cliente</CardTitle>
                  <CardDescription>Parte de Trabajo: {workOrder.id}</CardDescription>
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
              <h4 className="font-medium text-sm mb-2">Resumen del Trabajo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span> {workOrder.client}
                </div>
                <div>
                  <span className="font-medium">Máquina:</span> {workOrder.machine}
                </div>
                <div>
                  <span className="font-medium">Matrícula:</span> {workOrder.plate}
                </div>
                <div>
                  <span className="font-medium">Horas trabajadas:</span> {workOrder.workedHours}h
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium">Descripción:</span>
                <p className="text-gray-600 mt-1">{workOrder.description}</p>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Información del Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nombre completo *
                  </label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nombre del cliente que firma"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Cargo/Posición
                  </label>
                  <Input
                    value={clientPosition}
                    onChange={(e) => setClientPosition(e.target.value)}
                    placeholder="Ej: Responsable de mantenimiento"
                  />
                </div>
              </div>
            </div>

            {/* Signature Canvas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Firma Digital</h4>
                <Button variant="outline" size="sm" onClick={clearSignature}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full h-48 border border-gray-200 rounded cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Firme en el área de arriba usando el ratón o pantalla táctil
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Conformidad del Cliente</h4>
              <p className="text-sm text-blue-800">
                Al firmar este documento, el cliente confirma que:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>El trabajo ha sido realizado satisfactoriamente</li>
                <li>La maquinaria funciona correctamente</li>
                <li>Se han utilizado los materiales especificados</li>
                <li>Está conforme con el servicio prestado</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!signatureData || !clientName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Firma
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ClientSignatureModal;