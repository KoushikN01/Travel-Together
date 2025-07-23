import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TripsPage from './pages/trips/TripsPage';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Profile from './components/Profile';
import Settings from './components/Settings';
import MFAVerification from './components/auth/MFAVerification';
import PasswordRecovery from './components/auth/PasswordRecovery';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboard from './components/admin/Dashboard';
import Explore from './pages/Explore';
import About from './pages/About';
import Subscription from './pages/Subscription';
import TripList from './components/trips/TripList';
import FlightManagement from './components/trips/FlightManagement';
import HotelManagement from './components/trips/HotelManagement';
import ActivityManagement from './components/trips/ActivityManagement';
import ChatSupport from './components/support/ChatSupport';
import ContactUs from './components/support/ContactUs';
import AdminLogin from './components/admin/Login';
import AdminGuard from './components/admin/AdminGuard';
import SmartRecommendations from './features/ai/SmartRecommendations';
import Booking from './pages/Booking';
import { ItineraryProvider } from './contexts/ItineraryContext';
import theme from './theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TripCollaboration from './components/trips/TripCollaboration';
import SearchResults from './pages/SearchResults';
import TravelMatcher from './components/travel/TravelMatcher';
import SplashCursor from './components/effects/SplashCursor';
import Dock from './components/effects/Dock';
import { 
  VscHome, 
  VscCompass, 
  VscAccount, 
  VscSettingsGear,
  VscCalendar,
  VscTools
} from 'react-icons/vsc';
import { Box } from '@mui/material';
import WeatherPlaceRecommender from './pages/WeatherPlaceRecommender';
import ItineraryGenerator from './pages/ItineraryGenerator';
import TravelTools from './pages/TravelTools';

// Create a separate component for the Dock with navigation
const NavigationDock = () => {
  const navigate = useNavigate();

  const dockItems = [
    { 
      icon: <VscHome size={18} />, 
      label: 'Home', 
      onClick: () => navigate('/') 
    },
    { 
      icon: <VscCompass size={18} />, 
      label: 'Explore', 
      onClick: () => navigate('/explore') 
    },
    { 
      icon: <VscCalendar size={18} />, 
      label: 'Trips', 
      onClick: () => navigate('/trips') 
    },
    { 
      icon: <VscTools size={18} />, 
      label: 'Tools', 
      onClick: () => navigate('/travel-tools') 
    },
    { 
      icon: <VscAccount size={18} />, 
      label: 'Profile', 
      onClick: () => navigate('/profile') 
    },
    { 
      icon: <VscSettingsGear size={18} />, 
      label: 'Settings', 
      onClick: () => navigate('/settings') 
    },
  ];

  return (
    <Dock 
      items={dockItems}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
    />
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ItineraryProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles
              styles={{
                '*': {
                  boxSizing: 'border-box',
                  margin: 0,
                  padding: 0,
                },
                html: {
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  height: '100%',
                  width: '100%',
                },
                body: {
                  height: '100%',
                  width: '100%',
                  backgroundColor: theme.palette.background.default,
                },
                '#root': {
                  height: '100%',
                  width: '100%',
                },
                '.MuiDrawer-root .MuiDrawer-paper': {
                  width: 280,
                  boxSizing: 'border-box',
                },
                '.MuiDataGrid-root': {
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
                  },
                },
              }}
            />
            <ToastContainer position="top-right" autoClose={3000} />
            <Router>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <SplashCursor 
                  SIM_RESOLUTION={128}
                  DYE_RESOLUTION={1024}
                  DENSITY_DISSIPATION={0.97}
                  VELOCITY_DISSIPATION={0.98}
                  PRESSURE={0.8}
                  PRESSURE_ITERATIONS={20}
                  CURL={30}
                  SPLAT_RADIUS={0.5}
                  SPLAT_FORCE={6000}
                  SHADING={true}
                  COLOR_UPDATE_SPEED={10}
                  BACK_COLOR={{ r: 0, g: 0, b: 0 }}
                  TRANSPARENT={true}
                />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<PasswordRecovery />} />
                  <Route path="/reset-password" element={<PasswordRecovery />} />
                  <Route path="/verify-mfa" element={<MFAVerification />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trips/*"
                    element={
                      <ProtectedRoute>
                        <TripsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/explore"
                    element={
                      <ProtectedRoute>
                        <Explore />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-recommendations"
                    element={
                      <ProtectedRoute>
                        <SmartRecommendations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking"
                    element={
                      <ProtectedRoute>
                        <Booking />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/about"
                    element={<About />}
                  />
                  <Route
                    path="/subscription"
                    element={<Subscription />}
                  />
                  <Route
                    path="/trips/:tripId/collaboration"
                    element={
                      <ProtectedRoute>
                        <TripCollaboration />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/trips/:tripId/flights" element={<FlightManagement />} />
                  <Route path="/trips/:tripId/hotels" element={<HotelManagement />} />
                  <Route path="/trips/:tripId/activities" element={<ActivityManagement />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminGuard>
                        <AdminDashboard />
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/travel-matcher"
                    element={
                      <ProtectedRoute>
                        <TravelMatcher />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/weather-recommendations" element={<WeatherPlaceRecommender />} />
                  <Route path="/itinerary-generator" element={<ItineraryGenerator />} />
                  <Route path="/travel-tools" element={<TravelTools />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <ChatSupport />
                <NavigationDock />
              </Box>
            </Router>
          </ThemeProvider>
        </ItineraryProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
