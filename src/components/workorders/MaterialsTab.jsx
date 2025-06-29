import React, { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MaterialSelector from './MaterialSelector';

const MaterialsTab = ({ 
  workOrder, 
  newMaterial, 
  setNewMaterial, 
  onAddMaterial 
}) => {
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  
  // Asegurar que materials siempre sea un array
  const materials = workOrder?.materials || [];

  const handleImportMaterial = (material) => {
    onAddMaterial(material);
    setShowMaterialSelector(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materiales Utilizados</CardTitle>
        <CardDescription>
          Lista de materiales necesarios y utilizados en este trabajo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Material Options - Todos los usuarios pueden añadir materiales */}
        <div className="space-y-4">
          {/* Import from Inventory Button */}
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Gestión de Materiales</h4>
            <Button 
              onClick={() => setShowMaterialSelector(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Importar del Inventario
            </Button>
          </div>

          {/* Material Selector */}
          {showMaterialSelector && (
            <MaterialSelector
              onSelectMaterial={handleImportMaterial}
              onClose={() => setShowMaterialSelector(false)}
            />
          )}

          {/* Manual Add Material Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Añadir Material Manualmente</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Referencia"
                value={newMaterial?.reference || ''}
                onChange={(e) => setNewMaterial({...newMaterial, reference: e.target.value})}
              />
              <Input
                placeholder="Descripción del material"
                value={newMaterial?.name || ''}
                onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
              />
              <Input
                placeholder="Cantidad"
                type="number"
                min="0"
                step="0.1"
                value={newMaterial?.quantity || ''}
                onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
              />
              <Button onClick={() => onAddMaterial()}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="space-y-2">
          <h4 className="font-medium">Materiales del Parte ({materials.length})</h4>
          {materials.length > 0 ? (
            materials.map((material) => (
              <div key={material.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{material.name}</p>
                    {material.originalMaterialId && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Inventario
                      </Badge>
                    )}
                  </div>
                  {material.reference && (
                    <p className="text-sm text-gray-600 mb-1">Ref: {material.reference}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Cantidad: {material.quantity} {material.unit || 'ud'}
                  </p>
                  {material.category && (
                    <p className="text-xs text-gray-500">{material.category}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={material.used ? "default" : "outline"}>
                    {material.used ? "Utilizado" : "Pendiente"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No hay materiales registrados aún</p>
              <p className="text-xs mt-1">Importa desde el inventario o añade manualmente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialsTab;