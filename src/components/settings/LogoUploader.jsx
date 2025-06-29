import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const LogoUploader = ({ currentLogo, onLogoChange }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogo || '');

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Por favor, selecciona una imagen en formato JPG, PNG, GIF o WebP.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      setPreview(imageData);
      
      // Guardar en localStorage
      const logoData = {
        data: imageData,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
      
      localStorage.setItem('companyLogo', JSON.stringify(logoData));
      
      // Notificar al componente padre
      onLogoChange(logoData);
      
      setUploading(false);
      
      toast({
        title: "Logo subido correctamente",
        description: `${file.name} se ha guardado como logo de la empresa.`,
      });
    };

    reader.onerror = () => {
      setUploading(false);
      toast({
        title: "Error al subir archivo",
        description: "Hubo un problema al procesar la imagen.",
        variant: "destructive"
      });
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    setPreview('');
    localStorage.removeItem('companyLogo');
    onLogoChange(null);
    
    toast({
      title: "Logo eliminado",
      description: "Se ha eliminado el logo de la empresa.",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700 block">
        Logo de la Empresa
      </label>
      
      {/* Preview del logo actual */}
      {preview && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={preview} 
                  alt="Logo de la empresa" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-medium text-sm">Logo actual</p>
                <p className="text-xs text-gray-500">
                  {JSON.parse(localStorage.getItem('companyLogo') || '{}').name || 'Logo personalizado'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRemoveLogo}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </Card>
      )}

      {/* Área de subida */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <CardContent className="p-8 text-center">
          {uploading ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600">Subiendo logo...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {preview ? 'Cambiar logo' : 'Subir logo de la empresa'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Arrastra y suelta una imagen aquí, o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Formatos: JPG, PNG, GIF, WebP • Máximo: 5MB
                </p>
              </div>
              <Button variant="outline" size="sm" type="button">
                <Image className="h-4 w-4 mr-2" />
                Seleccionar Archivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input oculto para selección de archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

export default LogoUploader;