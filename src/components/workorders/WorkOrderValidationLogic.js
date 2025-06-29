import { useState } from 'react';

export function useWorkOrderValidation(workOrder) {
  const [validatedHours, setValidatedHours] = useState(workOrder.workedHours || 0);
  const [validatedMaterials, setValidatedMaterials] = useState(
    workOrder.materials?.map(m => ({ ...m, validated: true })) || []
  );
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '', unit: 'ud' });
  const [validationNotes, setValidationNotes] = useState('');

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.quantity) {
      setValidatedMaterials(prev => [
        ...prev,
        {
          id: Date.now(),
          name: newMaterial.name,
          quantity: parseFloat(newMaterial.quantity),
          unit: newMaterial.unit,
          validated: true,
          addedInValidation: true
        }
      ]);
      setNewMaterial({ name: '', quantity: '', unit: 'ud' });
    }
  };

  const handleRemoveMaterial = (materialId) => {
    setValidatedMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const handleMaterialQuantityChange = (materialId, newQuantity) => {
    setValidatedMaterials(prev => prev.map(m => 
      m.id === materialId ? { ...m, quantity: parseFloat(newQuantity) || 0 } : m
    ));
  };

  const getValidationData = () => {
    return {
      validatedHours: parseFloat(validatedHours),
      validatedMaterials: validatedMaterials.filter(m => m.quantity > 0),
      validationNotes: validationNotes.trim(),
      validatedAt: new Date().toISOString()
    };
  };

  return {
    validatedHours,
    setValidatedHours,
    validatedMaterials,
    newMaterial,
    setNewMaterial,
    validationNotes,
    setValidationNotes,
    handleAddMaterial,
    handleRemoveMaterial,
    handleMaterialQuantityChange,
    getValidationData
  };
}