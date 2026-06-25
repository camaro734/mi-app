import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shield, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { to: '/', icon: Home, label: 'Hoy', end: true },
  { to: '/apps', icon: Shield, label: 'Apps' },
  { to: '/insights', icon: BarChart3, label: 'Datos' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav fixed bottom-0 inset-x-0 z-40 max-w-lg mx-auto ios-blur border-t border-border">
      <div className="grid grid-cols-4">
        {ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
