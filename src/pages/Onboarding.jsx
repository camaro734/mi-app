import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Timer, BarChart3, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Dosifica la dopamina barata',
    body: 'Dosis filtra lo que te roba horas: vídeo corto, feeds infinitos, scroll sin fin. Tú decides qué se dosifica y qué no.',
  },
  {
    icon: Timer,
    title: 'Fricción antes del impulso',
    body: 'Antes de abrir una app de consumo pasivo, una pausa para respirar y recordar tu intención. Pequeña barrera, gran diferencia.',
  },
  {
    icon: BarChart3,
    title: 'Ve lo que recuperas',
    body: 'Mide tus minutos rescatados y tu racha. Sin gamificación adictiva: solo datos honestos.',
  },
];

export default function Onboarding() {
  const { completeOnboarding } = useStore();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const Icon = step.icon;
  const last = i === STEPS.length - 1;

  return (
    <div className="min-h-screen flex flex-col justify-between px-7 py-12 pt-safe">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mb-8">
            <Icon className="w-10 h-10 text-primary" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold mb-3 leading-tight">{step.title}</h1>
          <p className="text-muted-foreground max-w-sm leading-relaxed">{step.body}</p>
        </motion.div>
      </div>

      <div>
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`}
            />
          ))}
        </div>
        <button
          onClick={() => (last ? completeOnboarding() : setI((n) => n + 1))}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
        >
          {last ? 'Empezar' : 'Siguiente'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
