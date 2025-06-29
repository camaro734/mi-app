import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const AgendaFilters = ({ searchTerm, onSearchChange, viewMode, onViewModeChange }) => {
  const { toast } = useToast();

  const handleFilter = () => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, técnico o descripción..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('day')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'day' ? 'bg-white shadow' : ''}`}
              >
                Día
              </button>
              <button
                onClick={() => onViewModeChange('week')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'week' ? 'bg-white shadow' : ''}`}
              >
                Semana
              </button>
              <button
                onClick={() => onViewModeChange('month')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'month' ? 'bg-white shadow' : ''}`}
              >
                Mes
              </button>
            </div>
            
            <Button variant="outline" onClick={handleFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgendaFilters;
