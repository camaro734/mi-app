
import React from 'react';
import { Input } from '@/components/ui/input';

const MachineInfoSection = ({ formData, errors, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Información de la Máquina
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Máquina/Equipo *</label>
          <Input value={formData.machine} onChange={(e) => handleInputChange('machine', e.target.value)} placeholder="Ej: Grúa Hiab 166 E-5" className={errors.machine ? 'border-red-500' : ''} />
          {errors.machine && <p className="text-red-500 text-xs mt-1">{errors.machine}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Marca *</label>
          <Input value={formData.brand} onChange={(e) => handleInputChange('brand', e.target.value)} placeholder="Ej: Hiab, Dhollandia" className={errors.brand ? 'border-red-500' : ''} />
          {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Modelo *</label>
          <Input value={formData.model} onChange={(e) => handleInputChange('model', e.target.value)} placeholder="Ej: 166 E-5, DH-SM.15" className={errors.model ? 'border-red-500' : ''} />
          {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Matrícula *</label>
          <Input value={formData.plate} onChange={(e) => handleInputChange('plate', e.target.value)} placeholder="Ej: 1234-HBG" className={errors.plate ? 'border-red-500' : ''} />
          {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate}</p>}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Número de Serie</label>
        <Input value={formData.serial} onChange={(e) => handleInputChange('serial', e.target.value)} placeholder="Número de serie del equipo" />
      </div>
    </div>
  );
};

export default MachineInfoSection;
