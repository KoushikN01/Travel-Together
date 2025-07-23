import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class DocumentService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'multipart/form-data'
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
  }

  async uploadDocument(tripId, file, type) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await this.api.post(`/trips/${tripId}/documents`, formData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDocuments(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/documents`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDocument(tripId, documentId) {
    try {
      await this.api.delete(`/trips/${tripId}/documents/${documentId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async shareDocument(tripId, documentId, collaboratorId) {
    try {
      const response = await this.api.post(`/trips/${tripId}/documents/${documentId}/share`, {
        collaboratorId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async downloadDocument(tripId, documentId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/documents/${documentId}/download`, {
        responseType: 'blob'
      });
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

export default new DocumentService(); 