import { useToast } from '@/components/ui/use-toast';

export const useImportProcessor = () => {
  const { toast } = useToast();

  const processCSVFile = (file, onSuccess) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast({
        title: "Formato no válido",
        description: "Por favor, selecciona un archivo Excel (.xlsx, .xls) o CSV.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 1) {
          toast({
            title: "Archivo vacío",
            description: "El archivo no contiene datos para importar.",
            variant: "destructive"
          });
          return;
        }

        const data = [];
        let startIndex = 0;

        // Si la primera línea parece ser encabezados, la saltamos
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('referencia') || firstLine.includes('descripcion') || 
            firstLine.includes('reference') || firstLine.includes('description')) {
          startIndex = 1;
        }

        // Procesar cada línea de datos
        for (let i = startIndex; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= 2) {
            data.push({
              referencia: values[0] || '',
              descripcion: values[1] || ''
            });
          }
        }

        if (data.length === 0) {
          toast({
            title: "Sin datos",
            description: "No se encontraron datos válidos en el archivo.",
            variant: "destructive"
          });
          return;
        }

        onSuccess(data);
        
        toast({
          title: "Archivo procesado",
          description: `Se han encontrado ${data.length} registros para importar.`,
        });
      } catch (error) {
        toast({
          title: "Error al procesar archivo",
          description: "No se pudo leer el archivo. Verifica que sea un CSV válido.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const validateData = (data) => {
    const errors = [];
    
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      
      if (!row.referencia || row.referencia.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'referencia',
          message: 'La referencia está vacía'
        });
      }
      
      if (!row.descripcion || row.descripcion.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'descripcion',
          message: 'La descripción está vacía'
        });
      }
    });
    
    return errors;
  };

  const convertToMaterials = (data) => {
    const validData = data.filter(row => 
      row.referencia && row.referencia.trim() !== '' &&
      row.descripcion && row.descripcion.trim() !== ''
    );

    return validData.map((row, index) => ({
      id: Date.now() + index,
      name: row.descripcion.trim(),
      reference: row.referencia.trim(),
      category: 'Importado',
      stock: 0,
      minStock: 0,
      price: 0,
      supplier: 'Importado desde Excel',
      lastUsed: null,
      totalUsed: 0,
      status: 'Disponible'
    }));
  };

  return {
    processCSVFile,
    validateData,
    convertToMaterials
  };
};