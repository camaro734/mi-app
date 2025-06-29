import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ChartsSection = ({ monthlyData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Activity Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Actividad Mensual</CardTitle>
            <CardDescription>
              Partes de trabajo completados por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                    style={{ 
                      height: `${(data.workOrders / 20) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  <p className="text-xs font-medium">{data.workOrders}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
            <CardDescription>
              Facturación estimada por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600"
                    style={{ 
                      height: `${(data.revenue / 25000) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                  <p className="text-xs font-medium">{(data.revenue / 1000).toFixed(0)}k€</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChartsSection;