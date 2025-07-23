import axios from 'axios';
import { API_URL } from '../config';

class TripService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
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

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all trips
  async getAllTrips() {
    try {
      const response = await this.api.get('/trips');
      // Check if response has data property (admin API format) or is direct array
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw this.handleError(error);
    }
  }

  // Get trip by ID
  async getTripById(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw this.handleError(error);
    }
  }

  // Create new trip
  async createTrip(tripData) {
    try {
      console.log('Creating trip with data:', tripData);
      const response = await this.api.post('/trips', tripData);
      console.log('Trip creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw this.handleError(error);
    }
  }

  // Update trip
  async updateTrip(tripId, tripData) {
    try {
      const response = await this.api.put(`/trips/${tripId}`, tripData);
      return response.data;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw this.handleError(error);
    }
  }

  // Delete trip
  async deleteTrip(tripId) {
    try {
      await this.api.delete(`/trips/${tripId}`);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw this.handleError(error);
    }
  }

  // Vote on activity
  async voteOnActivity(tripId, activityId, vote) {
    try {
      const response = await this.api.post(`/trips/${tripId}/activities/${activityId}/vote`, { vote });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Invite collaborator
  async inviteCollaborator(tripId, email) {
    try {
      const response = await this.api.post(`/trips/${tripId}/collaborators`, { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remove collaborator
  async removeCollaborator(tripId, collaboratorId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/collaborators/${collaboratorId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update collaborator role
  async updateCollaboratorRole(tripId, collaboratorId, role) {
    try {
      const response = await this.api.patch(`/trips/${tripId}/collaborators/${collaboratorId}`, { role });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all flights for a trip
  async getFlights(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/flights`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add a flight
  async addFlight(tripId, flightData) {
    try {
      console.log('Adding flight to trip:', tripId);
      console.log('Flight data:', flightData);
      
      // Ensure all required fields are present
      const requiredFields = ['airline', 'flightNumber', 'departureAirport', 'arrivalAirport', 'departureTime', 'arrivalTime'];
      const missingFields = requiredFields.filter(field => !flightData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Format the flight data
      const formattedFlightData = {
        airline: flightData.airline,
        flightNumber: flightData.flightNumber,
        departureAirport: flightData.departureAirport,
        arrivalAirport: flightData.arrivalAirport,
        departureTime: flightData.departureTime,
        arrivalTime: flightData.arrivalTime,
        duration: flightData.duration || '',
        price: flightData.price || '',
        bookingReference: flightData.bookingReference || ''
      };

      console.log('Sending formatted flight data:', formattedFlightData);
      
      const response = await this.api.post(`/trips/${tripId}/flights`, formattedFlightData);
      console.log('Add flight response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding flight:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Update a flight
  async updateFlight(tripId, flightId, flightData) {
    try {
      console.log('Updating flight:', flightId);
      console.log('Flight data:', flightData);
      
      const response = await this.api.put(`/trips/${tripId}/flights/${flightId}`, flightData);
      console.log('Update flight response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating flight:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  }

  // Delete a flight
  async deleteFlight(tripId, flightId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/flights/${flightId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting flight:', error);
      throw error;
    }
  }

  // Get all hotels for a trip
  async getHotels(tripId) {
    try {
      console.log('Fetching hotels for trip:', tripId);
      const response = await this.api.get(`/trips/${tripId}/hotels`);
      console.log('Hotels response:', response.data);
      
      if (!response.data) {
        console.error('No data in response');
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw this.handleError(error);
    }
  }

  // Add a hotel
  async addHotel(tripId, hotelData) {
    try {
      console.log('=== Hotel Creation Request ===');
      console.log('Trip ID:', tripId);
      console.log('Hotel Data:', JSON.stringify(hotelData, null, 2));

      // Format dates properly
      const formattedData = {
        ...hotelData,
        checkIn: new Date(hotelData.checkIn).toISOString(),
        checkOut: new Date(hotelData.checkOut).toISOString(),
        price: hotelData.price ? Number(hotelData.price) : 0
      };

      console.log('Formatted Data:', JSON.stringify(formattedData, null, 2));

      const response = await this.api.post(`/trips/${tripId}/hotels`, formattedData);
      console.log('Hotel Creation Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== Hotel Creation Error ===');
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw this.handleError(error);
    }
  }

  // Update a hotel
  async updateHotel(tripId, hotelId, hotelData) {
    try {
      console.log('Updating hotel:', hotelId);
      console.log('Hotel data:', hotelData);
      
      const response = await this.api.put(`/trips/${tripId}/hotels/${hotelId}`, {
        hotelName: hotelData.hotelName,
        address: hotelData.address,
        checkIn: hotelData.checkIn,
        checkOut: hotelData.checkOut,
        roomType: hotelData.roomType || '',
        price: hotelData.price || '',
        bookingReference: hotelData.bookingReference || '',
        amenities: hotelData.amenities || '',
        notes: hotelData.notes || ''
      });
      console.log('Update hotel response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating hotel:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw this.handleError(error);
    }
  }

  // Delete a hotel
  async deleteHotel(tripId, hotelId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/hotels/${hotelId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  }

  // Get all activities for a trip
  async getActivities(tripId) {
    try {
      console.log('Fetching activities for trip:', tripId);
      const response = await this.api.get(`/trips/${tripId}/activities`);
      console.log('Activities response:', response.data);
      
      // Ensure we have a valid response
      if (!response.data) {
        console.error('No data in response');
        return { itinerary: [] };
      }
      
      // If the response is an array, wrap it in the expected structure
      if (Array.isArray(response.data)) {
        return { itinerary: response.data };
      }
      
      // If the response already has the correct structure, return it
      if (response.data.itinerary) {
        return response.data;
      }
      
      // Default case: return empty itinerary
      return { itinerary: [] };
    } catch (error) {
      console.error('Error fetching activities:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        const errorMessage = error.response.data.message || 'Failed to fetch activities';
        throw new Error(errorMessage);
      }
      throw this.handleError(error);
    }
  }

  // Add an activity
  async addActivity(tripId, activityData) {
    try {
      console.log('Adding activity:', { tripId, activityData });
      
      // Format the data
      const formattedData = {
        title: activityData.title,
        description: activityData.description || '',
        date: activityData.date ? new Date(activityData.date).toISOString() : null,
        startTime: activityData.startTime,
        duration: activityData.duration || '',
        location: activityData.location || '',
        cost: Number(activityData.cost) || 0,
        category: activityData.category || '',
        bookingReference: activityData.bookingReference || '',
        type: activityData.type || 'activity',
        status: activityData.status || 'pending'
      };

      console.log('Formatted activity data:', formattedData);

      const response = await this.api.post(`/trips/${tripId}/activities`, formattedData);
      console.log('Activity creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding activity:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        const errorMessage = error.response.data.message || 'Failed to add activity';
        throw new Error(errorMessage);
      }
      throw this.handleError(error);
    }
  }

  // Get activity categories
  async getActivityCategories(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/activities/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Propose an activity
  async proposeActivity(tripId, activityData) {
    try {
      const response = await this.api.post(`/trips/${tripId}/activities`, {
        ...activityData,
        status: 'proposed'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update an activity
  async updateActivity(tripId, activityId, activityData) {
    try {
      const response = await this.api.put(`/trips/${tripId}/activities/${activityId}`, {
        title: activityData.title,
        description: activityData.description,
        date: activityData.date,
        startTime: activityData.startTime,
        duration: activityData.duration,
        location: activityData.location,
        cost: activityData.cost,
        category: activityData.category,
        bookingReference: activityData.bookingReference
      });
      return response.data;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  // Delete an activity
  async deleteActivity(tripId, activityId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/activities/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  // Save chat message to backend
  async saveChatMessage(tripId, message) {
    try {
      const response = await this.api.post(`/trips/${tripId}/chat`, { message });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel a trip
  async cancelTrip(tripId) {
    try {
      const response = await this.api.patch(`/trips/${tripId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling trip:', error);
      throw this.handleError(error);
    }
  }

  // Handle errors
  handleError(error) {
    if (error.response) {
      const responseData = error.response.data;
      console.log('Error Response Data:', responseData);

      if (responseData.errors && Array.isArray(responseData.errors)) {
        const errorMessages = responseData.errors.map(err => 
          `${err.field}: ${err.message}`
        ).join('\n');
        throw new Error(errorMessages);
      }

      if (responseData.message) {
        throw new Error(responseData.message);
      }

      throw new Error('An error occurred while processing your request');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const tripService = new TripService(); 