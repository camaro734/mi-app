import React from 'react';

const SettingsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ajustes</h1>
        <p className="text-gray-600">Configura el sistema y gestiona la empresa</p>
      </div>
    </div>
  );
};

export default SettingsHeader;