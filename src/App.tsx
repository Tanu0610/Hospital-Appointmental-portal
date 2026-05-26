/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navigation from './components/Navigation';
import Toast from './components/Toast';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Contact from './pages/Contact';
import Auth from './pages/Auth';

// Specific dashboard view portals
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Elegant Protected Route Guard
function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div id="loader-wrapper" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-medical-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Initializing Medical Sessions...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Role mismatch
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 relative">
          
          {/* Main Top Header */}
          <Navigation />

          {/* Active Router Views */}
          <div className="flex-grow">
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />

              {/* Patient Dashboards */}
              <Route 
                path="/dashboard/patient" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Doctor Dashboards */}
              <Route 
                path="/dashboard/doctor" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Dashboards */}
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Universal Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Toast notifications */}
          <Toast />

          {/* Clinically elegant footer */}
          <footer className="bg-slate-900 border-t border-slate-950 py-8 text-slate-400 text-xs text-center">
            <div className="max-w-7xl mx-auto px-4 space-y-3">
              <p className="font-display font-bold text-slate-200">MediCare Hospital Appointment Portal</p>
              <p>&copy; {new Date().getFullYear()} Medicare Health Inc. All medical records are kept secure with certified Supabase database RLS architecture.</p>
            </div>
          </footer>

        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
