import React from 'react';
import { ChevronRight, Shield, AlertTriangle, XCircle } from 'lucide-react';
import { SAFETY_LEVELS, CATEGORIES } from '@/data/rabbitFoods';

const safetyStyles = {
  safe: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    icon: Shield,
  },
  caution: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    icon: AlertTriangle,
  },
  dangerous: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

export default function FoodCard({ food, onClick }) {
  const style = safetyStyles[food.safety];
  const safetyInfo = SAFETY_LEVELS[food.safety];
  const categoryInfo = CATEGORIES[food.category];
  const Icon = style.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full ${style.bg} border ${style.border} rounded-xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]`}
    >
      <div className={`w-12 h-12 rounded-xl ${style.badge} flex items-center justify-center flex-shrink-0`}>
        <span className="text-xl">{safetyInfo.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{food.name}</h3>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{food.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`${style.badge} text-xs px-2 py-0.5 rounded-full font-medium`}>
            {safetyInfo.label}
          </span>
          <span className="text-xs text-gray-400">
            {categoryInfo.emoji} {categoryInfo.label}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </button>
  );
}
