import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Camera, Search, BookOpen } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/camera', label: 'Cámara', icon: Camera },
  { path: '/search', label: 'Buscar', icon: Search },
  { path: '/guide', label: 'Guía', icon: BookOpen },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on camera page
  if (location.pathname === '/camera') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 bottom-nav">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[60px] ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
