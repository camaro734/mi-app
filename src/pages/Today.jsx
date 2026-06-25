import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Flame, Clock, Sparkles, PlayCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SEED_APPS } from '@/data/apps';
import FrictionScreen from '@/components/FrictionScreen';

function Ring({ value, max, label, sub }) {
  const pct = Math.min(1, value / max);
  const r = 54;
  const c = 2 * Math.PI * r;
  const over = value > max;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={over ? 'hsl(var(--dopamine))' : 'hsl(var(--primary))'}
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
        {sub && <div className={`text-[11px] mt-0.5 ${over ? 'text-rose-400' : 'text-emerald-400'}`}>{sub}</div>}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="card-soft p-4 flex-1">
      <Icon className="w-5 h-5 text-primary mb-2" strokeWidth={1.8} />
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

export default function Today() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [demoApp, setDemoApp] = useState(null);

  const dopamineMin = useMemo(
    () =>
      SEED_APPS.filter((a) => a.category === 'dopamine' && state.blocked[a.id])
        .reduce((s, a) => s + a.minutesToday, 0),
    [state.blocked]
  );
  const tiktok = SEED_APPS.find((a) => a.id === 'tiktok');

  return (
    <div className="px-5 pt-12 pt-safe pb-28 space-y-6 fade-in">
      <header>
        <p className="text-muted-foreground text-sm">Buenos días</p>
        <h1 className="text-2xl font-bold">Tu dosis de hoy</h1>
      </header>

      <div className="card-soft p-6 flex flex-col items-center">
        <Ring
          value={dopamineMin}
          max={state.settings.dailyLimitMin}
          label={`/ ${state.settings.dailyLimitMin} min objetivo`}
          sub={dopamineMin > state.settings.dailyLimitMin ? 'objetivo superado' : 'dentro del límite'}
        />
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Minutos en apps de dopamina barata dosificadas
        </p>
      </div>

      <button
        onClick={() => navigate('/focus')}
        className="w-full card-soft p-5 flex items-center gap-4 active:scale-[0.99] transition-transform bg-primary/10 border-primary/30"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <Play className="w-6 h-6 text-primary-foreground fill-current" />
        </div>
        <div className="text-left">
          <div className="font-semibold">Iniciar Modo Foco</div>
          <div className="text-xs text-muted-foreground">Bloquea lo dosificado durante un rato</div>
        </div>
      </button>

      <div className="flex gap-3">
        <Stat icon={Flame} value={`${state.streakDays} días`} label="Racha sin recaídas" />
        <Stat icon={Clock} value={`${state.savedMinutes} min`} label="Rescatados (foco)" />
      </div>

      <div className="card-soft p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Prueba la fricción</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Así se siente cuando intentas abrir una app dosificada. Es la mecánica central anti-dopamina.
        </p>
        <button
          onClick={() => setDemoApp(tiktok)}
          className="w-full py-3 rounded-xl bg-secondary font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <PlayCircle className="w-5 h-5" />
          Simular abrir {tiktok.name}
        </button>
      </div>

      {demoApp && (
        <FrictionScreen
          app={demoApp}
          onClose={() => setDemoApp(null)}
          onContinue={() => setDemoApp(null)}
        />
      )}
    </div>
  );
}
