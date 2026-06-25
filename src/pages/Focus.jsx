import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SEED_APPS } from '@/data/apps';

const DURATIONS = [15, 25, 50, 90];

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function Focus() {
  const { state, startFocus, stopFocus } = useStore();
  const navigate = useNavigate();
  const [pick, setPick] = useState(25);
  const [now, setNow] = useState(() => Date.now());

  const { active, endsAt } = state.focus;

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => {
    if (active && endsAt && now >= endsAt) stopFocus(true);
  }, [active, endsAt, now, stopFocus]);

  const blockedApps = SEED_APPS.filter((a) => state.blocked[a.id]);

  if (active) {
    const left = endsAt - now;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-7 text-center relative">
        <button
          onClick={() => stopFocus(false)}
          className="absolute top-12 right-6 w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <motion.div className="w-44 h-44 rounded-full bg-primary/20 breathe flex items-center justify-center mb-10">
          <div className="w-32 h-32 rounded-full bg-primary/30 flex items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        <div className="text-6xl font-bold tabular-nums mb-2">{fmt(left)}</div>
        <p className="text-muted-foreground mb-10">Modo Foco activo · {blockedApps.length} apps escudadas</p>

        <div className="flex flex-wrap justify-center gap-2 max-w-xs opacity-60">
          {blockedApps.map((a) => (
            <div key={a.id} className="text-2xl grayscale">{a.emoji}</div>
          ))}
        </div>

        <button
          onClick={() => stopFocus(false)}
          className="mt-12 text-sm text-muted-foreground underline"
        >
          Terminar antes
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pt-safe pb-28 space-y-6 fade-in">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modo Foco</h1>
        <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </header>

      <p className="text-muted-foreground text-sm">
        Durante una sesión de foco se bloquean todas las apps dosificadas. Elige cuánto tiempo.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => setPick(d)}
            className={`card-soft py-6 text-center transition-all active:scale-[0.98] ${
              pick === d ? 'bg-primary/15 border-primary' : ''
            }`}
          >
            <div className="text-3xl font-bold">{d}</div>
            <div className="text-xs text-muted-foreground">minutos</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => startFocus(pick)}
        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
      >
        Empezar {pick} min de foco
      </button>

      <div className="card-soft p-4">
        <p className="text-xs text-muted-foreground mb-3">Se bloquearán {blockedApps.length} apps:</p>
        <div className="flex flex-wrap gap-2">
          {blockedApps.map((a) => (
            <span key={a.id} className="text-xl">{a.emoji}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
