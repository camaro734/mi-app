import React from 'react';

const VacationsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Vacaciones</h1>
        <p className="text-gray-600">Gestiona solicitudes de vacaciones y ausencias</p>
      </div>
    </div>
  );
};

export default VacationsHeader;