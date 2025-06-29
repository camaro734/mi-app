import React from 'react';
import { Input } from '@/components/ui/input';

const WorkInfoSection = ({ formData, handleInputChange, getDepartmentByRole }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Información Laboral
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Rol
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="technician">Técnico</option>
            <option value="supervisor">Jefe de Taller</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Activo">Activo</option>
            <option value="Vacaciones">Vacaciones</option>
            <option value="Baja médica">Baja médica</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Fecha de Ingreso
          </label>
          <Input
            type="date"
            value={formData.joinDate}
            onChange={(e) => handleInputChange('joinDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Departamento (automático según rol)
        </label>
        <Input
          value={formData.department}
          disabled
          className="bg-gray-50"
        />
      </div>
    </div>
  );
};

export default WorkInfoSection;