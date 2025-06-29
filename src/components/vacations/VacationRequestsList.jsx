import React from 'react';
import { motion } from 'framer-motion';
import { User, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VacationRequestsList = ({ 
  allVacations, 
  hasPermission, 
  calculateDays, 
  onApprove, 
  onReject,
  getStatusColor,
  getStatusText,
  getStatusIcon
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          {hasPermission('personnel') ? 'Todas las Solicitudes' : 'Mis Solicitudes'}
        </CardTitle>
        <CardDescription>
          {hasPermission('personnel') 
            ? 'Gestiona las solicitudes de todo el personal'
            : 'Estado de tus solicitudes de vacaciones'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allVacations.length > 0 ? (
            allVacations.map((vacation, index) => {
              const StatusIcon = getStatusIcon(vacation.status);
              const days = calculateDays(vacation.start_date, vacation.end_date);
              
              return (
                <motion.div
                  key={vacation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-lg">{vacation.user_name}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
                        </span>
                      </div>
                      {days > 0 && (
                        <p className="text-sm text-blue-600 font-medium mt-1">
                          {days} {days === 1 ? 'día' : 'días'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(vacation.status)}`}>
                        {getStatusText(vacation.status)}
                      </span>
                    </div>
                  </div>
                  
                  {vacation.reason && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Motivo:</span>
                      <p className="text-sm text-gray-600 mt-1">{vacation.reason}</p>
                    </div>
                  )}
                  
                  {vacation.comments && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Comentarios:</span>
                      <p className="text-sm text-gray-600 mt-1">{vacation.comments}</p>
                    </div>
                  )}
                  
                  {hasPermission('personnel') && vacation.status === 'pending' && (
                    <div className="flex space-x-2 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        onClick={() => onApprove(vacation.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onReject(vacation.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {vacation.status === 'approved' && vacation.approved_at && (
                    <div className="text-xs text-green-600 mt-2 pt-2 border-t border-gray-100">
                      Aprobada el {formatDate(vacation.approved_at)}
                    </div>
                  )}

                  {vacation.status === 'rejected' && vacation.rejected_at && (
                    <div className="text-xs text-red-600 mt-2 pt-2 border-t border-gray-100">
                      Rechazada el {formatDate(vacation.rejected_at)}
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasPermission('personnel') 
                  ? 'No hay solicitudes de vacaciones'
                  : 'No tienes solicitudes de vacaciones'
                }
              </h3>
              <p className="text-gray-600">
                {hasPermission('personnel') 
                  ? 'Cuando el personal envíe solicitudes aparecerán aquí'
                  : 'Crea tu primera solicitud usando el formulario de arriba'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VacationRequestsList;