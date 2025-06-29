import React from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DatabaseIntegration = ({ onDatabaseIntegration }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Integración de Datos
          </CardTitle>
          <CardDescription>
            Conexión con bases de datos externas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Supabase</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  No conectado
                </span>
              </div>
              <p className="text-sm text-gray-600">Base de datos en la nube recomendada</p>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Google Sheets</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  No conectado
                </span>
              </div>
              <p className="text-sm text-gray-600">Sincronización con hojas de cálculo</p>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Excel/CSV</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  Disponible
                </span>
              </div>
              <p className="text-sm text-gray-600">Importación/exportación de archivos</p>
            </div>
          </div>
          
          <Button onClick={onDatabaseIntegration} className="w-full" variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Configurar Integraciones
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DatabaseIntegration;