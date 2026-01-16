
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FireDetection from './pages/FireDetection';
import GasDetection from './pages/GasDetection';
import History from './pages/History';
import Alerts from './pages/Alerts';
import { MonitoringProvider } from './contexts/MonitoringContext';

const App: React.FC = () => {
  return (
    <MonitoringProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fire" element={<FireDetection />} />
            <Route path="/gas" element={<GasDetection />} />
            <Route path="/history" element={<History />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </Layout>
      </Router>
    </MonitoringProvider>
  );
};

export default App;
