import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AdminControlRoom } from './pages/AdminControlRoom';
import { DemoDevPlayground } from './pages/DemoDevPlayground';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public High-Conversion Real Estate Portal */}
        <Route path="/" element={<HomePage />} />
        
        {/* Protected Brokerage Executive Control Room */}
        <Route path="/admin" element={<AdminControlRoom />} />
        
        {/* Hidden Developer & Demo Playground (Simulators) */}
        <Route path="/demo" element={<DemoDevPlayground />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
