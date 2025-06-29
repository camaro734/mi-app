import React from 'react';
import { Package, Layers, Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MaterialsStats = ({ materials }) => {
  const totalMaterials = materials.length;
  const categories = [...new Set(materials.map(m => m.category))].length;
  const importedMaterials = materials.filter(m => m.category === 'Importado').length;

  const stats = [
    {
      title: 'Total Materiales',
      value: totalMaterials,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Categorías',
      value: categories,
      icon: Layers,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Importados',
      value: importedMaterials,
      icon: Archive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MaterialsStats;