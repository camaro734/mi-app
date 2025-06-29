import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HistoryTab = ({ workOrder }) => {
  // Asegurar que history siempre sea un array
  const history = workOrder?.history || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Acciones</CardTitle>
        <CardDescription>
          Registro completo de todas las acciones realizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((entry, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium">{entry.action}</p>
                  <p className="text-sm text-gray-600">
                    {entry.user} • {entry.date}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay historial de acciones registrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryTab;