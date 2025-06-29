import React, { useState, useRef } from 'react';
import { FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useImportProcessor } from '@/components/materials/ImportProcessor';
import { UploadStep, PreviewStep, SuccessStep } from '@/components/materials/ImportSteps';

const ExcelImportModal = ({ onClose, onImport }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [importData, setImportData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Import

  const { processCSVFile, validateData, convertToMaterials } = useImportProcessor();

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    processCSVFile(file, (data) => {
      const errors = validateData(data);
      setImportData(data);
      setValidationErrors(errors);
      setStep(2);
    });
  };

  const handleImport = () => {
    const materials = convertToMaterials(importData);

    if (materials.length === 0) {
      toast({
        title: "Sin datos válidos",
        description: "No hay registros válidos para importar.",
        variant: "destructive"
      });
      return;
    }

    onImport(materials);
    setStep(3);
    
    toast({
      title: "Importación completada",
      description: `Se han importado ${materials.length} materiales correctamente.`,
    });

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const downloadTemplate = () => {
    const csvContent = "referencia,descripcion\nHF6177,Filtro hidráulico HF6177\nISO46-20L,Aceite hidráulico ISO 46 - 20 litros\nJT50X3,Junta tórica 50x3 mm";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_materiales.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Plantilla descargada",
      description: "Se ha descargado la plantilla de ejemplo.",
    });
  };

  const dragHandlers = {
    onDragEnter: handleDrag,
    onDragLeave: handleDrag,
    onDragOver: handleDrag,
    onDrop: handleDrop
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Importar Materiales desde Excel
              </CardTitle>
              <CardDescription>
                Importa materiales masivamente usando un archivo Excel o CSV
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <UploadStep
              dragActive={dragActive}
              onDragHandlers={dragHandlers}
              onFileSelect={handleFileInput}
              fileInputRef={fileInputRef}
              onDownloadTemplate={downloadTemplate}
            />
          )}

          {step === 2 && (
            <PreviewStep
              importData={importData}
              validationErrors={validationErrors}
              onBack={() => setStep(1)}
              onImport={handleImport}
            />
          )}

          {step === 3 && <SuccessStep />}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelImportModal;