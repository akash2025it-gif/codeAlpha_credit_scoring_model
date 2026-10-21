/**
 * Frontend API Service Layer for AI Credit Scoring System.
 * Connects to FastAPI backend endpoints.
 */

// Local Vite and the Docker client proxy /api to FastAPI. GitHub Pages is a
// static host and cannot proxy requests, so its deployment supplies the Vercel
// API URL at build time (see deploy-pages.yml).
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}

export async function submitPrediction(payload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction request failed (${response.status})`);
  }
  return response.json();
}

export async function fetchModelMetrics() {
  const response = await fetch(`${API_BASE_URL}/model-metrics`);
  if (!response.ok) {
    throw new Error(`Failed to load model metrics: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPredictionHistory(limit = 50) {
  const response = await fetch(`${API_BASE_URL}/prediction-history?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to retrieve history: ${response.statusText}`);
  }
  return response.json();
}

export async function clearPredictionHistory() {
  const response = await fetch(`${API_BASE_URL}/prediction-history`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to clear history: ${response.statusText}`);
  }
  return response.json();
}
