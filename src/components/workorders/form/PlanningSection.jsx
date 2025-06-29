
import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

const PlanningSection = ({ formData, errors, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Planificación
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Horas Estimadas *</label>
          <Input
            type="number"
            min="0.5"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || '')}
            placeholder="8"
            className={errors.estimatedHours ? 'border-red-500' : ''}
          />
          {errors.estimatedHours && <p className="text-red-500 text-xs mt-1">{errors.estimatedHours}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha Límite *</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className={errors.dueDate ? 'border-red-500' : ''}
          />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Asignación de Técnicos</h4>
            <p className="text-sm text-blue-700 mt-1">
              Los técnicos se asignarán automáticamente cuando se fichen en este parte de trabajo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningSection;
