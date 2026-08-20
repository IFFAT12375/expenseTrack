export async function api(path, options = {}) {
  const token = localStorage.getItem('expense-token');
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) { localStorage.removeItem('expense-token'); window.location.href = '/login'; }
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
