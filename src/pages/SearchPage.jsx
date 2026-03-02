import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchFoods, SAFETY_LEVELS, CATEGORIES } from '@/data/rabbitFoods';
import FoodCard from '@/components/FoodCard';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromCamera = searchParams.get('from') === 'camera';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (fromCamera) {
      const img = sessionStorage.getItem('capturedFoodImage');
      if (img) setCapturedImage(img);
    }
    // Auto-focus search input
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [fromCamera]);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchFoods(query));
    } else {
      setResults([]);
    }
  }, [query]);

  const popularSearches = [
    'zanahoria', 'lechuga', 'manzana', 'pepino', 'plátano',
    'espinaca', 'tomate', 'fresa', 'perejil', 'brócoli',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="flex-shrink-0">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué alimento quieres verificar?"
              className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Captured Image Reference */}
      {capturedImage && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Foto capturada</p>
              <p className="text-xs text-gray-500">Busca el alimento que ves en la foto</p>
            </div>
            <button
              onClick={() => {
                setCapturedImage(null);
                sessionStorage.removeItem('capturedFoodImage');
              }}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Results */}
        {query.trim().length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
            </p>
            {results.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {results.map((food, i) => (
                    <motion.div
                      key={food.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <FoodCard food={food} onClick={() => navigate(`/food/${food.id}`)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 font-medium">No encontramos ese alimento</p>
                <p className="text-gray-400 text-sm mt-2">
                  Intenta con otro nombre o revisa la guía completa
                </p>
                <button
                  onClick={() => navigate('/guide')}
                  className="mt-4 bg-green-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium"
                >
                  Ver guía completa
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Quick camera access */}
            {!fromCamera && (
              <button
                onClick={() => navigate('/camera')}
                className="w-full bg-white rounded-xl border border-green-200 p-4 flex items-center gap-3 mb-6"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">Usar la cámara</p>
                  <p className="text-xs text-gray-500">Toma una foto del alimento</p>
                </div>
              </button>
            )}

            {/* Popular searches */}
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Búsquedas populares
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Safety legend */}
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-8 mb-3">
              Niveles de seguridad
            </h3>
            <div className="space-y-2">
              {Object.entries(SAFETY_LEVELS).map(([key, level]) => (
                <div key={key} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <span className="text-2xl">{level.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{level.label}</p>
                    <p className="text-xs text-gray-500">{level.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-24" />
    </div>
  );
}
