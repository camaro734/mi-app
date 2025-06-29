import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const SpecialtiesSection = ({ 
  formData, 
  newSpecialty, 
  setNewSpecialty, 
  addSpecialty, 
  removeSpecialty,
  newCertification,
  setNewCertification,
  addCertification,
  removeCertification
}) => {
  return (
    <>
      {/* Especialidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Especialidades
        </h3>
        
        <div className="flex gap-2">
          <Input
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Añadir especialidad..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
          />
          <Button type="button" onClick={addSpecialty} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.specialties.map((specialty, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-red-50"
              onClick={() => removeSpecialty(index)}
            >
              {specialty} ×
            </Badge>
          ))}
        </div>
      </div>

      {/* Certificaciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Certificaciones
        </h3>
        
        <div className="flex gap-2">
          <Input
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            placeholder="Añadir certificación..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
          />
          <Button type="button" onClick={addCertification} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.certifications.map((cert, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-red-50 bg-green-50 text-green-700"
              onClick={() => removeCertification(index)}
            >
              {cert} ×
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
};

export default SpecialtiesSection;