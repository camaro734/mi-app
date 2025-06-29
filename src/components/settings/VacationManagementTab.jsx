import React, { useState, useEffect } from 'react';
import { Save, Calendar, Users, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const VacationManagementTab = () => {
  const { toast } = useToast();
  const { personnel, setPersonnel } = useData();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newVacationDays, setNewVacationDays] = useState('');

  const handleUpdateVacationDays = (employeeId, days) => {
    const updatedPersonnel = personnel.map(person => 
      person.id === employeeId 
        ? { ...person, vacationDays: parseInt(days) || 0 }
        : person
    );
    setPersonnel(updatedPersonnel);
    
    const employee = personnel.find(p => p.id === employeeId);
    toast({
      title: "Días de vacaciones actualizados",
      description: `${employee?.name} ahora tiene ${days} días de vacaciones asignados.`,
    });
    
    setEditingEmployee(null);
    setNewVacationDays('');
  };

  const handleStartEdit = (employee) => {
    setEditingEmployee(employee.id);
    setNewVacationDays(employee.vacationDays?.toString() || '22');
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setNewVacationDays('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-red-100 text-red-800';
      case 'Vacaciones': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'technician': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Jefe de Taller';
      case 'technician': return 'Técnico';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Gestión de Días de Vacaciones
          </CardTitle>
          <CardDescription>
            Asigna y gestiona los días de vacaciones disponibles para cada empleado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información general */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Información General
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Los días de vacaciones se asignan individualmente a cada empleado</p>
              <p>• Los cambios se aplican inmediatamente y afectan a las solicitudes futuras</p>
              <p>• El valor por defecto son 22 días anuales según la legislación española</p>
              <p>• Solo administradores pueden modificar estos valores</p>
            </div>
          </div>

          {/* Lista de empleados */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Personal y Días Asignados</h4>
            
            {personnel.length > 0 ? (
              <div className="space-y-3">
                {personnel.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-medium text-gray-900">{employee.name}</h5>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                        <Badge className={getRoleColor(employee.role)}>
                          {getRoleName(employee.role)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Email:</span> {employee.email}</p>
                        <p><span className="font-medium">Departamento:</span> {employee.department}</p>
                        <p><span className="font-medium">Fecha de contratación:</span> {employee.hireDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {editingEmployee === employee.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            value={newVacationDays}
                            onChange={(e) => setNewVacationDays(e.target.value)}
                            className="w-20 text-center"
                            placeholder="22"
                          />
                          <span className="text-sm text-gray-600">días</span>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateVacationDays(employee.id, newVacationDays)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {employee.vacationDays || 22}
                            </div>
                            <div className="text-xs text-gray-500">días anuales</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay personal registrado
                </h3>
                <p className="text-gray-600">
                  Añade empleados en la sección de Personal para gestionar sus días de vacaciones
                </p>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          {personnel.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Estadísticas del Personal</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{personnel.length}</div>
                  <div className="text-gray-600">Total empleados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {personnel.filter(p => p.status === 'Activo').length}
                  </div>
                  <div className="text-gray-600">Empleados activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(personnel.reduce((sum, p) => sum + (p.vacationDays || 22), 0) / personnel.length)}
                  </div>
                  <div className="text-gray-600">Días promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {personnel.reduce((sum, p) => sum + (p.vacationDays || 22), 0)}
                  </div>
                  <div className="text-gray-600">Total días asignados</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationManagementTab;