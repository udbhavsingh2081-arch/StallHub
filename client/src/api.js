// Simple API client with JWT support
const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('stallhub_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('stallhub_token', token);
  } else {
    localStorage.removeItem('stallhub_token');
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('stallhub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('stallhub_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('stallhub_user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      setAuthToken(null);
      setCurrentUser(null);
      window.location.hash = '#/login';
    }
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
