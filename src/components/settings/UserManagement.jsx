import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserManagement = ({ onUserManagement }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gestión de Usuarios
          </CardTitle>
          <CardDescription>
            Permisos y roles de usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Administrador</p>
                <p className="text-sm text-gray-600">Acceso completo al sistema</p>
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Todos los permisos
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Jefe de Taller</p>
                <p className="text-sm text-gray-600">Gestión de partes, agenda y personal</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Permisos limitados
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Técnico</p>
                <p className="text-sm text-gray-600">Gestión de sus propios partes</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Solo lectura/edición propia
              </span>
            </div>
          </div>
          
          <Button onClick={onUserManagement} className="w-full" variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Configurar Permisos
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserManagement;