import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PersonnelStats = ({ personnel }) => {
  const totalPersonnel = personnel.length;
  const activePersonnel = personnel.filter(p => p.status === 'Activo').length;
  const onVacation = personnel.filter(p => p.status === 'Vacaciones').length;
  const totalHoursToday = personnel.reduce((sum, p) => sum + p.workingHours.today, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalPersonnel}</div>
          <div className="text-sm text-gray-600">Total Empleados</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activePersonnel}</div>
          <div className="text-sm text-gray-600">Activos</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{onVacation}</div>
          <div className="text-sm text-gray-600">De Vacaciones</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalHoursToday}h</div>
          <div className="text-sm text-gray-600">Horas Hoy</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonnelStats;