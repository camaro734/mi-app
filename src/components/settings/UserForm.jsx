import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PersonalInfoSection from '@/components/settings/forms/PersonalInfoSection';
import CredentialsSection from '@/components/settings/forms/CredentialsSection';
import WorkInfoSection from '@/components/settings/forms/WorkInfoSection';
import SpecialtiesSection from '@/components/settings/forms/SpecialtiesSection';

const UserForm = ({ user = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || user?.email?.split('@')[0] || '',
    password: '',
    phone: user?.phone || '',
    role: user?.role || 'technician',
    status: user?.status || 'Activo',
    department: user?.department || 'Técnico',
    location: user?.location || 'Valencia',
    joinDate: user?.joinDate || new Date().toISOString().split('T')[0],
    specialties: user?.specialties || [],
    certifications: user?.certifications || [],
    avatar: user?.avatar || ''
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria para nuevos usuarios';
    } else if (formData.password.trim() && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      ...formData,
      id: user?.id || Date.now(),
      createdAt: user?.createdAt || new Date().toISOString(),
      lastLogin: user?.lastLogin || null,
      workingHours: user?.workingHours || {
        today: 0,
        week: 0,
        month: 0
      },
      lastActivity: user?.lastActivity || new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    onSave(userData);
  };

  const getDepartmentByRole = (role) => {
    switch (role) {
      case 'admin': return 'Administración';
      case 'supervisor': return 'Supervisión';
      case 'technician': return 'Técnico';
      default: return 'Técnico';
    }
  };

  // Actualizar departamento automáticamente cuando cambia el rol
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      department: getDepartmentByRole(prev.role)
    }));
  }, [formData.role]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {user ? 'Editar Usuario/Empleado' : 'Nuevo Usuario/Empleado'}
            </CardTitle>
            <CardDescription>
              {user ? 'Modifica los datos del usuario y empleado' : 'Completa la información del nuevo usuario y empleado'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <PersonalInfoSection
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
              />

              {/* Credenciales de Acceso */}
              <CredentialsSection
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                user={user}
              />

              {/* Información Laboral */}
              <WorkInfoSection
                formData={formData}
                handleInputChange={handleInputChange}
                getDepartmentByRole={getDepartmentByRole}
              />

              {/* Especialidades y Certificaciones */}
              <SpecialtiesSection
                formData={formData}
                newSpecialty={newSpecialty}
                setNewSpecialty={setNewSpecialty}
                addSpecialty={addSpecialty}
                removeSpecialty={removeSpecialty}
                newCertification={newCertification}
                setNewCertification={setNewCertification}
                addCertification={addCertification}
                removeCertification={removeCertification}
              />

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {user ? 'Actualizar' : 'Crear'} Usuario/Empleado
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UserForm;