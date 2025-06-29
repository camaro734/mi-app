import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Key, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserList = ({ 
  users, 
  currentUser, 
  onEdit, 
  onDelete, 
  onChangePassword 
}) => {
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Jefe de Taller';
      case 'technician': return 'Técnico';
      default: return 'Usuario';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-orange-100 text-orange-800';
      case 'technician': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-red-100 text-red-800';
      case 'Vacaciones': return 'bg-blue-100 text-blue-800';
      case 'Baja médica': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Teléfono:</span>
                  <p>{user.phone || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Ubicación:</span>
                  <p>{user.location || 'No especificada'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Último acceso:</span>
                  <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Creado:</span>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Specialties */}
              {user.specialties && user.specialties.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.specialties.slice(0, 3).map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {user.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.specialties.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onEdit(user)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChangePassword(user.id)}
                >
                  <Key className="h-4 w-4" />
                </Button>
                {user.id !== currentUser.id && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default UserList;