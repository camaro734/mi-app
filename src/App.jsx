import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetail from '@/pages/WorkOrderDetail';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import ClientAgenda from '@/pages/ClientAgenda';
import Materials from '@/pages/Materials';
import Vacations from '@/pages/Vacations';
import Settings from '@/pages/Settings';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Helmet>
            <title>CMG HIDRÁULICA S.L. - Sistema de Gestión</title>
            <meta name="description" content="Sistema interno de gestión de partes de trabajo, personal técnico y agenda de clientes para CMG HIDRÁULICA S.L." />
          </Helmet>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/partes" element={
                <ProtectedRoute>
                  <Layout>
                    <WorkOrders />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/partes/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <WorkOrderDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/partes/nuevo" element={
                <ProtectedRoute>
                  <Layout>
                    <CreateWorkOrder />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/agenda" element={
                <ProtectedRoute>
                  <Layout>
                    <ClientAgenda />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/materiales" element={
                <ProtectedRoute>
                  <Layout>
                    <Materials />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/vacaciones" element={
                <ProtectedRoute>
                  <Layout>
                    <Vacations />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/ajustes" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;