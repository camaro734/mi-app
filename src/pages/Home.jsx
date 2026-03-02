import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, BookOpen, Search, Heart, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStats } from '@/data/rabbitFoods';

export default function Home() {
  const navigate = useNavigate();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-amber-50">
      {/* Header */}
      <div className="safe-gradient text-white px-6 pt-12 pb-20 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 text-6xl">🐰</div>
          <div className="absolute bottom-8 left-4 text-4xl">🥕</div>
          <div className="absolute top-20 left-20 text-3xl">🥬</div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">🐰</span>
            <h1 className="text-2xl font-bold">BunnyFood</h1>
          </div>
          <p className="text-green-100 text-sm">
            Descubre si un alimento es seguro para tu conejo
          </p>
        </div>
      </div>

      {/* Main Actions */}
      <div className="px-6 -mt-12 space-y-4 relative z-20">
        {/* Camera Button - Main CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/camera')}
          className="w-full bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-green-100"
        >
          <div className="w-16 h-16 rounded-2xl safe-gradient flex items-center justify-center flex-shrink-0">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800 text-lg">Escanear alimento</h3>
            <p className="text-gray-500 text-sm">Usa la cámara para identificar si es seguro</p>
          </div>
        </motion.button>

        {/* Search Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/search')}
          className="w-full bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-green-100"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800 text-lg">Buscar alimento</h3>
            <p className="text-gray-500 text-sm">Escribe el nombre del alimento</p>
          </div>
        </motion.button>

        {/* Food Guide Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/guide')}
          className="w-full bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-green-100"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800 text-lg">Guía de alimentos</h3>
            <p className="text-gray-500 text-sm">Explora {stats.total} alimentos clasificados</p>
          </div>
        </motion.button>
      </div>

      {/* Stats Section */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Base de datos</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-700">{stats.safe}</div>
            <div className="text-xs text-green-600">Seguros</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-700">{stats.caution}</div>
            <div className="text-xs text-amber-600">Precaución</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <Heart className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-700">{stats.dangerous}</div>
            <div className="text-xs text-red-600">Peligrosos</div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="px-6 mt-8 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recuerda</h2>
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">🌾</span>
            <p className="text-sm text-gray-600">
              <strong>80% heno</strong> - La base de la dieta de tu conejo debe ser heno de Timothy ilimitado
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🥬</span>
            <p className="text-sm text-gray-600">
              <strong>15% verduras</strong> - Variedad de verduras frescas cada día
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🍎</span>
            <p className="text-sm text-gray-600">
              <strong>5% premios</strong> - Frutas y snacks solo como premio ocasional
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">💧</span>
            <p className="text-sm text-gray-600">
              <strong>Agua fresca</strong> - Siempre disponible, limpia y fresca
            </p>
          </div>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-24" />
    </div>
  );
}
