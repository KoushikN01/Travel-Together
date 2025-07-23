import axios from 'axios';
import { API_URL } from '../config';

const API_BASE_URL = API_URL.replace('/api', '') || 'http://localhost:5001';

class TicketService {
  async generateTicket(tripId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/trips/${tripId}/generate-ticket`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob', // Important for file download
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${tripId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Ticket downloaded successfully' };
    } catch (error) {
      console.error('Error generating ticket:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate ticket');
    }
  }

  async testTicketGeneration(tripId) {
    try {
      console.log('=== FRONTEND TICKET TEST ===');
      console.log('Trip ID:', tripId);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      const response = await axios.get(
        `${API_BASE_URL}/api/trips/${tripId}/test-ticket`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log('Test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Test error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Test failed');
    }
  }

  async downloadTicket(tripId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/trips/${tripId}/download-ticket`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob',
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${tripId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Ticket downloaded successfully' };
    } catch (error) {
      console.error('Error downloading ticket:', error);
      throw new Error(error.response?.data?.message || 'Failed to download ticket');
    }
  }
}

export const ticketService = new TicketService(); 