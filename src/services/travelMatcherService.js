import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class TravelMatcherService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Find travel matches
  async findMatches(matchCriteria) {
    try {
      const response = await this.api.post('ai/travel-match', matchCriteria);
      return response.data;
    } catch (error) {
      console.error('Error finding travel matches:', error);
      throw error;
    }
  }

  // Get user preferences for matching
  async getUserPreferences(userId) {
    try {
      const response = await this.api.get(`/api/users/${userId}/preferences`);
      return response.data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const response = await this.api.put(`/api/users/${userId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}

export default new TravelMatcherService(); 