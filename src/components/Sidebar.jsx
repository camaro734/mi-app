import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Calendar, 
  Package, 
  Plane, 
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: Home, label: 'Inicio', path: '/', roles: ['admin', 'supervisor', 'technician'] },
  { icon: FileText, label: 'Partes de Trabajo', path: '/partes', roles: ['admin', 'supervisor', 'technician'] },
  { icon: Calendar, label: 'Agenda de Clientes', path: '/agenda', roles: ['admin', 'supervisor'] },
  { icon: Package, label: 'Materiales', path: '/materiales', roles: ['admin', 'supervisor', 'technician'] },
  { icon: Plane, label: 'Vacaciones', path: '/vacaciones', roles: ['admin', 'supervisor', 'technician'] },
  { icon: Settings, label: 'Ajustes', path: '/ajustes', roles: ['admin'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 lg:translate-x-0"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:hidden">
          <span className="text-lg font-semibold text-gray-900">Menú</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>CMG HIDRÁULICA S.L.</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}