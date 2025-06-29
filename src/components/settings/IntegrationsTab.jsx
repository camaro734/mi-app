import React from 'react';
import { Database, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const IntegrationsTab = ({ 
  integrationSettings, 
  setIntegrationSettings, 
  onConnectSupabase, 
  onConnectStripe 
}) => {
  return (
    <div className="space-y-6">
      {/* Supabase Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Supabase - Base de Datos
          </CardTitle>
          <CardDescription>
            Conecta con Supabase para persistencia de datos en la nube
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estado de conexión</p>
              <p className="text-sm text-gray-600">
                {integrationSettings.supabase.connected ? 'Conectado' : 'No conectado'}
              </p>
            </div>
            <Badge className={integrationSettings.supabase.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {integrationSettings.supabase.connected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          
          {!integrationSettings.supabase.connected && (
            <div className="space-y-3">
              <Input
                placeholder="URL de Supabase"
                value={integrationSettings.supabase.url}
                onChange={(e) => setIntegrationSettings({
                  ...integrationSettings,
                  supabase: {...integrationSettings.supabase, url: e.target.value}
                })}
              />
              <Input
                placeholder="Clave pública de Supabase"
                value={integrationSettings.supabase.key}
                onChange={(e) => setIntegrationSettings({
                  ...integrationSettings,
                  supabase: {...integrationSettings.supabase, key: e.target.value}
                })}
              />
            </div>
          )}
          
          <Button onClick={onConnectSupabase} className="bg-green-600 hover:bg-green-700">
            {integrationSettings.supabase.connected ? 'Desconectar' : 'Conectar'} Supabase
          </Button>
        </CardContent>
      </Card>

      {/* Stripe Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Stripe - Pagos
          </CardTitle>
          <CardDescription>
            Integra Stripe para procesamiento de pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estado de conexión</p>
              <p className="text-sm text-gray-600">
                {integrationSettings.stripe.connected ? 'Conectado' : 'No conectado'}
              </p>
            </div>
            <Badge className={integrationSettings.stripe.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {integrationSettings.stripe.connected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          
          {!integrationSettings.stripe.connected && (
            <div className="space-y-3">
              <Input
                placeholder="Clave pública de Stripe"
                value={integrationSettings.stripe.publishableKey}
                onChange={(e) => setIntegrationSettings({
                  ...integrationSettings,
                  stripe: {...integrationSettings.stripe, publishableKey: e.target.value}
                })}
              />
              <Input
                placeholder="Webhook Secret"
                value={integrationSettings.stripe.webhookSecret}
                onChange={(e) => setIntegrationSettings({
                  ...integrationSettings,
                  stripe: {...integrationSettings.stripe, webhookSecret: e.target.value}
                })}
              />
            </div>
          )}
          
          <Button onClick={onConnectStripe} className="bg-purple-600 hover:bg-purple-700">
            {integrationSettings.stripe.connected ? 'Desconectar' : 'Conectar'} Stripe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTab;