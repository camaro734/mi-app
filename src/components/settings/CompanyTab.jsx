import React, { useState, useEffect } from 'react';
import { Save, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import LogoUploader from './LogoUploader';

const CompanyTab = ({ companySettings, setCompanySettings, onSave }) => {
  const { toast } = useToast();
  const [logoData, setLogoData] = useState(null);

  // Cargar logo desde localStorage al montar el componente
  useEffect(() => {
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      try {
        const logoInfo = JSON.parse(savedLogo);
        setLogoData(logoInfo);
      } catch (error) {
        console.error('Error al cargar logo:', error);
      }
    }
  }, []);

  const handleLogoChange = (newLogoData) => {
    setLogoData(newLogoData);
    
    // Actualizar configuración de la empresa
    setCompanySettings(prev => ({
      ...prev,
      logo: newLogoData?.data || ''
    }));
  };

  const handleSaveSettings = () => {
    // Guardar configuración de la empresa en localStorage
    const settingsToSave = {
      ...companySettings,
      logo: logoData?.data || ''
    };
    
    localStorage.setItem('companySettings', JSON.stringify(settingsToSave));
    
    onSave();
    
    toast({
      title: "Configuración guardada",
      description: "Los datos de la empresa han sido actualizados correctamente.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Datos de la Empresa
        </CardTitle>
        <CardDescription>
          Configura la información corporativa y personalización
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <LogoUploader 
          currentLogo={logoData?.data}
          onLogoChange={handleLogoChange}
        />

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Nombre de la Empresa
            </label>
            <Input
              value={companySettings.name}
              onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
              placeholder="Nombre de la empresa"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Teléfono
            </label>
            <Input
              value={companySettings.phone}
              onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
              placeholder="+34 XXX XXX XXX"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <Input
              type="email"
              value={companySettings.email}
              onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
              placeholder="email@empresa.com"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sitio Web
            </label>
            <Input
              value={companySettings.website}
              onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
              placeholder="www.empresa.com"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Dirección
          </label>
          <Input
            value={companySettings.address}
            onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
            placeholder="Dirección completa de la empresa"
          />
        </div>

        <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyTab;