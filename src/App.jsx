import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Home from '@/pages/Home';
import CameraPage from '@/pages/CameraPage';
import SearchPage from '@/pages/SearchPage';
import FoodDetail from '@/pages/FoodDetail';
import GuidePage from '@/pages/GuidePage';
import BottomNav from '@/components/BottomNav';

function App() {
  return (
    <Router>
      <Helmet>
        <title>BunnyFood - ¿Es seguro para tu conejo?</title>
        <meta name="description" content="Usa la cámara para identificar si un alimento es seguro para tu conejo. Base de datos completa de alimentos seguros y peligrosos." />
      </Helmet>
      <div className="min-h-screen bg-background max-w-lg mx-auto relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
