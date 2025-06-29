import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart3, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const KeyMetrics = ({ 
  totalWorkOrders, 
  completionRate, 
  activePersonnel, 
  totalMaterialsValue 
}) => {
  const metrics = [
    {
      title: 'Partes Totales',
      value: totalWorkOrders,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12% vs mes anterior',
      trendIcon: TrendingUp,
      trendColor: 'text-green-600'
    },
    {
      title: 'Tasa Finalización',
      value: `${completionRate.toFixed(1)}%`,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+5% vs mes anterior',
      trendIcon: TrendingUp,
      trendColor: 'text-green-600'
    },
    {
      title: 'Personal Activo',
      value: activePersonnel,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'Sin cambios',
      trendIcon: Users,
      trendColor: 'text-gray-600'
    },
    {
      title: 'Valor Inventario',
      value: `${totalMaterialsValue.toFixed(0)}€`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '-3% vs mes anterior',
      trendIcon: TrendingDown,
      trendColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (index + 1) * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className={`flex items-center text-sm ${metric.trendColor} mt-1`}>
                    <metric.trendIcon className="w-4 h-4 mr-1" />
                    {metric.trend}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default KeyMetrics;