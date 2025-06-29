
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

const FormActions = ({ onCancel, initialData }) => {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
        <Save className="h-4 w-4 mr-2" />
        {initialData ? 'Actualizar Parte' : 'Crear Parte'}
      </Button>
    </div>
  );
};

export default FormActions;
