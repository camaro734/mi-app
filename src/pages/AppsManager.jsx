import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SEED_APPS, CATEGORY_META } from '@/data/apps';
import { cn } from '@/lib/utils';

function AppRow({ app, blocked, onToggle }) {
  const meta = CATEGORY_META[app.category];
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="text-2xl w-9 text-center">{app.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{app.name}</div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={cn('w-1.5 h-1.5 rounded-full', meta.dot)} />
          <span>{app.note}</span>
          <span>· {app.minutesToday} min hoy</span>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={blocked}
        onClick={() => onToggle(app.id)}
        className={cn(
          'relative w-12 h-7 rounded-full transition-colors shrink-0',
          blocked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform',
            blocked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );
}

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'dopamine', label: 'Dopamina' },
  { key: 'neutral', label: 'Depende' },
  { key: 'productive', label: 'Productiva' },
];

export default function AppsManager() {
  const { state, toggleBlock } = useStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const apps = useMemo(() => {
    return SEED_APPS.filter(
      (a) =>
        (filter === 'all' || a.category === filter) &&
        a.name.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, filter]);

  const blockedCount = SEED_APPS.filter((a) => state.blocked[a.id]).length;

  return (
    <div className="px-5 pt-12 pt-safe pb-28 space-y-5 fade-in">
      <header>
        <h1 className="text-2xl font-bold">Apps</h1>
        <p className="text-sm text-muted-foreground">
          {blockedCount} dosificadas · activa el interruptor para incluir una app en el filtro
        </p>
      </header>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar app…"
          className="w-full bg-secondary rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
              filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card-soft px-4 divide-y divide-border">
        {apps.map((app) => (
          <AppRow key={app.id} app={app} blocked={!!state.blocked[app.id]} onToggle={toggleBlock} />
        ))}
        {apps.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados</p>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground px-1 leading-relaxed">
        Prototipo: en producción esta lista se rellena con tus apps reales vía la API de Screen Time (iOS).
        El bloqueo efectivo lo aplica el sistema operativo.
      </p>
    </div>
  );
}
