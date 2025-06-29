import React from 'react';
import { motion } from 'framer-motion';
import { Building, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CompanySettings = ({ companySettings, setCompanySettings, onSave }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>
            Datos corporativos y de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Nombre de la Empresa</Label>
            <Input
              id="company-name"
              value={companySettings.name}
              onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="company-address">Dirección</Label>
            <Input
              id="company-address"
              value={companySettings.address}
              onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-city">Ciudad</Label>
              <Input
                id="company-city"
                value={companySettings.city}
                onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="company-postal">Código Postal</Label>
              <Input
                id="company-postal"
                value={companySettings.postal_code}
                onChange={(e) => setCompanySettings({...companySettings, postal_code: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="company-phone">Teléfono</Label>
            <Input
              id="company-phone"
              value={companySettings.phone}
              onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="company-email">Email</Label>
            <Input
              id="company-email"
              type="email"
              value={companySettings.email}
              onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="company-website">Sitio Web</Label>
            <Input
              id="company-website"
              value={companySettings.website}
              onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
            />
          </div>
          <Button onClick={onSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Guardar Información
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanySettings;