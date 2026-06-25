import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { StoreProvider, useStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import Onboarding from '@/pages/Onboarding';
import Today from '@/pages/Today';
import AppsManager from '@/pages/AppsManager';
import Focus from '@/pages/Focus';
import Insights from '@/pages/Insights';
import SettingsScreen from '@/pages/SettingsScreen';

function Shell() {
  const { state } = useStore();

  if (!state.onboarded) {
    return <Onboarding />;
  }

  const focusActive = state.focus.active;

  return (
    <>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/apps" element={<AppsManager />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!focusActive && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Helmet>
          <title>Dosis — dosifica la dopamina barata</title>
          <meta name="description" content="App de foco que filtra y dosifica el consumo pasivo: vídeo corto, feeds infinitos y scroll sin fin." />
        </Helmet>
        <div className="min-h-screen bg-background max-w-lg mx-auto relative">
          <Shell />
        </div>
      </Router>
    </StoreProvider>
  );
}
