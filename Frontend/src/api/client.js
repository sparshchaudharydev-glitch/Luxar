// All backend calls live here. In development, Vite forwards /api/* to the
// FastAPI server on port 8000 (see vite.config.js), so the browser sees a same-origin request.
const BASE = '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 8000?');
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // FastAPI errors look like { detail: "Restaurant not found" }
    const message = typeof body?.detail === 'string' ? body.detail : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body;
}

export const api = {
  // Returns an object keyed by restaurant ID: { "1": { name, location }, ... }
  listRestaurants: () => request('/restaurants'),

  // Body: { name, location }. Returns { message, restaurant_id }.
listRestaurants: () => request('/restaurants/'),

createRestaurant: (data) =>
  request('/restaurants/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  deleteRestaurant: (id) => request(`/restaurants/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

