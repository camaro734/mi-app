import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SettingsHeader from '@/components/settings/SettingsHeader';
import CompanyTab from '@/components/settings/CompanyTab';
import SystemTab from '@/components/settings/SystemTab';
import UsersTab from '@/components/settings/UsersTab';
import IntegrationsTab from '@/components/settings/IntegrationsTab';
import DataManagementTab from '@/components/settings/DataManagementTab';
import PrintTemplateTab from '@/components/settings/PrintTemplateTab';
import VacationSettingsTab from '@/components/settings/VacationSettingsTab';
import VacationManagementTab from '@/components/settings/VacationManagementTab';
import AttendanceExportTab from '@/components/settings/AttendanceExportTab';
import ProductivityReportsTab from '@/components/settings/ProductivityReportsTab';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companySettings, setCompanySettings] = useState({
    name: 'CMG HIDRÁULICA S.L.',
    address: 'Polígono Industrial Norte, Nave 15, Valencia',
    phone: '+34 963 123 456',
    email: 'info@cmghidraulica.com',
    website: 'www.cmghidraulica.com',
    logo: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    language: 'es',
    timezone: 'Europe/Madrid',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    notifications: true,
    autoBackup: true
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    supabase: {
      connected: false,
      url: '',
      key: ''
    },
    stripe: {
      connected: false,
      publishableKey: '',
      webhookSecret: ''
    },
    googleSheets: {
      connected: false,
      sheetId: ''
    }
  });

  // Cargar configuración guardada al montar el componente
  useEffect(() => {
    const savedCompanySettings = localStorage.getItem('companySettings');
    if (savedCompanySettings) {
      try {
        const parsedSettings = JSON.parse(savedCompanySettings);
        setCompanySettings(parsedSettings);
      } catch (error) {
        console.error('Error al cargar configuración de empresa:', error);
      }
    }

    const savedSystemSettings = localStorage.getItem('systemSettings');
    if (savedSystemSettings) {
      try {
        const parsedSettings = JSON.parse(savedSystemSettings);
        setSystemSettings(parsedSettings);
      } catch (error) {
        console.error('Error al cargar configuración del sistema:', error);
      }
    }
  }, []);

  const handleSaveCompanySettings = () => {
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    toast({
      title: "Configuración guardada",
      description: "Los datos de la empresa han sido actualizados correctamente.",
    });
  };

  const handleSaveSystemSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    toast({
      title: "Configuración guardada",
      description: "La configuración del sistema ha sido actualizada correctamente.",
    });
  };

  const handleConnectSupabase = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleConnectStripe = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  // Determinar qué pestañas mostrar según el rol
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor' || user?.role === 'admin';

  return (
    <>
      <Helmet>
        <title>Ajustes - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Configuración del sistema, datos de empresa y gestión de usuarios." />
      </Helmet>

      <div className="space-y-6">
        <SettingsHeader />

        {/* Settings Tabs */}
        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-10' : isSupervisor ? 'grid-cols-7' : 'grid-cols-2'}`}>
            <TabsTrigger value="company">Empresa</TabsTrigger>
            {isSupervisor && <TabsTrigger value="vacations">Vacaciones</TabsTrigger>}
            {isSupervisor && <TabsTrigger value="vacation-management">Días Personal</TabsTrigger>}
            {isSupervisor && <TabsTrigger value="attendance">Fichadas</TabsTrigger>}
            {isSupervisor && <TabsTrigger value="productivity">Productividad</TabsTrigger>}
            {isAdmin && <TabsTrigger value="system">Sistema</TabsTrigger>}
            {isAdmin && <TabsTrigger value="users">Usuarios</TabsTrigger>}
            {isSupervisor && <TabsTrigger value="print">Impresión</TabsTrigger>}
            {isAdmin && <TabsTrigger value="data">Datos</TabsTrigger>}
            {isAdmin && <TabsTrigger value="integrations">Integraciones</TabsTrigger>}
          </TabsList>

          <TabsContent value="company">
            <CompanyTab
              companySettings={companySettings}
              setCompanySettings={setCompanySettings}
              onSave={handleSaveCompanySettings}
            />
          </TabsContent>

          {isSupervisor && (
            <TabsContent value="vacations">
              <VacationSettingsTab />
            </TabsContent>
          )}

          {isSupervisor && (
            <TabsContent value="vacation-management">
              <VacationManagementTab />
            </TabsContent>
          )}

          {isSupervisor && (
            <TabsContent value="attendance">
              <AttendanceExportTab />
            </TabsContent>
          )}

          {isSupervisor && (
            <TabsContent value="productivity">
              <ProductivityReportsTab />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="system">
              <SystemTab
                systemSettings={systemSettings}
                setSystemSettings={setSystemSettings}
                onSave={handleSaveSystemSettings}
              />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
          )}

          {isSupervisor && (
            <TabsContent value="print">
              <PrintTemplateTab />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="data">
              <DataManagementTab />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="integrations">
              <IntegrationsTab
                integrationSettings={integrationSettings}
                setIntegrationSettings={setIntegrationSettings}
                onConnectSupabase={handleConnectSupabase}
                onConnectStripe={handleConnectStripe}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}