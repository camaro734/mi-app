import React, { useState, useEffect } from 'react';
import { Save, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const VacationSettingsTab = () => {
  const { toast } = useToast();
  const [vacationSettings, setVacationSettings] = useState({
    annualDays: 22,
    maxConsecutiveDays: 15,
    minAdvanceNotice: 15,
    allowNegativeBalance: false,
    requireApproval: true
  });

  // Cargar configuración guardada
  useEffect(() => {
    const savedSettings = localStorage.getItem('vacationSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setVacationSettings(parsedSettings);
      } catch (error) {
        console.error('Error al cargar configuración de vacaciones:', error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('vacationSettings', JSON.stringify(vacationSettings));
    toast({
      title: "Configuración guardada",
      description: "La configuración de vacaciones ha sido actualizada correctamente.",
    });
  };

  const handleInputChange = (field, value) => {
    setVacationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Configuración de Vacaciones
          </CardTitle>
          <CardDescription>
            Establece los parámetros para la gestión de vacaciones del personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Días anuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Días de vacaciones anuales
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={vacationSettings.annualDays}
                onChange={(e) => handleInputChange('annualDays', parseInt(e.target.value) || 22)}
                placeholder="22"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de días de vacaciones que corresponden a cada empleado por año
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Máximo días consecutivos
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                value={vacationSettings.maxConsecutiveDays}
                onChange={(e) => handleInputChange('maxConsecutiveDays', parseInt(e.target.value) || 15)}
                placeholder="15"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de días consecutivos que se pueden solicitar
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Aviso previo mínimo (días)
              </label>
              <Input
                type="number"
                min="1"
                max="90"
                value={vacationSettings.minAdvanceNotice}
                onChange={(e) => handleInputChange('minAdvanceNotice', parseInt(e.target.value) || 15)}
                placeholder="15"
              />
              <p className="text-xs text-gray-500 mt-1">
                Días de antelación mínima para solicitar vacaciones
              </p>
            </div>
          </div>

          {/* Configuraciones adicionales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Políticas de Vacaciones</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir saldo negativo</p>
                  <p className="text-sm text-gray-600">
                    Permite a los empleados tomar más días de los disponibles
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={vacationSettings.allowNegativeBalance}
                  onChange={(e) => handleInputChange('allowNegativeBalance', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Requiere aprobación</p>
                  <p className="text-sm text-gray-600">
                    Las solicitudes deben ser aprobadas por supervisores
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={vacationSettings.requireApproval}
                  onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Información actual */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Configuración Actual
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Días anuales disponibles: <strong>{vacationSettings.annualDays} días</strong></p>
              <p>• Máximo consecutivo: <strong>{vacationSettings.maxConsecutiveDays} días</strong></p>
              <p>• Aviso previo: <strong>{vacationSettings.minAdvanceNotice} días</strong></p>
              <p>• Saldo negativo: <strong>{vacationSettings.allowNegativeBalance ? 'Permitido' : 'No permitido'}</strong></p>
              <p>• Aprobación requerida: <strong>{vacationSettings.requireApproval ? 'Sí' : 'No'}</strong></p>
            </div>
          </div>

          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationSettingsTab;