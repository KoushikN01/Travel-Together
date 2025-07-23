import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class TripService {
  constructor(api) {
    this.api = api;
  }

  // Get pending invitations
  async getPendingInvitations() {
    try {
      const response = await this.api.get('/trips/invitations/pending');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Accept invitation
  async acceptInvitation(tripId, collaboratorId) {
    try {
      const response = await this.api.post(`/trips/${tripId}/collaborators/${collaboratorId}/accept`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reject invitation
  async rejectInvitation(tripId, collaboratorId) {
    try {
      const response = await this.api.post(`/trips/${tripId}/collaborators/${collaboratorId}/reject`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'An error occurred');
    }
    return error;
  }
}

export const tripService = new TripService(api); 