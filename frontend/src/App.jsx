import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

import { fetchHealth, fetchModelMetrics, fetchPredictionHistory } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthStatus, setHealthStatus] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load initial backend health, metrics, and history
  const loadData = async () => {
    try {
      const health = await fetchHealth();
      setHealthStatus(health);
      setIsOnline(true);
    } catch (e) {
      console.warn("Backend not reachable:", e.message);
      setIsOnline(false);
    }

    try {
      const metricsData = await fetchModelMetrics();
      setMetrics(metricsData);
    } catch (e) {
      console.warn("Could not fetch metrics:", e.message);
    }

    try {
      const historyData = await fetchPredictionHistory();
      setHistory(historyData.history || []);
    } catch (e) {
      console.warn("Could not fetch history:", e.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Periodic health check every 15 seconds
    const interval = setInterval(async () => {
      try {
        const health = await fetchHealth();
        setHealthStatus(health);
        setIsOnline(true);
      } catch (e) {
        setIsOnline(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadPreset = (presetData) => {
    setSelectedPreset(presetData);
    setActiveTab('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePredictionSuccess = () => {
    // Refresh history
    fetchPredictionHistory()
      .then(res => setHistory(res.history || []))
      .catch(console.warn);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        healthStatus={healthStatus}
        isOnline={isOnline}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage 
            metrics={metrics}
            history={history}
            setActiveTab={setActiveTab}
            onLoadPreset={handleLoadPreset}
          />
        )}

        {activeTab === 'predict' && (
          <PredictionPage 
            initialPreset={selectedPreset}
            onPredictionSuccess={handlePredictionSuccess}
          />
        )}

        {activeTab === 'models' && (
          <ModelPerformancePage 
            metricsData={metrics}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage 
            history={history}
            onRefreshHistory={() => {
              fetchPredictionHistory().then(res => setHistory(res.history || []));
            }}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
