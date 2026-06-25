import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SEED_APPS } from '@/data/apps';

const KEY = 'dosis.state.v1';

const DEFAULT_STATE = {
  onboarded: false,
  // Ajustes del usuario
  settings: {
    frictionSeconds: 10,   // pausa de intención antes de abrir una app dopamina
    dailyLimitMin: 60,     // objetivo de minutos/día de dopamina barata
  },
  // id -> true si está bloqueada/dosificada. Por defecto, todo lo 'dopamine'.
  blocked: Object.fromEntries(
    SEED_APPS.map((a) => [a.id, a.category === 'dopamine'])
  ),
  focus: { active: false, endsAt: null, durationMin: 25 },
  streakDays: 3,
  savedMinutes: 0, // minutos "rescatados" acumulados (demo)
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...parsed.settings } };
  } catch {
    return DEFAULT_STATE;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const update = useCallback((patch) => {
    setState((s) => (typeof patch === 'function' ? patch(s) : { ...s, ...patch }));
  }, []);

  const toggleBlock = useCallback((id) => {
    setState((s) => ({ ...s, blocked: { ...s.blocked, [id]: !s.blocked[id] } }));
  }, []);

  const setSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const startFocus = useCallback((durationMin) => {
    setState((s) => ({
      ...s,
      focus: { active: true, durationMin, endsAt: Date.now() + durationMin * 60_000 },
    }));
  }, []);

  const stopFocus = useCallback((completed) => {
    setState((s) => ({
      ...s,
      focus: { ...s.focus, active: false, endsAt: null },
      savedMinutes: completed ? s.savedMinutes + s.focus.durationMin : s.savedMinutes,
    }));
  }, []);

  const completeOnboarding = useCallback(() => setState((s) => ({ ...s, onboarded: true })), []);

  const value = { state, update, toggleBlock, setSettings, startFocus, stopFocus, completeOnboarding };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
