import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PhotosTab = ({ workOrder, onAddPhoto, canEdit }) => {
  // Asegurar que photos siempre sea un array
  const photos = workOrder?.photos || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Fotos del Trabajo</CardTitle>
            <CardDescription>
              Documentación fotográfica del proceso de reparación
            </CardDescription>
          </div>
          {canEdit && (
            <Button onClick={onAddPhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Añadir Foto
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.length > 0 ? (
            photos.map((photo) => (
              <div key={photo.id} className="space-y-2">
                <img
                  src={photo.url}
                  alt={photo.description}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-600">{photo.description}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay fotos registradas aún</p>
              {canEdit && (
                <p className="text-xs mt-1">Utiliza el botón "Añadir Foto" para documentar el trabajo</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotosTab;