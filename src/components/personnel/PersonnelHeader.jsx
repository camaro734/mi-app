import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PersonnelHeader = ({ user, onAddPersonnel }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Personal</h1>
        <p className="text-gray-600">Gestiona el equipo técnico y control de presencia</p>
      </div>
      
      {user?.role === 'admin' && (
        <Button onClick={onAddPersonnel} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </Button>
      )}
    </div>
  );
};

export default PersonnelHeader;