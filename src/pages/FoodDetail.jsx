import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Scale, Leaf, AlertTriangle, Shield, XCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFoodById, SAFETY_LEVELS, CATEGORIES } from '@/data/rabbitFoods';

const safetyConfig = {
  safe: {
    bgGradient: 'safe-gradient',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    icon: Shield,
    ringColor: 'ring-green-500',
  },
  caution: {
    bgGradient: 'caution-gradient',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    icon: AlertTriangle,
    ringColor: 'ring-amber-500',
  },
  dangerous: {
    bgGradient: 'danger-gradient',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: XCircle,
    ringColor: 'ring-red-500',
  },
};

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const found = getFoodById(id);
    if (found) {
      setFood(found);
    }
    const img = sessionStorage.getItem('capturedFoodImage');
    if (img) setCapturedImage(img);
  }, [id]);

  if (!food) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🤔</div>
          <p className="text-gray-600">Alimento no encontrado</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const safetyInfo = SAFETY_LEVELS[food.safety];
  const config = safetyConfig[food.safety];
  const SafetyIcon = config.icon;
  const categoryInfo = CATEGORIES[food.category];

  const handleShare = async () => {
    const text = `${safetyInfo.emoji} ${food.name}: ${safetyInfo.label} para conejos. ${food.description}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `BunnyFood - ${food.name}`, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className={`${config.bgGradient} text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-8xl">🐰</div>
        </div>

        {/* Navigation */}
        <div className="relative z-10 flex items-center justify-between p-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-8 pt-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4"
          >
            <span className="text-4xl">{safetyInfo.emoji}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
          >
            {food.name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {safetyInfo.label}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              {categoryInfo.emoji} {categoryInfo.label}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4 relative z-10 space-y-4 pb-8">
        {/* Captured image reference */}
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
          >
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Tu foto</p>
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-full h-40 object-cover rounded-xl"
            />
          </motion.div>
        )}

        {/* Main description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`bg-white rounded-2xl shadow-sm border ${config.borderColor} p-5`}
        >
          <div className="flex items-start gap-3">
            <SafetyIcon className={`w-6 h-6 ${config.textColor} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-bold ${config.textColor} mb-1`}>
                {food.safety === 'safe' ? '¡Es seguro!' : food.safety === 'caution' ? 'Precaución' : '¡Peligroso!'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{food.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
        >
          <h3 className="font-bold text-gray-800 mb-3">Detalles importantes</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{food.details}</p>
        </motion.div>

        {/* Frequency and Portion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Frecuencia</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{food.frequency}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Porción</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{food.portion}</p>
          </div>
        </motion.div>

        {/* Nutrients */}
        {food.nutrients && food.nutrients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-green-500" />
              <h3 className="font-bold text-gray-800">Nutrientes principales</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {food.nutrients.map((nutrient) => (
                <span
                  key={nutrient}
                  className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {nutrient}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Warning for dangerous foods */}
        {food.safety === 'dangerous' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-700 mb-1">Advertencia veterinaria</h3>
                <p className="text-red-600 text-sm leading-relaxed">
                  Si tu conejo ha ingerido este alimento, contacta inmediatamente con tu veterinario.
                  No intentes provocar el vómito.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-2"
        >
          <button
            onClick={() => navigate('/search')}
            className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-medium"
          >
            Buscar otro alimento
          </button>
        </motion.div>
      </div>

      {/* Bottom spacing */}
      <div className="h-24" />
    </div>
  );
}
