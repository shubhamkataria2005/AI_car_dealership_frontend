const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = {

  // ── Auth ──────────────────────────────────────────────────────────────
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(userData)
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(credentials)
    });
    return response.json();
  },

  // ── Cars ──────────────────────────────────────────────────────────────
  getAllCars: async () => {
    const response = await fetch(`${API_BASE_URL}/api/cars/all`);
    return response.json();
  },

  getCarById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/cars/${id}`);
    return response.json();
  },

  listCar: async (carData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/cars/list`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(carData)
    });
    return response.json();
  },

  getUserCars: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/cars/my-cars`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  searchCars: async (params) => {
    const query    = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/cars/search?${query}`);
    return response.json();
  },

  // ── Messages ──────────────────────────────────────────────────────────
  sendMessage: async (payload, token) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  getInbox: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/inbox`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getConversation: async (otherUserId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${otherUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getUnreadCount: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getUnreadMessages: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/unread`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  markAsRead: async (messageId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/read`, {
      method:  'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};