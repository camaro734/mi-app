import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Send,
  Download,
  DollarSign,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export default function Budgets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Datos de ejemplo
  const budgets = [
    {
      id: 'PRES-2024-001',
      client: 'Construcciones García S.L.',
      machine: 'Excavadora CAT 320D',
      description: 'Reparación sistema hidráulico completo',
      amount: 2850.00,
      status: 'Enviado',
      createdDate: '2024-01-15',
      validUntil: '2024-02-15',
      technician: 'Miguel García',
      workOrderId: 'WO-2024-001',
      items: [
        { description: 'Mano de obra (8h)', quantity: 8, price: 45.00, total: 360.00 },
        { description: 'Filtro hidráulico HF6177', quantity: 2, price: 85.00, total: 170.00 },
        { description: 'Aceite hidráulico ISO 46 (20L)', quantity: 1, price: 120.00, total: 120.00 },
        { description: 'Junta tórica 50x3', quantity: 4, price: 12.50, total: 50.00 }
      ]
    },
    {
      id: 'PRES-2024-002',
      client: 'Transportes Martínez',
      machine: 'Grúa Liebherr LTM 1050',
      description: 'Mantenimiento preventivo completo',
      amount: 1250.00,
      status: 'Aceptado',
      createdDate: '2024-01-12',
      validUntil: '2024-02-12',
      technician: 'Carlos López',
      workOrderId: 'WO-2024-002',
      items: [
        { description: 'Mano de obra (4h)', quantity: 4, price: 45.00, total: 180.00 },
        { description: 'Kit filtros mantenimiento', quantity: 1, price: 150.00, total: 150.00 },
        { description: 'Aceites y lubricantes', quantity: 1, price: 80.00, total: 80.00 }
      ]
    },
    {
      id: 'PRES-2024-003',
      client: 'Obras Públicas Valencia',
      machine: 'Bulldozer Komatsu D65',
      description: 'Inspección técnica anual',
      amount: 450.00,
      status: 'Pendiente',
      createdDate: '2024-01-18',
      validUntil: '2024-02-18',
      technician: 'Ana Rodríguez',
      workOrderId: null,
      items: [
        { description: 'Inspección técnica completa', quantity: 1, price: 200.00, total: 200.00 },
        { description: 'Certificado ITV', quantity: 1, price: 50.00, total: 50.00 }
      ]
    },
    {
      id: 'PRES-2024-004',
      client: 'Industrias Pérez',
      machine: 'Retroexcavadora JCB 3CX',
      description: 'Reparación transmisión automática',
      amount: 4200.00,
      status: 'Rechazado',
      createdDate: '2024-01-10',
      validUntil: '2024-02-10',
      technician: 'Miguel García',
      workOrderId: null,
      items: [
        { description: 'Mano de obra (12h)', quantity: 12, price: 45.00, total: 540.00 },
        { description: 'Kit reparación transmisión', quantity: 1, price: 1800.00, total: 1800.00 },
        { description: 'Aceite transmisión (15L)', quantity: 1, price: 180.00, total: 180.00 }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Enviado': return 'bg-blue-100 text-blue-800';
      case 'Aceptado': return 'bg-green-100 text-green-800';
      case 'Rechazado': return 'bg-red-100 text-red-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Vencido': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleSendBudget = (budgetId) => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleDownloadBudget = (budgetId) => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleFilter = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const totalBudgets = budgets.length;
  const acceptedBudgets = budgets.filter(b => b.status === 'Aceptado').length;
  const pendingBudgets = budgets.filter(b => b.status === 'Pendiente').length;
  const totalAmount = budgets.filter(b => b.status === 'Aceptado').reduce((sum, b) => sum + b.amount, 0);

  return (
    <>
      <Helmet>
        <title>Presupuestos - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Gestión de presupuestos y cotizaciones para servicios de maquinaria hidráulica." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
            <p className="text-gray-600">Gestiona cotizaciones y presupuestos de servicios</p>
          </div>
          
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Presupuesto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalBudgets}</div>
              <div className="text-sm text-gray-600">Total Presupuestos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{acceptedBudgets}</div>
              <div className="text-sm text-gray-600">Aceptados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingBudgets}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">€{totalAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Valor Aceptado</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, máquina, ID o descripción..."
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
                  <option value="Enviado">Enviado</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
                
                <Button variant="outline" onClick={handleFilter}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budgets List */}
        <div className="space-y-4">
          {filteredBudgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.id}</CardTitle>
                      <CardDescription className="font-medium text-gray-700">
                        {budget.client}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(budget.status)}>
                      {budget.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Machine and Description */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-sm">{budget.machine}</p>
                    <p className="text-sm text-gray-600">{budget.description}</p>
                  </div>

                  {/* Amount and Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Importe</p>
                        <p className="font-bold text-lg text-green-600">
                          €{budget.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Válido hasta</p>
                        <p className="font-medium">{budget.validUntil}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Técnico</p>
                        <p className="font-medium">{budget.technician}</p>
                      </div>
                    </div>
                    
                    {budget.workOrderId && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Parte asociado</p>
                          <p className="font-medium">{budget.workOrderId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Conceptos ({budget.items.length} elementos)
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {budget.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span className="font-medium">€{item.total.toFixed(2)}</span>
                        </div>
                      ))}
                      {budget.items.length > 2 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{budget.items.length - 2} elementos más...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadBudget(budget.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    {budget.status === 'Pendiente' && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleSendBudget(budget.id)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBudgets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron presupuestos
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda o crear un nuevo presupuesto.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}