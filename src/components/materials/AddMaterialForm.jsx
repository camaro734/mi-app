import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AddMaterialForm = ({ newMaterial, setNewMaterial, onAddMaterial, categories }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Añadir Nuevo Material</CardTitle>
        <CardDescription>
          Registra un nuevo material en el inventario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Referencia del material"
            value={newMaterial.reference || ''}
            onChange={(e) => setNewMaterial({...newMaterial, reference: e.target.value})}
          />
          <Input
            placeholder="Descripción del material"
            value={newMaterial.name}
            onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
          />
          <select
            value={newMaterial.category}
            onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button onClick={onAddMaterial} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddMaterialForm;