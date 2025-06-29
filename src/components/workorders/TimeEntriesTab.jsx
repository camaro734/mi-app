import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TimeEntriesTab = ({ workOrder }) => {
  // Asegurar que timeEntries siempre sea un array
  const timeEntries = workOrder?.timeEntries || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Fichajes</CardTitle>
        <CardDescription>
          Historial de entradas y salidas del trabajo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timeEntries.length > 0 ? (
            timeEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-sm text-gray-600">{entry.technician}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{entry.startTime} - {entry.endTime}</p>
                  <p className="text-sm text-gray-600">{entry.hours} horas</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay fichajes registrados aún</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntriesTab;