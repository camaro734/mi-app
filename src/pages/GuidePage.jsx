import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rabbitFoods, SAFETY_LEVELS, CATEGORIES } from '@/data/rabbitFoods';
import FoodCard from '@/components/FoodCard';

export default function GuidePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSafety, setActiveSafety] = useState('all');

  const filteredFoods = rabbitFoods.filter((food) => {
    const matchCategory = activeCategory === 'all' || food.category === activeCategory;
    const matchSafety = activeSafety === 'all' || food.safety === activeSafety;
    return matchCategory && matchSafety;
  });

  const categoryTabs = [
    { key: 'all', label: 'Todos', emoji: '📋' },
    ...Object.entries(CATEGORIES).map(([key, val]) => ({
      key,
      label: val.label,
      emoji: val.emoji,
    })),
  ];

  const safetyFilters = [
    { key: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-700' },
    { key: 'safe', label: '✅ Seguros', color: 'bg-green-100 text-green-700' },
    { key: 'caution', label: '⚠️ Precaución', color: 'bg-amber-100 text-amber-700' },
    { key: 'dangerous', label: '🚫 Peligrosos', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="flex-shrink-0">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Guía de alimentos</h1>
            <p className="text-xs text-gray-500">{filteredFoods.length} alimentos</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-4 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === tab.key
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safety filter */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {safetyFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveSafety(filter.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  activeSafety === filter.key
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 ' + filter.color
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food list */}
      <div className="p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredFoods.map((food, i) => (
            <motion.div
              key={food.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <FoodCard food={food} onClick={() => navigate(`/food/${food.id}`)} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-600">No hay alimentos con estos filtros</p>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-24" />
    </div>
  );
}
