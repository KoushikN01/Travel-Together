import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { adminService } from './services/adminService';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTrips from './pages/admin/Trips';
import AdminActivityLog from './pages/admin/ActivityLog';

// Trip Pages
import TripCollaboration from './components/trips/TripCollaboration';
import CollaborationInvitations from './components/trips/CollaborationInvitations';

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const isValid = await adminService.verifyToken();
        setIsAdmin(isValid);
        if (!isValid) {
          navigate('/admin/login');
        }
      } catch (error) {
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAdmin ? children : null;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Trip Collaboration Routes */}
        <Route path="/trips/:tripId/collaboration" element={<TripCollaboration />} />
        <Route path="/trips/invitations" element={<CollaborationInvitations />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/trips"
          element={
            <AdminRoute>
              <AdminTrips />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <AdminRoute>
              <AdminActivityLog />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 