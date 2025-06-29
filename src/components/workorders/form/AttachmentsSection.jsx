
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File as FileIcon, Image, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AttachmentsSection = ({ attachments, onAttachmentsChange }) => {
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setIsUploading(true);
    let newAttachments = [...attachments];
    let filesProcessed = 0;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Archivo demasiado grande",
          description: `El archivo ${file.name} supera el límite de 5MB.`,
        });
        filesProcessed++;
        if (filesProcessed === files.length) setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        newAttachments.push({
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: event.target.result,
        });
        filesProcessed++;
        if (filesProcessed === files.length) {
          onAttachmentsChange(newAttachments);
          setIsUploading(false);
          toast({ title: "Archivos añadidos", description: `${files.length} archivo(s) se han añadido correctamente.` });
        }
      };
      reader.onerror = () => {
        filesProcessed++;
        toast({ variant: "destructive", title: "Error de lectura", description: `No se pudo leer el archivo ${file.name}.`});
        if (filesProcessed === files.length) setIsUploading(false);
      }
      reader.readAsDataURL(file);
    });
    
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id) => {
    onAttachmentsChange(attachments.filter((att) => att.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
        Archivos y Fotos Adjuntas
      </h3>
      <div className="border border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
        <Input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <Button type="button" variant="outline" onClick={triggerFileInput} disabled={isUploading}>
          {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {isUploading ? 'Cargando...' : 'Seleccionar Archivos'}
        </Button>
        <p className="text-xs text-gray-500 mt-2">Puedes adjuntar fotos, PDFs o documentos (máx 5MB por archivo).</p>
      </div>

      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between p-2 border rounded-md bg-white hover:bg-gray-50">
              <div className="flex items-center gap-3 overflow-hidden">
                {att.type.startsWith('image/') ? <Image className="h-5 w-5 text-blue-500 flex-shrink-0" /> : <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                <span className="text-sm truncate" title={att.name}>{att.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAttachment(att.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;
