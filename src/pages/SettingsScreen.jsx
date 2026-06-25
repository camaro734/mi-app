import React from 'react';
import { Timer, Target, Info, RotateCcw } from 'lucide-react';
import { useStore } from '@/lib/store';

function Stepper({ value, onChange, min, max, step, unit }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 rounded-full bg-secondary text-lg leading-none active:scale-90 transition-transform"
      >−</button>
      <span className="w-16 text-center font-semibold tabular-nums">{value} {unit}</span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-8 h-8 rounded-full bg-secondary text-lg leading-none active:scale-90 transition-transform"
      >+</button>
    </div>
  );
}

export default function SettingsScreen() {
  const { state, setSettings, update } = useStore();
  const { frictionSeconds, dailyLimitMin } = state.settings;

  const reset = () => {
    if (confirm('¿Restablecer el prototipo a su estado inicial?')) {
      localStorage.removeItem('dosis.state.v1');
      location.reload();
    }
  };

  return (
    <div className="px-5 pt-12 pt-safe pb-28 space-y-6 fade-in">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <div className="card-soft divide-y divide-border">
        <div className="p-4 flex items-center gap-3">
          <Timer className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-sm">Pausa de fricción</div>
            <div className="text-xs text-muted-foreground">Segundos de respiración antes de abrir</div>
          </div>
          <Stepper value={frictionSeconds} onChange={(v) => setSettings({ frictionSeconds: v })} min={3} max={30} step={1} unit="s" />
        </div>
        <div className="p-4 flex items-center gap-3">
          <Target className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-sm">Objetivo diario</div>
            <div className="text-xs text-muted-foreground">Límite de dopamina barata al día</div>
          </div>
          <Stepper value={dailyLimitMin} onChange={(v) => setSettings({ dailyLimitMin: v })} min={15} max={240} step={15} unit="m" />
        </div>
      </div>

      <button onClick={reset} className="card-soft p-4 w-full flex items-center gap-3 text-rose-400">
        <RotateCcw className="w-5 h-5" />
        <span className="font-medium text-sm">Restablecer prototipo</span>
      </button>

      <div className="card-soft p-4 flex gap-3">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <b className="text-foreground">Dosis</b> — prototipo de flujo (PWA). El bloqueo mostrado es simulado.
          El bloqueo real requiere integración nativa: Screen Time API en iOS y UsageStatsManager /
          AccessibilityService en Android. Consulta <span className="text-foreground">PLAN.md</span> para la arquitectura.
        </p>
      </div>
    </div>
  );
}
