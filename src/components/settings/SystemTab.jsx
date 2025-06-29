import React from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SystemTab = ({ systemSettings, setSystemSettings, onSave }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" />
          Configuración del Sistema
        </CardTitle>
        <CardDescription>
          Ajustes generales de funcionamiento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Idioma
            </label>
            <select
              value={systemSettings.language}
              onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Zona Horaria
            </label>
            <select
              value={systemSettings.timezone}
              onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Europe/Madrid">Europa/Madrid</option>
              <option value="Europe/London">Europa/Londres</option>
              <option value="America/New_York">América/Nueva York</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Formato de Fecha
            </label>
            <select
              value={systemSettings.dateFormat}
              onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Moneda
            </label>
            <select
              value={systemSettings.currency}
              onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dólar ($)</option>
              <option value="GBP">Libra (£)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones del sistema</p>
                <p className="text-sm text-gray-600">Recibir alertas importantes</p>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.notifications}
                onChange={(e) => setSystemSettings({...systemSettings, notifications: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Copia de seguridad automática</p>
                <p className="text-sm text-gray-600">Backup diario de datos</p>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.autoBackup}
                onChange={(e) => setSystemSettings({...systemSettings, autoBackup: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </CardContent>
    </Card>
  );
};

export default SystemTab;