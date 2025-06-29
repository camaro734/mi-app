import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SystemInformation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Información del Sistema
          </CardTitle>
          <CardDescription>
            Detalles técnicos y versión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Versión del Sistema</p>
              <p className="text-lg font-bold">v1.0.0</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Última Actualización</p>
              <p className="text-lg font-bold">Hoy</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Estado del Sistema</p>
              <p className="text-lg font-bold text-green-600">Operativo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SystemInformation;