import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

/**
 * Pantalla de fricción / intención.
 * Es la mecánica central anti-dopamina: antes de abrir una app de consumo
 * pasivo, se interpone una pausa de respiración + una pregunta de propósito.
 * Estudios de "one sec" muestran ~30% menos aperturas solo con esta fricción.
 */
export default function FrictionScreen({ app, onClose, onContinue }) {
  const { state } = useStore();
  const total = state.settings.frictionSeconds;
  const [left, setLeft] = useState(total);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const ready = left <= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center px-8 text-center"
      >
        <div className="text-5xl mb-6">{app.emoji}</div>
        <p className="text-muted-foreground text-sm mb-1">Estás a punto de abrir</p>
        <h2 className="text-2xl font-semibold mb-8">{app.name}</h2>

        <div className="relative mb-8 flex items-center justify-center">
          <motion.div
            className="w-32 h-32 rounded-full bg-primary/20 breathe"
            aria-hidden
          />
          <div className="absolute text-4xl font-bold tabular-nums">
            {ready ? '✓' : left}
          </div>
        </div>

        <p className="text-base mb-4 max-w-xs">
          {ready ? '¿Para qué la abres ahora?' : 'Respira. Date un momento antes de entrar.'}
        </p>

        {ready && (
          <motion.input
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Mi intención es…"
            className="w-full max-w-xs bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary mb-6 text-center"
          />
        )}

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
          >
            Mejor lo dejo
          </button>
          <button
            onClick={() => onContinue(reason)}
            disabled={!ready}
            className="w-full py-3 rounded-xl text-muted-foreground text-sm disabled:opacity-40"
          >
            Continuar 5 min de todos modos
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
