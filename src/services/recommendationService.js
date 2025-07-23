import axios from 'axios';
import authService from './authService';
import Trip from '../models/Trip';
import { ApiError } from '../utils/ApiError';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class RecommendationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.weatherBaseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getWeatherRecommendations(tripId, userId) {
    try {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        throw new ApiError('Trip not found', 404);
      }

      if (!trip.hasAccess(userId)) {
        throw new ApiError('Unauthorized access', 403);
      }

      const recommendations = [];
      const destinations = trip.destinations;

      for (const destination of destinations) {
        const weather = await this.getWeatherData(destination);
        const weatherBasedActivities = this.getWeatherBasedActivities(weather);
        recommendations.push({
          destination,
          weather,
          activities: weatherBasedActivities
        });
      }

      return recommendations;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }

  async getPersonalizedRecommendations(tripId, userInterests) {
    try {
      const response = await this.api.post(`/recommendations/personalized/${tripId}`, { interests: userInterests });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWeatherData(destination) {
    try {
      const response = await axios.get(
        `${this.weatherBaseUrl}/weather?q=${destination}&appid=${this.weatherApiKey}&units=metric`
      );
      return {
        temperature: response.data.main.temp,
        condition: response.data.weather[0].main,
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed
      };
    } catch (error) {
      throw new ApiError('Failed to fetch weather data', 500);
    }
  }

  getWeatherBasedActivities(weather) {
    const activities = {
      sunny: [
        'Beach activities',
        'Outdoor sports',
        'Hiking',
        'Sightseeing',
        'Outdoor dining'
      ],
      rainy: [
        'Museum visits',
        'Indoor shopping',
        'Spa treatments',
        'Indoor dining',
        'Theater shows'
      ],
      cloudy: [
        'City tours',
        'Shopping',
        'Café hopping',
        'Art galleries',
        'Indoor attractions'
      ],
      snowy: [
        'Skiing',
        'Snowboarding',
        'Snowshoeing',
        'Hot springs',
        'Indoor activities'
      ]
    };

    const condition = weather.condition.toLowerCase();
    return activities[condition] || activities.cloudy;
  }

  getActivityRecommendations(trip) {
    const { travelStyle, preferences } = trip;
    const recommendations = [];

    switch (travelStyle) {
      case 'luxury':
        recommendations.push(
          'Private guided tours',
          'Fine dining experiences',
          'Spa treatments',
          'Exclusive events',
          'VIP attractions'
        );
        break;
      case 'budget':
        recommendations.push(
          'Free walking tours',
          'Local markets',
          'Public parks',
          'Museums with free days',
          'Street food experiences'
        );
        break;
      case 'adventure':
        recommendations.push(
          'Hiking trails',
          'Water sports',
          'Rock climbing',
          'Bike tours',
          'Adventure parks'
        );
        break;
      case 'relaxation':
        recommendations.push(
          'Beach activities',
          'Yoga classes',
          'Meditation centers',
          'Nature walks',
          'Wellness retreats'
        );
        break;
    }

    return recommendations;
  }

  getRestaurantRecommendations(trip) {
    const { travelStyle, preferences } = trip;
    const recommendations = [];

    switch (travelStyle) {
      case 'luxury':
        recommendations.push(
          'Fine dining restaurants',
          'Michelin-starred establishments',
          'Rooftop dining',
          'Wine tasting experiences',
          'Chef\'s table experiences'
        );
        break;
      case 'budget':
        recommendations.push(
          'Local street food',
          'Food markets',
          'Casual dining',
          'Food trucks',
          'Local cafes'
        );
        break;
      default:
        recommendations.push(
          'Local cuisine',
          'Popular restaurants',
          'Cafes',
          'Bars and pubs',
          'Food markets'
        );
    }

    return recommendations;
  }

  getAccommodationRecommendations(trip) {
    const { travelStyle, preferences } = trip;
    const recommendations = [];

    switch (preferences.accommodation) {
      case 'hotel':
        recommendations.push(
          'Luxury hotels',
          'Boutique hotels',
          'Resorts',
          'Business hotels',
          'Family-friendly hotels'
        );
        break;
      case 'hostel':
        recommendations.push(
          'Backpacker hostels',
          'Social hostels',
          'Budget accommodations',
          'Youth hostels',
          'Eco hostels'
        );
        break;
      case 'apartment':
        recommendations.push(
          'Vacation rentals',
          'Serviced apartments',
          'Airbnb options',
          'Extended stay apartments',
          'Luxury apartments'
        );
        break;
      case 'camping':
        recommendations.push(
          'Camping grounds',
          'Glamping sites',
          'RV parks',
          'Eco lodges',
          'Mountain cabins'
        );
        break;
    }

    return recommendations;
  }

  async getWeatherBasedSuggestions(city) {
    try {
      const response = await this.api.get(`/recommendations/weather?city=${city}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPopularActivities(destination) {
    try {
      const response = await this.api.get(`/recommendations/popular`, {
        params: { destination }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSimilarDestinations(destination) {
    try {
      const response = await this.api.get(`/recommendations/similar`, {
        params: { destination }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserPreferences(preferences) {
    try {
      const response = await this.api.put('/recommendations/preferences', preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error('Error setting up request');
    }
  }
}

export default new RecommendationService(); 