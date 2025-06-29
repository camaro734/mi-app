import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Users,
  Calendar,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import WorkOrderForm from '@/components/workorders/WorkOrderForm';

export default function WorkOrders() {
  const { user } = useAuth();
  const { workOrders, setWorkOrders } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'En curso': return 'bg-blue-100 text-blue-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Pendiente de Validación': return 'bg-orange-100 text-orange-800';
      case 'Validado': return 'bg-purple-100 text-purple-800';
      case 'Urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return 'bg-red-500 text-white';
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (worked, estimated) => {
    return Math.min((worked / estimated) * 100, 100);
  };

  const filteredWorkOrders = workOrders.filter(order => {
    const matchesSearch = order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Si es técnico, no mostrar partes cerrados (Completado, Pendiente de Validación, Validado) 
    // a menos que esté asignado y el parte haya sido reabierto por admin/supervisor
    if (user?.role === 'technician') {
      const closedStatuses = ['Completado', 'Pendiente de Validación', 'Validado'];
      const isAssigned = order.assignedTechnicians?.includes(user?.name);
      const isReopened = order.reopenedBy; // Campo que se añadiría cuando admin/supervisor reabra un parte
      
      if (closedStatuses.includes(order.status) && (!isAssigned || !isReopened)) {
        return false;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  const handleSaveWorkOrder = (workOrderData) => {
    setWorkOrders(prev => [...prev, workOrderData]);
    setShowCreateForm(false);
    
    toast({
      title: "Parte creado exitosamente",
      description: `El parte ${workOrderData.id} ha sido creado. Los técnicos podrán ficharse cuando inicien el trabajo.`,
    });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleFilter = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  if (showCreateForm) {
    return (
      <>
        <Helmet>
          <title>Nuevo Parte de Trabajo - CMG HIDRÁULICA S.L.</title>
          <meta name="description" content="Crear un nuevo parte de trabajo para reparación o mantenimiento de maquinaria." />
        </Helmet>
        
        <WorkOrderForm
          onSave={handleSaveWorkOrder}
          onCancel={handleCancelCreate}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Partes de Trabajo - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de partes de trabajo, reparaciones y mantenimientos de maquinaria hidráulica." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partes de Trabajo</h1>
            <p className="text-gray-600">Gestiona todos los partes de trabajo y reparaciones</p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Parte
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, máquina, ID o matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En curso">En curso</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Completado">Completado</option>
                  <option value="Pendiente de Validación">Pendiente de Validación</option>
                  <option value="Validado">Validado</option>
                </select>
                
                <Button variant="outline" onClick={handleFilter}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <CardDescription className="font-medium text-gray-700">
                        {order.client}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      {order.status === 'Pendiente de Validación' && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Validar
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Machine Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-sm">{order.machine}</p>
                    <p className="text-xs text-gray-600">
                      {order.brand} {order.model} • {order.plate}
                    </p>
                    <p className="text-xs text-gray-500">Serie: {order.serial}</p>
                  </div>

                  {/* Assigned Technicians */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-xs font-medium text-gray-500">Técnicos:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {order.assignedTechnicians && order.assignedTechnicians.length > 0 ? (
                        order.assignedTechnicians.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {tech}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin asignar</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Tipo:</span> {order.type}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">{order.description}</p>
                  </div>

                  {/* Work Description (if completed) */}
                  {order.workDescription && (
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <p className="text-xs font-medium text-green-800 mb-1">Trabajos realizados:</p>
                      <p className="text-xs text-green-700 line-clamp-2">{order.workDescription}</p>
                    </div>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progreso</span>
                      <span className="text-sm text-gray-600">
                        {order.workedHours}h / {order.estimatedHours}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          getProgressPercentage(order.workedHours, order.estimatedHours) > 100
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min(getProgressPercentage(order.workedHours, order.estimatedHours), 100)}%`
                        }}
                      />
                    </div>
                    {getProgressPercentage(order.workedHours, order.estimatedHours) > 100 && (
                      <div className="flex items-center mt-1 text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span className="text-xs">Tiempo estimado superado</span>
                      </div>
                    )}
                  </div>

                  {/* Validation Info */}
                  {order.validatedHours !== undefined && (
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <p className="text-xs font-medium text-purple-800">
                        Horas validadas: {order.validatedHours}h | Materiales: {order.validatedMaterials?.length || 0}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {order.dueDate}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/partes/${order.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                    </Link>
                    
                    {(user?.role === 'admin' || user?.role === 'supervisor' || 
                      (user?.role === 'technician' && order.assignedTechnicians?.includes(user?.name))) && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredWorkOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron partes de trabajo
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar los filtros de búsqueda o crear un nuevo parte de trabajo.
              </p>
              {(user?.role === 'admin' || user?.role === 'supervisor') && (
                <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Parte
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}