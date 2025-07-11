import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateTaskModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    assignedTo: '',
    project: '',
    dueDate: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.assignedTo.trim()) newErrors.assignedTo = 'El responsable es obligatorio';
    if (!formData.project.trim()) newErrors.project = 'El proyecto es obligatorio';
    if (!formData.dueDate) newErrors.dueDate = 'La fecha límite es obligatoria';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Procesar tags
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    onSubmit({
      ...formData,
      tags
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Nueva Tarea
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ingrese el título de la tarea"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describa detalladamente la tarea"
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Grid de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Pausado">Pausado</option>
                      <option value="Completado">Completado</option>
                    </select>
                  </div>

                  {/* Prioridad */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>

                  {/* Responsable */}
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Responsable *</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      placeholder="Nombre del responsable"
                      className={errors.assignedTo ? 'border-red-500' : ''}
                    />
                    {errors.assignedTo && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.assignedTo}
                      </p>
                    )}
                  </div>

                  {/* Proyecto */}
                  <div className="space-y-2">
                    <Label htmlFor="project">Proyecto *</Label>
                    <Input
                      id="project"
                      value={formData.project}
                      onChange={(e) => handleInputChange('project', e.target.value)}
                      placeholder="Nombre del proyecto"
                      className={errors.project ? 'border-red-500' : ''}
                    />
                    {errors.project && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.project}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fecha límite */}
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha Límite *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className={errors.dueDate ? 'border-red-500' : ''}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Etiquetas separadas por comas (ej: mantenimiento, urgente)"
                  />
                  <p className="text-xs text-gray-500">
                    Separe las etiquetas con comas para mejor organización
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Crear Tarea
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}