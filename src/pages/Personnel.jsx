import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import PersonnelHeader from '@/components/personnel/PersonnelHeader';
import PersonnelStats from '@/components/personnel/PersonnelStats';
import PersonnelFilters from '@/components/personnel/PersonnelFilters';
import PersonnelCard from '@/components/personnel/PersonnelCard';
import PersonnelForm from '@/components/personnel/PersonnelForm';

export default function Personnel() {
  const { user } = useAuth();
  const { personnel, setPersonnel, users, addUser, updateUser, deleteUser, setUsers } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || person.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddPersonnel = () => {
    setEditingPerson(null);
    setShowForm(true);
  };

  const handleEditPersonnel = (person) => {
    setEditingPerson(person);
    setShowForm(true);
  };

  const handleDeletePersonnel = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado y usuario?')) {
      const personToDelete = personnel.find(p => p.id === id);
      
      // Eliminar empleado
      setPersonnel(prev => prev.filter(p => p.id !== id));
      
      // Eliminar usuario correspondiente
      if (personToDelete) {
        setUsers(prev => prev.filter(u => u.email !== personToDelete.email));
      }
      
      toast({
        title: "Empleado eliminado",
        description: "El empleado y usuario han sido eliminados correctamente.",
      });
    }
  };

  const handleSavePersonnel = (personnelData) => {
    // Verificar email único
    const emailExists = personnel.some(person => 
      person.email === personnelData.email && person.id !== editingPerson?.id
    );
    
    if (emailExists) {
      toast({
        title: "Error",
        description: "Ya existe un empleado con este email.",
        variant: "destructive"
      });
      return;
    }

    if (editingPerson) {
      // Editar empleado existente
      setPersonnel(prev => prev.map(p => 
        p.id === editingPerson.id ? personnelData : p
      ));

      // Actualizar usuario correspondiente
      const userData = {
        name: personnelData.name,
        email: personnelData.email,
        role: personnelData.role,
        avatar: personnelData.avatar,
        status: personnelData.status,
        phone: personnelData.phone,
        location: personnelData.location
      };

      setUsers(prev => {
        const existingUser = prev.find(u => u.email === editingPerson.email);
        if (existingUser) {
          return prev.map(u => u.id === existingUser.id ? { ...u, ...userData } : u);
        } else {
          // Crear usuario si no existe
          const newUser = {
            ...userData,
            id: personnelData.id,
            password: 'temp123', // Contraseña temporal
            createdAt: new Date().toISOString(),
            lastLogin: null
          };
          return [...prev, newUser];
        }
      });

      toast({
        title: "Empleado actualizado",
        description: "Los datos del empleado y usuario han sido actualizados correctamente.",
      });
    } else {
      // Añadir nuevo empleado
      setPersonnel(prev => [...prev, personnelData]);

      // Crear usuario correspondiente
      const newUser = {
        id: personnelData.id,
        name: personnelData.name,
        email: personnelData.email,
        password: 'temp123', // Contraseña temporal
        role: personnelData.role,
        avatar: personnelData.avatar,
        status: personnelData.status,
        phone: personnelData.phone,
        location: personnelData.location,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      setUsers(prev => [...prev, newUser]);

      toast({
        title: "Empleado creado",
        description: "El nuevo empleado y usuario han sido añadidos correctamente. Contraseña temporal: temp123",
      });
    }
    
    setShowForm(false);
    setEditingPerson(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPerson(null);
  };

  const handleFilter = () => {
    toast({
      title: "Filtros aplicados",
      description: "Los filtros se han aplicado correctamente.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Personal - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de personal técnico, fichajes y control de presencia en CMG HIDRÁULICA S.L." />
      </Helmet>

      <div className="space-y-6">
        <PersonnelHeader user={user} onAddPersonnel={handleAddPersonnel} />
        
        <PersonnelStats personnel={personnel} />

        <PersonnelFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onFilter={handleFilter}
        />

        {/* Personnel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPersonnel.map((person, index) => (
            <PersonnelCard
              key={person.id}
              person={person}
              index={index}
              user={user}
              onEdit={handleEditPersonnel}
              onDelete={handleDeletePersonnel}
            />
          ))}
        </div>

        {filteredPersonnel.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron empleados
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda o añadir un nuevo empleado.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Personnel Form Modal */}
        {showForm && (
          <PersonnelForm
            person={editingPerson}
            onSave={handleSavePersonnel}
            onCancel={handleCancelForm}
          />
        )}
      </div>
    </>
  );
}