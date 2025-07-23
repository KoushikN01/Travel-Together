import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class RecommendationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Get personalized travel recommendations
  async getRecommendations(preferences) {
    try {
      const response = await this.api.post('/ai/recommendations', preferences);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Get smart itinerary suggestions
  async getSmartItinerary(destination, duration, preferences) {
    try {
      const response = await this.api.post('/ai/itinerary', {
        destination,
        duration,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Error getting smart itinerary:', error);
      throw error;
    }
  }

  // Get budget optimization suggestions
  async getBudgetSuggestions(tripDetails) {
    try {
      const response = await this.api.post('/ai/budget', tripDetails);
      return response.data;
    } catch (error) {
      console.error('Error getting budget suggestions:', error);
      throw error;
    }
  }
}

export default new RecommendationService(); 