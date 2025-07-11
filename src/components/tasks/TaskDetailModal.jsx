import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  User, 
  CheckSquare, 
  Clock, 
  Flag, 
  Play, 
  Pause, 
  CheckCircle2,
  Edit3 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function TaskDetailModal({ task, onClose, onEdit }) {
  const { user } = useAuth();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'En progreso': return 'bg-blue-100 text-blue-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Pausado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En progreso': return <Play className="h-5 w-5" />;
      case 'Pendiente': return <Clock className="h-5 w-5" />;
      case 'Completado': return <CheckCircle2 className="h-5 w-5" />;
      case 'Pausado': return <Pause className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completado';
  const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Detalles de la Tarea
              </CardTitle>
              <div className="flex items-center space-x-2">
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onEdit}
                    className="flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Header con ID y badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {task.id}
                  </span>
                  <Badge className={getStatusColor(task.status)}>
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(task.status)}
                      <span>{task.status}</span>
                    </span>
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                </div>
                
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Vencida
                  </Badge>
                )}
              </div>

              {/* Título y descripción */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                <p className="text-gray-700 text-base leading-relaxed">{task.description}</p>
              </div>

              {/* Información principal en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de asignación */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Información de Asignación</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Responsable</p>
                        <p className="font-medium">{task.assignedTo}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CheckSquare className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Proyecto</p>
                        <p className="font-medium">{task.project}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información temporal */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Información Temporal</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Creación</p>
                        <p className="font-medium">
                          {new Date(task.createdAt).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Fecha Límite</p>
                        <div className="flex items-center space-x-2">
                          <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                            {new Date(task.dueDate).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {!isOverdue && task.status !== 'Completado' && (
                            <span className="text-sm text-gray-500">
                              ({daysUntilDue > 0 ? `${daysUntilDue} días restantes` : 'Vence hoy'})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progreso */}
              {task.status !== 'Completado' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900">Progreso de la Tarea</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progreso actual</span>
                      <span className="font-medium">{task.progress}% completado</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Etiquetas */}
              {task.tags && task.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Información del Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID de Tarea:</span>
                    <p className="font-medium">{task.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Creado el:</span>
                    <p className="font-medium">{new Date(task.createdAt).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado actual:</span>
                    <p className="font-medium">{task.status}</p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cerrar
                </Button>
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                  <Button 
                    onClick={onEdit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Tarea
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}