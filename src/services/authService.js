import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Don't override Content-Type for multipart/form-data
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      
      return config;
    });

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Handle specific error cases
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        if (error.response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please sign in again.');
        }
        throw error;
      }
    );
  }

  // Token management methods
  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
  }

  // User management methods
  setUser(user) {
    if (user) {
      const userToStore = {
        ...user,
        subscription: user.subscription ? {
          ...user.subscription,
          startDate: user.subscription.startDate instanceof Date ? user.subscription.startDate.toISOString() : user.subscription.startDate,
          expiryDate: user.subscription.expiryDate instanceof Date ? user.subscription.expiryDate.toISOString() : user.subscription.expiryDate
        } : null
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
    } else {
      localStorage.removeItem('user');
    }
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.subscription) {
        return {
          ...user,
          subscription: {
            ...user.subscription,
            startDate: new Date(user.subscription.startDate),
            expiryDate: new Date(user.subscription.expiryDate)
          }
        };
      }
      return user;
    }
    return null;
  }

  // Alias for getUser for backward compatibility
  getCurrentUser() {
    return this.getUser();
  }

  // Profile management methods
  async getProfile() {
    try {
      const response = await this.api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    console.log('=== Profile Update Request ===');
    console.log('Profile Data:', JSON.stringify(profileData, null, 2));
    
    try {
      const response = await this.api.put('/user/profile', profileData);
      
      console.log('Profile Update Response:', {
        status: response.status,
        data: response.data
      });
      
      if (response.data) {
        this.setUser(response.data);
        return response.data;
      }
      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      console.log('Making login request to:', `${API_URL}/auth/login`);
      const response = await this.api.post('/auth/login', { email, password });
      console.log('Raw login response:', response);
      console.log('Login response data:', response.data);
      
      // Check if we have a valid response
      if (!response.data) {
        console.error('No data in response');
        throw new Error('No data received from server');
      }

      // Handle the response based on its structure
      if (response.data.user && response.data.token) {
        // Store token
        this.setToken(response.data.token);
        
        // Store user data
        const userData = {
          ...response.data,
          subscription: response.data.subscription ? {
            ...response.data.subscription,
            startDate: new Date(response.data.subscription.startDate),
            expiryDate: new Date(response.data.subscription.expiryDate)
          } : null
        };
        this.setUser(userData);
        
        return userData;
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadAvatar(file) {
    try {
      console.log('Starting avatar upload...');
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('FormData created, making request to /user/upload-avatar');
      
      const response = await this.api.post('/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response received:', response);
      console.log('Response data:', response.data);

      if (response.data && response.data.user) {
        console.log('User data in response:', response.data.user);
        console.log('Avatar field:', response.data.user.avatar);
        
        // Update user data in local storage
        const currentUser = this.getUser();
        if (currentUser) {
          this.setUser({ ...currentUser, avatar: response.data.user.avatar });
        }
        return response.data.user;
      }
      throw new Error('Failed to upload avatar');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    console.log('Checking authentication:', { hasToken: !!token, hasUser: !!user });
    return !!token && !!user;
  }

  // Helper method to get full avatar URL
  getAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    
    // For static files, we need to use the base URL without /api
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const fullUrl = baseUrl.replace('/api', '') + avatarPath;
    
    console.log('getAvatarUrl - Input path:', avatarPath);
    console.log('getAvatarUrl - Base URL:', baseUrl);
    console.log('getAvatarUrl - Full URL:', fullUrl);
    return fullUrl;
  }

  // Settings management methods
  async getUserSettings() {
    try {
      console.log('=== Fetching User Settings ===');
      const token = localStorage.getItem('token');
      console.log('Token present:', !!token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await this.api.get('/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch user settings');
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }

  async updateUserSettings(settings) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await this.api.put('/user/settings', settings, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data) {
        return response.data;
      }
      throw new Error('Failed to update user settings');
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Subscription management methods
  async getSubscriptionDetails() {
    try {
      const response = await this.api.get('/user/subscription');
      if (response.data) {
        // Convert date strings to Date objects
        const subscription = {
          ...response.data,
          startDate: response.data.startDate ? new Date(response.data.startDate) : null,
          expiryDate: response.data.expiryDate ? new Date(response.data.expiryDate) : null,
          endDate: response.data.endDate ? new Date(response.data.endDate) : null
        };
        return subscription;
      }
      return null;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      throw error;
    }
  }

  async updateSubscription(action, planData = null) {
    try {
      const requestData = { action };
      if (planData) {
        // Spread the planData directly into requestData instead of wrapping it in a 'plan' property
        Object.assign(requestData, planData);
      }
      
      console.log('Sending subscription update request:', requestData);
      const response = await this.api.post('/user/subscription', requestData);
      console.log('Subscription update response:', response.data);
      
      if (response.data) {
        // Update user data in local storage with new subscription details
        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            subscription: {
              ...response.data,
              startDate: response.data.startDate ? new Date(response.data.startDate) : null,
              expiryDate: response.data.expiryDate ? new Date(response.data.expiryDate) : null,
              endDate: response.data.endDate ? new Date(response.data.endDate) : null
            }
          };
          this.setUser(updatedUser);
        }
        return response.data;
      }
      throw new Error('Failed to update subscription');
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  async handleGoogleLogin(credentialResponse) {
    try {
      const response = await this.api.post('/auth/google', {
        credential: credentialResponse.credential,
      });
      if (response.data && response.data.user && response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data);
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Request password reset (send email)
  async requestPasswordReset(email) {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  }

  // Reset password using token
  async resetPassword(token, newPassword) {
    try {
      const response = await this.api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }
}

export default new AuthService();