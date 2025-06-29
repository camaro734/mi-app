import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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

const TABS = [
  { value: 'company', label: 'Empresa', roles: ['admin', 'supervisor', 'technician'] },
  { value: 'vacations', label: 'Vacaciones', roles: ['admin', 'supervisor'] },
  { value: 'vacation-management', label: 'Días Personal', roles: ['admin', 'supervisor'] },
  { value: 'attendance', label: 'Fichadas', roles: ['admin', 'supervisor'] },
  { value: 'productivity', label: 'Productividad', roles: ['admin', 'supervisor'] },
  { value: 'system', label: 'Sistema', roles: ['admin'] },
  { value: 'users', label: 'Usuarios', roles: ['admin'] },
  { value: 'print', label: 'Impresión', roles: ['admin', 'supervisor'] },
  { value: 'data', label: 'Datos', roles: ['admin'] },
  { value: 'integrations', label: 'Integraciones', roles: ['admin'] },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('company');

  const availableTabs = TABS.filter(tab => tab.roles.includes(user?.role));
  const currentTabLabel = availableTabs.find(tab => tab.value === activeTab)?.label || 'Seleccionar';

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Mobile Dropdown */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {currentTabLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-2rem)]">
                {availableTabs.map(tab => (
                  <DropdownMenuItem key={tab.value} onSelect={() => setActiveTab(tab.value)}>
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Tabs */}
          <TabsList className="hidden sm:grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}>
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
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
