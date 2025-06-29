import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import MaterialsHeader from '@/components/materials/MaterialsHeader';
import MaterialsStats from '@/components/materials/MaterialsStats';
import AddMaterialForm from '@/components/materials/AddMaterialForm';
import MaterialsFilters from '@/components/materials/MaterialsFilters';
import MaterialsList from '@/components/materials/MaterialsList';
import ExcelImportModal from '@/components/materials/ExcelImportModal';

export default function Materials() {
  const { toast } = useToast();
  const { materials, setMaterials } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    reference: '',
    name: '',
    category: '',
    supplier: ''
  });

  const categories = ['Filtros', 'Lubricantes', 'Juntas', 'Componentes', 'Kits', 'Mangueras', 'Importado'];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.reference && material.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.category) {
      const material = {
        id: Date.now(),
        name: newMaterial.name,
        reference: newMaterial.reference || `REF-${Date.now()}`,
        category: newMaterial.category,
        supplier: newMaterial.supplier || 'Sin especificar',
        lastUsed: null,
        totalUsed: 0
      };
      
      setMaterials(prev => [...prev, material]);
      
      toast({
        title: "Material añadido",
        description: `${newMaterial.name} añadido correctamente al inventario.`,
      });
      setNewMaterial({
        reference: '',
        name: '',
        category: '',
        supplier: ''
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor, completa la descripción y categoría.",
        variant: "destructive",
      });
    }
  };

  const handleImportExcel = () => {
    setShowImportModal(true);
  };

  const handleImportMaterials = (importedMaterials) => {
    // Añadir los materiales importados al estado actual
    setMaterials(prev => [...prev, ...importedMaterials]);
    
    toast({
      title: "Importación completada",
      description: `Se han importado ${importedMaterials.length} materiales correctamente.`,
    });
  };

  const handleExportExcel = () => {
    // Crear CSV con referencia y descripción
    const csvContent = [
      'referencia,descripcion',
      ...materials.map(material => 
        `${material.reference || 'Sin referencia'},"${material.name}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `materiales_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportación completada",
      description: "Se ha descargado el archivo con los materiales.",
    });
  };

  const handleFilter = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Materiales - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de inventario de materiales y repuestos para maquinaria hidráulica." />
      </Helmet>

      <div className="space-y-6">
        <MaterialsHeader 
          onImportExcel={handleImportExcel}
          onExportExcel={handleExportExcel}
        />

        <MaterialsStats materials={materials} />

        <AddMaterialForm
          newMaterial={newMaterial}
          setNewMaterial={setNewMaterial}
          onAddMaterial={handleAddMaterial}
          categories={categories}
        />

        <MaterialsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          onFilter={handleFilter}
        />

        <MaterialsList
          materials={filteredMaterials}
        />

        {showImportModal && (
          <ExcelImportModal
            onClose={() => setShowImportModal(false)}
            onImport={handleImportMaterials}
          />
        )}
      </div>
    </>
  );
}