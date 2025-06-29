import React from 'react';
import { Input } from '@/components/ui/input';

const PersonalInfoSection = ({ formData, errors, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Información Personal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nombre Completo *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nombre y apellidos"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@cmghidraulica.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Teléfono *
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+34 666 123 456"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Ubicación
          </label>
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Valencia"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            URL Avatar (opcional)
          </label>
          <Input
            value={formData.avatar}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            placeholder="https://ejemplo.com/avatar.jpg"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;