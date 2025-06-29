import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import UserForm from '@/components/settings/UserForm';
import UserList from '@/components/settings/UserList';
import PasswordChangeModal from '@/components/settings/PasswordChangeModal';

const UserManagementTab = () => {
  const { users, personnel, addUser, updateUser, deleteUser, changePassword, setPersonnel } = useData();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    // Buscar datos adicionales del personal si existen
    const personnelData = personnel.find(p => p.email === user.email);
    const combinedData = personnelData ? { ...user, ...personnelData } : user;
    
    setEditingUser(combinedData);
    setShowForm(true);
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      toast({
        title: "Error",
        description: "No puedes eliminar tu propio usuario.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario y empleado?')) {
      const userToDelete = users.find(u => u.id === userId);
      
      // Eliminar usuario
      deleteUser(userId);
      
      // Eliminar empleado correspondiente
      if (userToDelete) {
        setPersonnel(prev => prev.filter(p => p.email !== userToDelete.email));
      }
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario y empleado han sido eliminados correctamente.",
      });
    }
  };

  const handleChangePassword = (userId) => {
    setPasswordUserId(userId);
    setShowPasswordForm(true);
  };

  const handleSaveUser = (userData) => {
    // Verificar email único
    const emailExists = users.some(user => 
      user.email === userData.email && user.id !== editingUser?.id
    );
    
    if (emailExists) {
      toast({
        title: "Error",
        description: "Ya existe un usuario con este email.",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      // Actualizar usuario existente
      const updateData = {
        name: userData.name,
        email: userData.email,
        username: userData.username || userData.email.split('@')[0],
        role: userData.role,
        avatar: userData.avatar,
        status: userData.status,
        phone: userData.phone,
        location: userData.location
      };
      
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password;
      }
      
      updateUser(editingUser.id, updateData);

      // Actualizar empleado correspondiente
      const personnelData = {
        id: editingUser.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        avatar: userData.avatar,
        joinDate: userData.joinDate,
        department: userData.department,
        location: userData.location,
        specialties: userData.specialties || [],
        certifications: userData.certifications || [],
        workingHours: editingUser.workingHours || {
          today: 0,
          week: 0,
          month: 0
        },
        lastActivity: editingUser.lastActivity || new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setPersonnel(prev => {
        const existingIndex = prev.findIndex(p => p.id === editingUser.id);
        if (existingIndex >= 0) {
          return prev.map(p => p.id === editingUser.id ? personnelData : p);
        } else {
          return [...prev, personnelData];
        }
      });

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario y empleado han sido actualizados correctamente.",
      });
    } else {
      // Crear nuevo usuario
      const newUser = {
        ...userData,
        id: Date.now(),
        username: userData.username || userData.email.split('@')[0],
        createdAt: new Date().toISOString(),
        status: userData.status,
        lastLogin: null
      };

      // Añadir usuario a la lista de usuarios guardados
      const existingUsers = JSON.parse(localStorage.getItem('cmg_users') || '[]');
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('cmg_users', JSON.stringify(updatedUsers));

      addUser(newUser);

      // Crear empleado correspondiente
      const newPersonnel = {
        id: newUser.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        avatar: userData.avatar,
        joinDate: userData.joinDate,
        department: userData.department,
        location: userData.location,
        specialties: userData.specialties || [],
        certifications: userData.certifications || [],
        workingHours: {
          today: 0,
          week: 0,
          month: 0
        },
        lastActivity: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setPersonnel(prev => [...prev, newPersonnel]);

      toast({
        title: "Usuario creado",
        description: `El nuevo usuario y empleado han sido creados correctamente. Credenciales: Email: ${userData.email}, Contraseña: ${userData.password}`,
      });
    }
    
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSavePassword = (newPassword) => {
    changePassword(passwordUserId, newPassword);
    toast({
      title: "Contraseña cambiada",
      description: "La contraseña ha sido actualizada correctamente.",
    });
    
    setShowPasswordForm(false);
    setPasswordUserId(null);
  };

  // Solo admin puede gestionar usuarios
  if (currentUser?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-600">
            Solo los administradores pueden gestionar usuarios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios y Personal</h2>
          <p className="text-gray-600">Administra usuarios, empleados, roles y contraseñas de forma unificada</p>
        </div>
        <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario/Empleado
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 p-4 rounded-lg"
      >
        <div className="flex items-start">
          <Users className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Sistema de Acceso por Email y Contraseña</h4>
            <p className="text-sm text-blue-700 mt-1">
              El sistema utiliza email y contraseña para iniciar sesión. Los usuarios y empleados están sincronizados. 
              Al crear, editar o eliminar un usuario, se actualizará automáticamente la información del empleado correspondiente.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Users List */}
      <UserList
        users={filteredUsers}
        currentUser={currentUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onChangePassword={handleChangePassword}
      />

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <PasswordChangeModal
          onSave={handleSavePassword}
          onClose={() => {
            setShowPasswordForm(false);
            setPasswordUserId(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagementTab;