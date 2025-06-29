import React from 'react';
import { Clock, CheckCircle, Calendar, Plane } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const VacationStats = ({ pendingRequests, approvedVacations, allVacations, calculateDays }) => {
  const totalDaysRequested = allVacations.reduce((sum, v) => sum + calculateDays(v.start_date, v.end_date), 0);
  const currentVacations = approvedVacations.filter(v => {
    const today = new Date();
    const start = new Date(v.start_date);
    const end = new Date(v.end_date);
    return today >= start && today <= end;
  }).length;

  const stats = [
    {
      title: 'Solicitudes Pendientes',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Vacaciones Aprobadas',
      value: approvedVacations.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Días Solicitados',
      value: totalDaysRequested,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Personal de Vacaciones',
      value: currentVacations,
      icon: Plane,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VacationStats;