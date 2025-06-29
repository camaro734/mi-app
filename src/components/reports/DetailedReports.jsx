import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DetailedReports = ({ workOrders, personnel, materials }) => {
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'closed').length;
  const totalMaterialsValue = materials.reduce((sum, m) => sum + (m.stock * m.price), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Work Orders Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Resumen Partes de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Abiertos</span>
                <span className="font-medium text-blue-600">
                  {workOrders.filter(wo => wo.status === 'open').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En Curso</span>
                <span className="font-medium text-yellow-600">
                  {workOrders.filter(wo => wo.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cerrados</span>
                <span className="font-medium text-green-600">
                  {completedWorkOrders}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold">{workOrders.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personnel Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personnel.filter(p => p.active && p.role === 'tecnico').map((person) => (
                <div key={person.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{person.name}</p>
                    <p className="text-xs text-gray-500">Técnico</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">0 partes</p>
                    <p className="text-xs text-gray-500">0h trabajadas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Materials Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Estado del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Materiales</span>
                <span className="font-medium">{materials.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock Bajo</span>
                <span className="font-medium text-red-600">
                  {materials.filter(m => m.stock < 10).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor Total</span>
                <span className="font-medium text-green-600">
                  {totalMaterialsValue.toFixed(0)}€
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stock Total</span>
                  <span className="font-bold">
                    {materials.reduce((sum, m) => sum + m.stock, 0)} unidades
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DetailedReports;