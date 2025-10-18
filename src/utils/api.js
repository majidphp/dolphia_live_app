const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(endpoint, { method = 'GET', headers = {}, body = null } = {}, token) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: defaultHeaders,
    body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(errorText || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
