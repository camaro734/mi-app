import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import VacationsHeader from '@/components/vacations/VacationsHeader';
import VacationStats from '@/components/vacations/VacationStats';
import VacationRequestForm from '@/components/vacations/VacationRequestForm';
import VacationsFilters from '@/components/vacations/VacationsFilters';
import VacationRequestsList from '@/components/vacations/VacationRequestsList';
import VacationCalendar from '@/components/vacations/VacationCalendar';

export default function Vacations() {
  const { user } = useAuth();
  const { vacations, addVacationRequest, updateVacationRequest } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newRequest, setNewRequest] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    comments: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const filteredRequests = vacations.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    // Si es técnico, solo mostrar sus propias solicitudes
    if (user?.role === 'technician') {
      return matchesSearch && matchesStatus && request.user_name === user?.name;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateRequest = () => {
    // Crear solicitud con fechas correctas
    const request = {
      start_date: newRequest.start_date || new Date().toISOString().split('T')[0],
      end_date: newRequest.end_date || new Date().toISOString().split('T')[0],
      reason: newRequest.reason || 'Sin especificar',
      comments: newRequest.comments || '',
      user_id: user.id,
      user_name: user.name,
      status: 'pending'
    };
    
    addVacationRequest(request);
    setNewRequest({
      start_date: '',
      end_date: '',
      reason: '',
      comments: ''
    });
    
    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud de vacaciones ha sido enviada para aprobación.",
    });
  };

  const handleApproveRequest = (requestId) => {
    updateVacationRequest(requestId, { 
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString()
    });
    
    toast({
      title: "Solicitud aprobada",
      description: "La solicitud de vacaciones ha sido aprobada.",
    });
  };

  const handleRejectRequest = (requestId) => {
    updateVacationRequest(requestId, { 
      status: 'rejected',
      rejected_by: user.id,
      rejected_at: new Date().toISOString()
    });
    
    toast({
      title: "Solicitud rechazada",
      description: "La solicitud de vacaciones ha sido rechazada.",
    });
  };

  const handleFilter = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Verificar que las fechas son válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const pendingRequests = filteredRequests.filter(v => v.status === 'pending');
  const approvedVacations = filteredRequests.filter(v => v.status === 'approved');

  // Si es administrador o supervisor, mostrar el calendario
  const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

  return (
    <>
      <Helmet>
        <title>Calendario de Vacaciones - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de solicitudes de vacaciones y calendario de ausencias del personal técnico." />
      </Helmet>

      <div className="space-y-6">
        <VacationsHeader />

        <VacationStats
          pendingRequests={pendingRequests}
          approvedVacations={approvedVacations}
          allVacations={filteredRequests}
          calculateDays={calculateDays}
        />

        {/* Mostrar calendario solo para admin/supervisor */}
        {isAdminOrSupervisor && (
          <VacationCalendar
            approvedVacations={approvedVacations}
            calculateDays={calculateDays}
          />
        )}

        <VacationRequestForm
          newRequest={newRequest}
          setNewRequest={setNewRequest}
          onSubmit={handleCreateRequest}
          calculateDays={calculateDays}
        />

        <VacationsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onFilter={handleFilter}
        />

        <VacationRequestsList
          allVacations={filteredRequests}
          hasPermission={(permission) => user?.role === 'admin' || user?.role === 'supervisor'}
          calculateDays={calculateDays}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          getStatusIcon={getStatusIcon}
        />
      </div>
    </>
  );
}