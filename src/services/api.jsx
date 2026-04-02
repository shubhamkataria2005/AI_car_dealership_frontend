// src/services/api.jsx
import { API_BASE_URL } from '../config';

// Helper: fetch with a timeout so we don't hang forever on a sleeping Render server
const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────
  async login(email, password) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  },

  async register(username, email, password) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return await response.json();
  },

  // ── Cars ──────────────────────────────────────────────────────────────
  async getAllCars() {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/cars/all`, {}, 30000);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  },

  async getDealershipInventory() {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/cars/dealership/inventory`);
    return await response.json();
  },

  async getMarketplaceListings() {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/cars/marketplace/listings`);
    return await response.json();
  },

  async getCarById(id) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/cars/${id}`);
    return await response.json();
  },

  async listCar(carData, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/cars/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(carData)
    });
    return await response.json();
  },

  async addDealershipCar(carData, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/cars/dealership/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(carData)
    });
    return await response.json();
  },

  async searchCars(params) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/cars/search?${queryParams}`);
    return await response.json();
  },

  // ── Messages ──────────────────────────────────────────────────────────
  async sendMessage(messageData, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messageData)
    });
    return await response.json();
  },

  async getConversation(otherUserId, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/messages/conversation/${otherUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async getInbox(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/messages/inbox`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async getUnreadCount(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/messages/unread-count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // ── Trade-In ──────────────────────────────────────────────────────────
  async getTradeInEstimate(tradeInData, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/trade-in/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(tradeInData)
    });
    return await response.json();
  },

  async submitTradeIn(tradeInData, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/trade-in/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tradeInData)
    });
    return await response.json();
  },

  async getUserTradeIns(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/trade-in/my-trade-ins`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // ── Service Appointments ──────────────────────────────────────────────
  async bookAppointment(appointmentData, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/service/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });
    return await response.json();
  },

  async getUserAppointments(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/service/my-appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // ── AI Assistant ──────────────────────────────────────────────────────
  async chatWithAI(message) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/ai-assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }, 60000); // longer timeout for AI
    return await response.json();
  },

  // ── Car Recognition ───────────────────────────────────────────────────
  async recognizeCar(imageFile, token) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/car-recognition/predict`, {
      method: 'POST',
      headers,
      body: formData
    }, 30000);

    return await response.json();
  },

  async getRecognitionStatus(token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/car-recognition/status`, {
      headers
    });
    return await response.json();
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  async getAdminStats(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async getAllUsers(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async updateUserRole(userId, role, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    return await response.json();
  },

  async deleteUser(userId, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async getAllCarsAdmin(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/cars`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async updateCarStatus(carId, status, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/cars/${carId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return await response.json();
  },

  async updateCarInspection(carId, inspectionStatus, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/cars/${carId}/inspection`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ inspectionStatus })
    });
    return await response.json();
  },

  async deleteCar(carId, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/cars/${carId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async getAllMessages(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async getAllTestDrives(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/test-drives/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async updateTestDriveStatus(appointmentId, action, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/test-drives/${appointmentId}/${action}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async getPendingTradeIns(token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/trade-in/admin/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  async approveTradeIn(tradeInId, finalValue, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/trade-in/admin/${tradeInId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ finalValue })
    });
    return await response.json();
  },

  async rejectTradeIn(tradeInId, reason, token) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/trade-in/admin/${tradeInId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    return await response.json();
  }
};

export default api;