
import React from 'react';
import { Camera, Paperclip, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PhotosTab = ({ workOrder, onAddPhoto, canEdit }) => {
  const attachments = workOrder?.attachments || workOrder?.photos || [];

  const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.dataUrl || attachment.url;
    link.download = attachment.name || 'archivo-adjunto';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (attachment) => {
    const type = attachment.type || '';
    const url = attachment.url || attachment.dataUrl || '';
    return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Fotos y Archivos Adjuntos</CardTitle>
            <CardDescription>
              Documentación del proceso de reparación
            </CardDescription>
          </div>
          {canEdit && (
            <Button onClick={onAddPhoto} size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Añadir Foto/Archivo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {attachments.length > 0 ? (
            attachments.map((attachment, index) => (
              <div key={attachment.id || index} className="group relative border rounded-lg overflow-hidden shadow-sm aspect-w-1 aspect-h-1">
                {isImage(attachment) ? (
                   <img
                    src={attachment.dataUrl || attachment.url}
                    alt={attachment.description || attachment.name || 'Adjunto'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-center text-gray-600 mt-2 truncate w-full" title={attachment.name}>
                      {attachment.name || 'Archivo'}
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center p-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Paperclip className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-sm font-semibold">No hay archivos adjuntos</p>
              {canEdit && (
                <p className="text-xs mt-1">Utiliza el botón "Añadir Foto/Archivo" para documentar el trabajo.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotosTab;
