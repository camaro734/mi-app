import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BrandCustomization = ({ colorSettings, setColorSettings, onSaveColors, onUploadLogo }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Personalización de Marca
          </CardTitle>
          <CardDescription>
            Logo y colores corporativos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo de la Empresa</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Logo actual</p>
              <Button variant="outline" onClick={onUploadLogo}>
                <Upload className="w-4 h-4 mr-2" />
                Subir Nuevo Logo
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="primary-color">Color Primario</Label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  id="primary-color"
                  value={colorSettings.primary}
                  onChange={(e) => setColorSettings({...colorSettings, primary: e.target.value})}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <Input
                  value={colorSettings.primary}
                  onChange={(e) => setColorSettings({...colorSettings, primary: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondary-color">Color Secundario</Label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  id="secondary-color"
                  value={colorSettings.secondary}
                  onChange={(e) => setColorSettings({...colorSettings, secondary: e.target.value})}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <Input
                  value={colorSettings.secondary}
                  onChange={(e) => setColorSettings({...colorSettings, secondary: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="accent-color">Color de Acento</Label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  id="accent-color"
                  value={colorSettings.accent}
                  onChange={(e) => setColorSettings({...colorSettings, accent: e.target.value})}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <Input
                  value={colorSettings.accent}
                  onChange={(e) => setColorSettings({...colorSettings, accent: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <Button onClick={onSaveColors} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Guardar Colores
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BrandCustomization;