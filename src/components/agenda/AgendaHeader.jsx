import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AgendaHeader = ({ canCreate, onCreate }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda de Clientes</h1>
        <p className="text-gray-600">Gestiona citas y programación de servicios</p>
      </div>
      
      {canCreate && (
        <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      )}
    </div>
  );
};

export default AgendaHeader;
