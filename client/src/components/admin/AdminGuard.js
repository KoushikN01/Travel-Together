import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import adminService from '../../services/adminService';
import { CircularProgress, Box } from '@mui/material';

const AdminGuard = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (!adminService.isAuthenticated()) {
          setIsVerifying(false);
          return;
        }

        const isValid = await adminService.verifyToken();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Admin verification failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isVerifying) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminGuard; 