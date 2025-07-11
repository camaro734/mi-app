import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Clock, 
  User, 
  Calendar,
  MoreVertical,
  Edit3,
  Trash2,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    {
      id: 'TSK-001',
      title: 'Mantenimiento preventivo sistema hidráulico',
      description: 'Revisión completa del sistema hidráulico principal',
      status: 'En progreso',
      priority: 'Alta',
      assignedTo: 'Juan Pérez',
      project: 'Mantenimiento Q1',
      dueDate: '2024-01-15',
      createdAt: '2024-01-08',
      progress: 65,
      tags: ['mantenimiento', 'hidráulico']
    },
    {
      id: 'TSK-002',
      title: 'Actualización documentación técnica',
      description: 'Actualizar manuales de procedimientos internos',
      status: 'Pendiente',
      priority: 'Media',
      assignedTo: 'María González',
      project: 'Mejoras Internas',
      dueDate: '2024-01-20',
      createdAt: '2024-01-10',
      progress: 0,
      tags: ['documentación']
    },
    {
      id: 'TSK-003',
      title: 'Instalación nueva bomba cliente ABC',
      description: 'Instalación y configuración de bomba industrial',
      status: 'Completado',
      priority: 'Alta',
      assignedTo: 'Carlos Ruiz',
      project: 'Cliente ABC',
      dueDate: '2024-01-12',
      createdAt: '2024-01-05',
      progress: 100,
      tags: ['instalación', 'cliente']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.project.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completado').length;
    const inProgress = tasks.filter(t => t.status === 'En progreso').length;
    const pending = tasks.filter(t => t.status === 'Pendiente').length;
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completado').length;

    return { total, completed, inProgress, pending, overdue };
  }, [tasks]);

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
      case 'En progreso': return <Play className="h-4 w-4" />;
      case 'Pendiente': return <Clock className="h-4 w-4" />;
      case 'Completado': return <CheckCircle2 className="h-4 w-4" />;
      case 'Pausado': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateTask = (taskData) => {
    const newTask = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      ...taskData,
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0
    };
    setTasks([...tasks, newTask]);
    setShowCreateModal(false);
  };

  const handleEditTask = (taskData) => {
    setTasks(tasks.map(task => 
      task.id === selectedTask.id ? { ...task, ...taskData } : task
    ));
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  return (
    <>
      <Helmet>
        <title>Gestión de Tareas y Proyectos - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de tareas, proyectos y seguimiento de progreso en CMG HIDRÁULICA S.L." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tareas y Proyectos</h1>
            <p className="text-gray-600 mt-1">Gestiona tareas, proyectos y seguimiento de progreso</p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{taskStats.total}</p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En Progreso</p>
                    <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vencidas</p>
                    <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar tareas por título, descripción, responsable o proyecto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Completado">Completado</option>
                  </select>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Lista de Tareas</CardTitle>
              <CardDescription>
                {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''} encontrada{filteredTasks.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron tareas con los filtros aplicados</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium text-sm text-gray-600">{task.id}</span>
                            <Badge className={getStatusColor(task.status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(task.status)}
                                <span>{task.status}</span>
                              </span>
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {task.assignedTo}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString('es-ES')}
                            </div>
                            <div className="flex items-center">
                              <CheckSquare className="h-4 w-4 mr-1" />
                              {task.project}
                            </div>
                          </div>
                          
                          {task.status !== 'Completado' && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Progreso</span>
                                <span>{task.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {task.tags && task.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {task.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {(user?.role === 'admin' || user?.role === 'supervisor') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(task);
                              }}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modals */}
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateTask}
          />
        )}

        {showEditModal && selectedTask && (
          <EditTaskModal
            task={selectedTask}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTask(null);
            }}
            onSubmit={handleEditTask}
          />
        )}

        {showDetailModal && selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedTask(null);
            }}
            onEdit={() => {
              setShowDetailModal(false);
              setShowEditModal(true);
            }}
          />
        )}
      </div>
    </>
  );
}