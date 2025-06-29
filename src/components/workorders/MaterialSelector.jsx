import React, { useState } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

const MaterialSelector = ({ onSelectMaterial, onClose }) => {
  const { materials } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState({});

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.reference && material.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectMaterial = (material) => {
    const quantity = selectedQuantity[material.id] || 1;
    onSelectMaterial({
      id: Date.now(),
      name: material.name,
      reference: material.reference,
      quantity: quantity,
      unit: 'ud',
      used: false,
      originalMaterialId: material.id,
      category: material.category
    });
    onClose();
  };

  return (
    <Card className="max-h-96 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Importar Material del Inventario
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </CardTitle>
        <CardDescription>
          Selecciona materiales desde el inventario para añadir al parte
        </CardDescription>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por referencia o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="max-h-64 overflow-y-auto space-y-2">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((material) => (
            <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{material.name}</p>
                </div>
                <p className="text-xs text-gray-600 mb-1">{material.reference}</p>
                <p className="text-xs text-gray-500">{material.category}</p>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity[material.id] || 1}
                  onChange={(e) => setSelectedQuantity({
                    ...selectedQuantity,
                    [material.id]: parseInt(e.target.value) || 1
                  })}
                  className="w-16 h-8 text-sm"
                  placeholder="Cant."
                />
                <Button
                  size="sm"
                  onClick={() => handleSelectMaterial(material)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No se encontraron materiales</p>
            <p className="text-xs">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialSelector;