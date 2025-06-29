import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CredentialsSection = ({ 
  formData, 
  errors, 
  handleInputChange, 
  showPassword, 
  setShowPassword, 
  user 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Credenciales de Acceso
      </h3>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              Información de Acceso
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              El sistema utiliza email y contraseña para iniciar sesión. 
              Asegúrate de que el email sea único y válido.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Email de Acceso *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="usuario@cmghidraulica.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Este email se utilizará para iniciar sesión en el sistema
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Contraseña {!user && '*'}
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={user ? "Dejar vacío para mantener actual" : "Contraseña"}
              className={errors.password ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 6 caracteres recomendado
          </p>
        </div>
      </div>

      {/* Ejemplo de credenciales */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Ejemplo de credenciales:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Email:</strong> {formData.email || 'usuario@cmghidraulica.com'}</p>
          <p><strong>Contraseña:</strong> {formData.password || '••••••'}</p>
        </div>
      </div>
    </div>
  );
};

export default CredentialsSection;