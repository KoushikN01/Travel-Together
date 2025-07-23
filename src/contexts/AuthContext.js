import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { Box, CircularProgress } from '@mui/material';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const userData = authService.getUser();
          if (userData) {
            setUser(userData);
            try {
              await authService.verifyToken();
            } catch (error) {
              console.error('Token verification failed:', error);
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (userData) => {
    console.log('Handling login with:', userData);
    try {
      // Handle both regular login and Google login responses
      const user = userData.user || userData;
      const token = userData.token;

      console.log('Extracted user data:', user);
      console.log('User avatar field:', user?.avatar);

      if (user) {
        setUser(user);
        authService.setUser(user);
        if (token) {
          authService.setToken(token);
        }
        
        // Refresh user data from server to ensure we have the latest information
        try {
          console.log('Refreshing user profile from server...');
          const freshUserData = await authService.getProfile();
          console.log('Fresh user data from server:', freshUserData);
          console.log('Fresh user avatar field:', freshUserData?.avatar);
          
          if (freshUserData) {
            setUser(freshUserData);
            authService.setUser(freshUserData);
            console.log('User context updated with fresh data');
          }
        } catch (profileError) {
          console.warn('Failed to refresh user profile after login:', profileError);
          // Don't throw error here as login was successful
        }
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Login handling error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    authService.logout();
  };

  const updateUser = (updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      authService.setUser(updatedUser);
      return updatedUser;
    });
  };

  const refreshUser = async () => {
    try {
      const freshUserData = await authService.getProfile();
      if (freshUserData) {
        setUser(freshUserData);
        authService.setUser(freshUserData);
        return freshUserData;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 