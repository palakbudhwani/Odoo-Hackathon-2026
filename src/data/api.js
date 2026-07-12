const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function request(path, options = {}) {
  const xhr = new XMLHttpRequest();
  xhr.open(options.method || 'GET', `${API_BASE_URL}${path}`, false);

  const headers = options.headers || {};
  Object.entries(headers).forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
  });

  xhr.send(options.body || null);

  const text = xhr.responseText;
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (xhr.status < 200 || xhr.status >= 300) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export function fetchCollections() {
  const collections = ['users', 'vehicles', 'drivers', 'trips', 'maintenance', 'fuelLogs', 'expenses', 'settings'];
  const state = {};

  for (const collection of collections) {
    state[collection] = request(`/${collection}`);
  }

  return state;
}

export function loginUser(email, password) {
  return request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export function createUser(user) {
  return request('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
}

export function createItem(collection, payload) {
  return request(`/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function updateItem(collection, id, payload) {
  return request(`/${collection}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function deleteItem(collection, id) {
  return request(`/${collection}/${id}`, {
    method: 'DELETE'
  });
}

export function resetDatabase() {
  return request('/reset', {
    method: 'POST'
  });
}
