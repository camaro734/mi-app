import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MaterialCard from './MaterialCard';

const MaterialsList = ({ materials }) => {
  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron materiales
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda o añadir un nuevo material.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {materials.map((material, index) => (
        <MaterialCard
          key={material.id}
          material={material}
          index={index}
        />
      ))}
    </div>
  );
};

export default MaterialsList;