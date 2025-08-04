// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProgramProvider } from './contexts/ProgramContext';

import Dashboard from './pages/Dashboard';
import BorrowerDashboard from './components/borrower/BorrowerDashboard';
import LenderDashboard from './components/lender/LenderDashboard';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  return (
    <ProgramProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/lend" element={<LenderDashboard />} />
          <Route path="/borrow" element={<BorrowerDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />

          {/* Catch-all redirects to onboarding root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProgramProvider>
  );
}
