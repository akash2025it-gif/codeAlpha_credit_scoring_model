/**
 * Frontend API Service Layer for CrediScore AI Credit Scoring System.
 * Connects to FastAPI backend endpoints with token management and auth headers.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

// -------------------------------------------------------------
// Token Helpers
// -------------------------------------------------------------

export function getAuthToken() {
  try {
    return localStorage.getItem('crediscore_token') || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('crediscore_token', token);
    } else {
      localStorage.removeItem('crediscore_token');
    }
  } catch (err) {
    console.warn("Could not save token:", err);
  }
}

function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// -------------------------------------------------------------
// Authentication Services
// -------------------------------------------------------------

export async function loginUser(usernameOrEmail, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username_or_email: usernameOrEmail,
      password: password
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Login failed (${response.status})`);
  }
  const data = await response.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Registration failed (${response.status})`);
  }
  const data = await response.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
    }
    return null;
  }
  return response.json();
}

export async function updateProfile(profileData) {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Profile update failed (${response.status})`);
  }
  return response.json();
}

export async function changePassword(currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Password change failed (${response.status})`);
  }
  return response.json();
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.warn("Logout error:", err);
  } finally {
    setAuthToken(null);
  }
}

// -------------------------------------------------------------
// Core Credit Scoring Services
// -------------------------------------------------------------

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
    headers: getAuthHeaders(),
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

export async function fetchPredictionHistory(limit = 50, userOnly = false) {
  const response = await fetch(`${API_BASE_URL}/prediction-history?limit=${limit}&user_only=${userOnly}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to retrieve history: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPredictionDetail(predictionId) {
  const response = await fetch(`${API_BASE_URL}/prediction-history/${predictionId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to retrieve assessment details: ${response.statusText}`);
  }
  return response.json();
}

export async function clearPredictionHistory() {
  const response = await fetch(`${API_BASE_URL}/prediction-history`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to clear history: ${response.statusText}`);
  }
  return response.json();
}
