import React from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const WorkOrderHeader = ({ 
  workOrder, 
  onBack, 
  onEdit, 
  onDelete,
  canEdit, 
  getStatusColor, 
  getPriorityColor 
}) => {
  const { user } = useAuth();
  const canDelete = user?.role === 'admin' || user?.role === 'supervisor';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{workOrder.id}</h1>
          <p className="text-gray-600">{workOrder.client}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(workOrder.status)}>
          {workOrder.status}
        </Badge>
        <Badge className={getPriorityColor(workOrder.priority)}>
          {workOrder.priority}
        </Badge>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
        {canDelete && (
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkOrderHeader;