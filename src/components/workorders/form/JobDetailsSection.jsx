
import React from 'react';
import { Input } from '@/components/ui/input';

const JobDetailsSection = ({ formData, errors, handleInputChange }) => {
  const workTypes = ['Reparación', 'Mantenimiento', 'Inspección', 'Instalación', 'Diagnóstico', 'Revisión'];
  const priorities = [
    { value: 'Baja', color: 'bg-green-100 text-green-800' },
    { value: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Alta', color: 'bg-red-100 text-red-800' },
    { value: 'Crítica', color: 'bg-red-500 text-white' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Detalles del Trabajo
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Trabajo</label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {workTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Prioridad</label>
          <div className="flex flex-wrap gap-2">
            {priorities.map(priority => (
              <button
                key={priority.value}
                type="button"
                onClick={() => handleInputChange('priority', priority.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  formData.priority === priority.value
                    ? `${priority.color} ring-2 ring-offset-1 ${priority.color.replace('bg-', 'ring-')}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority.value}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción del Problema *</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe detalladamente el problema o trabajo a realizar..."
          rows={4}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>
    </div>
  );
};

export default JobDetailsSection;
