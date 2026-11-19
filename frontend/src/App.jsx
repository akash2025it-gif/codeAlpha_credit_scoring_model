import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PredictionResultView from './components/PredictionResultView';
import PredictionDetailView from './components/PredictionDetailView';

import { 
  fetchHealth, 
  fetchModelMetrics, 
  fetchPredictionHistory, 
  fetchCurrentUser, 
  logoutUser 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Check current authenticated user session
  const checkAuth = async () => {
    try {
      const user = await fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (err) {
      console.warn("Session check notice:", err);
    }
  };

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
    checkAuth();
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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.full_name}!`, 'success');
    setActiveTab('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Account created successfully. Welcome, ${user.full_name}!`, 'success');
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast("Signed out successfully.", 'info');
    setActiveTab('dashboard');
  };

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    showToast("Profile information updated.", 'success');
  };

  const handleLoadPreset = (presetData) => {
    setSelectedPreset(presetData);
    setActiveTab('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePredictionSuccess = (result) => {
    setSelectedResult(result);
    showToast(
      result?.prediction
        ? `Decision: ${result.prediction} — Score ${result.risk_score || Math.round(300 + result.probability * 550)}`
        : 'Prediction completed successfully.',
      result?.prediction_code === 1 ? 'success' : 'error'
    );
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
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Login Page */}
        {activeTab === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            setActiveTab={setActiveTab}
          />
        )}

        {/* 2. Registration Page */}
        {activeTab === 'register' && (
          <Register 
            onRegisterSuccess={handleRegisterSuccess}
            setActiveTab={setActiveTab}
          />
        )}

        {/* 3. Dashboard Page */}
        {activeTab === 'dashboard' && (
          <DashboardPage 
            metrics={metrics}
            history={history}
            setActiveTab={setActiveTab}
            onLoadPreset={handleLoadPreset}
          />
        )}

        {/* 4. New Credit Assessment Form */}
        {activeTab === 'predict' && (
          <PredictionPage 
            initialPreset={selectedPreset}
            onPredictionSuccess={handlePredictionSuccess}
            onViewFullResult={(res) => {
              setSelectedResult(res);
              setActiveTab('result');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 5. Dedicated Prediction Results View */}
        {activeTab === 'result' && (
          <PredictionResultView 
            result={selectedResult}
            onBackToForm={() => setActiveTab('predict')}
            onNavigateHistory={() => setActiveTab('history')}
          />
        )}

        {/* 6. Model Performance & Analytics */}
        {activeTab === 'models' && (
          <ModelPerformancePage 
            metricsData={metrics}
          />
        )}

        {/* 7. Prediction History Audit Trail */}
        {activeTab === 'history' && (
          <HistoryPage 
            history={history}
            onRefreshHistory={() => {
              fetchPredictionHistory().then(res => setHistory(res.history || []));
            }}
            onClearSuccess={() => showToast('Prediction history cleared.', 'info')}
            onSelectDetail={(rec) => {
              setSelectedDetailRecord(rec);
              setActiveTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 8. Individual Prediction Detail View */}
        {activeTab === 'detail' && (
          <PredictionDetailView 
            recordData={selectedDetailRecord}
            onBack={() => setActiveTab('history')}
          />
        )}

        {/* 9. User Profile & Account Settings */}
        {activeTab === 'profile' && (
          <Profile 
            currentUser={currentUser}
            onProfileUpdated={handleProfileUpdated}
            onLogout={handleLogout}
            setActiveTab={setActiveTab}
          />
        )}

        {/* 10. About & Methodology */}
        {activeTab === 'about' && (
          <AboutPage />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />

      {/* Global Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
