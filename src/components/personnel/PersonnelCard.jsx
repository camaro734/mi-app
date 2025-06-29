import React from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PersonnelCard = ({ person, index, user, onEdit, onDelete }) => {
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Jefe de Taller';
      case 'technician': return 'Técnico';
      default: return 'Usuario';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Vacaciones': return 'bg-blue-100 text-blue-800';
      case 'Baja médica': return 'bg-red-100 text-red-800';
      case 'Inactivo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={person.avatar} alt={person.name} />
                <AvatarFallback>
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{person.name}</CardTitle>
                <CardDescription>{person.department}</CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={getStatusColor(person.status)}>
                {person.status}
              </Badge>
              <Badge className={getRoleColor(person.role)}>
                {getRoleLabel(person.role)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <span>{person.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{person.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>{person.location}</span>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Horas Trabajadas</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{person.workingHours.today}h</div>
                <div className="text-gray-600">Hoy</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{person.workingHours.week}h</div>
                <div className="text-gray-600">Semana</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{person.workingHours.month}h</div>
                <div className="text-gray-600">Mes</div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h4 className="font-medium text-sm mb-2">Especialidades</h4>
            <div className="flex flex-wrap gap-1">
              {person.specialties.map((specialty, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="font-medium text-sm mb-2">Certificaciones</h4>
            <div className="flex flex-wrap gap-1">
              {person.certifications.map((cert, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700">
                  <Shield className="h-3 w-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Última actividad: {person.lastActivity}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Desde: {person.joinDate}</span>
            </div>
          </div>

          {/* Actions */}
          {user?.role === 'admin' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit(person)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(person.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PersonnelCard;