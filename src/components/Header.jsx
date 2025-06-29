import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState(null);

  // Cargar logo de la empresa desde localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      try {
        const logoData = JSON.parse(savedLogo);
        setCompanyLogo(logoData.data);
      } catch (error) {
        console.error('Error al cargar logo:', error);
      }
    }
  }, []);

  // Escuchar cambios en el localStorage para actualizar el logo
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLogo = localStorage.getItem('companyLogo');
      if (savedLogo) {
        try {
          const logoData = JSON.parse(savedLogo);
          setCompanyLogo(logoData.data);
        } catch (error) {
          console.error('Error al cargar logo:', error);
        }
      } else {
        setCompanyLogo(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar cambios locales
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/ajustes');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y título de la empresa */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt="Logo de la empresa" 
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-white font-bold text-lg">C</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CMG HIDRÁULICA S.L.</h1>
            <p className="text-sm text-gray-500">Sistema de Gestión</p>
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}