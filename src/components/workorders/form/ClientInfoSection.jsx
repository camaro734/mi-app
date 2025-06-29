
import React from 'react';
import { Search, X, Edit, Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ClientInfoSection = ({
  formData,
  errors,
  handleInputChange,
  selectedClientFromDB,
  setShowClientSelector,
  handleClearClient,
  handleEditClient,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-red-100 text-red-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex-1">
          Información del Cliente
        </h3>
        <div className="flex gap-2 ml-4">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowClientSelector(true)}>
            <Search className="h-4 w-4 mr-2" />
            Buscar en BD
          </Button>
          {selectedClientFromDB && (
            <Button type="button" variant="outline" size="sm" onClick={handleClearClient}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {selectedClientFromDB && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Cliente de la base de datos</span>
              <Badge className={`ml-2 ${getStatusColor(selectedClientFromDB.status)}`}>{selectedClientFromDB.status}</Badge>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleEditClient}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Cliente
            </Button>
          </div>
          {selectedClientFromDB.notes && <p className="text-xs text-green-700 mt-2"><strong>Notas:</strong> {selectedClientFromDB.notes}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Cliente *</label>
          <Input value={formData.client} onChange={(e) => handleInputChange('client', e.target.value)} placeholder="Nombre del cliente" className={errors.client ? 'border-red-500' : ''} disabled={!!selectedClientFromDB} />
          {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Contacto</label>
          <Input value={formData.clientContact} onChange={(e) => handleInputChange('clientContact', e.target.value)} placeholder="Nombre del contacto" disabled={!!selectedClientFromDB} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</label>
          <Input value={formData.clientPhone} onChange={(e) => handleInputChange('clientPhone', e.target.value)} placeholder="+34 666 123 456" disabled={!!selectedClientFromDB} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
          <Input type="email" value={formData.clientEmail} onChange={(e) => handleInputChange('clientEmail', e.target.value)} placeholder="contacto@cliente.com" disabled={!!selectedClientFromDB} />
        </div>
      </div>

      {!selectedClientFromDB && (formData.client || formData.clientContact) && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleEditClient}>
            <Plus className="h-4 w-4 mr-2" />
            Crear/Editar Cliente
          </Button>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Ubicación del Trabajo</label>
        <Input value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Dirección donde se realizará el trabajo" />
      </div>
    </div>
  );
};

export default ClientInfoSection;
