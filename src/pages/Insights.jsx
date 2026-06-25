import React, { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { SEED_APPS, CATEGORY_META } from '@/data/apps';
import { cn } from '@/lib/utils';

const WEEK = [
  { d: 'L', min: 142 },
  { d: 'M', min: 118 },
  { d: 'X', min: 96 },
  { d: 'J', min: 130 },
  { d: 'V', min: 88 },
  { d: 'S', min: 74 },
  { d: 'D', min: 61 },
];

export default function Insights() {
  const { state } = useStore();

  const byCat = useMemo(() => {
    const acc = { dopamine: 0, neutral: 0, productive: 0 };
    SEED_APPS.forEach((a) => { acc[a.category] += a.minutesToday; });
    return acc;
  }, []);
  const total = byCat.dopamine + byCat.neutral + byCat.productive;
  const maxWeek = Math.max(...WEEK.map((w) => w.min));

  const top = [...SEED_APPS].sort((a, b) => b.minutesToday - a.minutesToday).slice(0, 5);

  return (
    <div className="px-5 pt-12 pt-safe pb-28 space-y-6 fade-in">
      <header>
        <h1 className="text-2xl font-bold">Datos</h1>
        <p className="text-sm text-muted-foreground">Honestos, sin adornos. {total} min de pantalla hoy.</p>
      </header>

      <div className="card-soft p-5">
        <h2 className="font-semibold mb-4 text-sm">Dopamina barata · esta semana</h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {WEEK.map((w) => (
            <div key={w.d} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end h-24">
                <div
                  className="w-full rounded-t-md bg-primary/70"
                  style={{ height: `${(w.min / maxWeek) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">{w.d}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-emerald-400 mt-3">↓ 57% de lunes a domingo</p>
      </div>

      <div className="card-soft p-5">
        <h2 className="font-semibold mb-4 text-sm">Reparto de hoy</h2>
        <div className="flex h-3 rounded-full overflow-hidden mb-4">
          {['dopamine', 'neutral', 'productive'].map((c) => (
            <div key={c} className={cn('h-full', CATEGORY_META[c].dot)} style={{ width: `${(byCat[c] / total) * 100}%` }} />
          ))}
        </div>
        <div className="space-y-2">
          {['dopamine', 'neutral', 'productive'].map((c) => (
            <div key={c} className="flex items-center gap-2 text-sm">
              <span className={cn('w-2.5 h-2.5 rounded-full', CATEGORY_META[c].dot)} />
              <span className="flex-1">{CATEGORY_META[c].label}</span>
              <span className="text-muted-foreground tabular-nums">{byCat[c]} min</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-soft p-5">
        <h2 className="font-semibold mb-4 text-sm">Top apps hoy</h2>
        <div className="space-y-3">
          {top.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <span className="text-xl w-7 text-center">{a.emoji}</span>
              <span className="flex-1 text-sm">{a.name}</span>
              <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                <div className={cn('h-full', CATEGORY_META[a.category].dot)} style={{ width: `${(a.minutesToday / top[0].minutesToday) * 100}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right tabular-nums">{a.minutesToday}m</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground px-1">
        Datos simulados en el prototipo. En producción provienen de DeviceActivity (iOS) / UsageStatsManager (Android).
      </p>
    </div>
  );
}
