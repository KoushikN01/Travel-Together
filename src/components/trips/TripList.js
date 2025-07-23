import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Flight,
  Hotel,
  DirectionsWalk,
  Share,
  CalendarMonth,
  Star,
  Lock,
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  SmartToy,
  Support,
  Analytics,
  Group,
  AutoAwesome,
  CameraAlt,
  Tour,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { ticketService } from '../../services/ticketService';
import authService from '../../services/authService';
import TravelBooking from './TravelBooking';
import SplashCursor from '../effects/SplashCursor';
import StarBorder from '../effects/StarBorder';
import {
  processCardPayment,
  processUPIPayment,
  processBankPayment,
  processEMIPayment
} from '../../services/mockPaymentGateway';

const TripList = ({ onTripSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTrip, setNewTrip] = useState({
    title: '',
    startDate: '',
    endDate: '',
    destinations: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
    bankAccount: '',
    ifscCode: '',
  });
  const [user, setUser] = useState(authService.getUser());
  const [showTravelBooking, setShowTravelBooking] = useState(false);
  const [prefillBookingData, setPrefillBookingData] = useState(null);
  const [selectedEMI, setSelectedEMI] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const premiumFeatures = [
    { 
      id: 1,
      name: 'AI Trip Planning',
      price: '₹199',
      description: 'Get AI-powered suggestions for your entire trip',
      icon: <SmartToy />
    },
    {
      id: 2,
      name: 'Priority Support',
      price: '₹149',
      description: '24/7 dedicated customer support',
      icon: <Support />
    },
    {
      id: 3,
      name: 'Advanced Analytics',
      price: '₹299',
      description: 'Detailed insights and travel patterns',
      icon: <Analytics />
    },
    {
      id: 4,
      name: 'Collaborative Planning',
      price: '₹249',
      description: 'Plan trips with friends in real-time',
      icon: <Group />
    },
    {
      id: 5,
      name: 'Premium Templates',
      price: '₹179',
      description: 'Access to curated trip templates',
      icon: <AutoAwesome />
    },
    {
      id: 6,
      name: 'Professional Camera',
      price: '₹399',
      description: 'High-quality DSLR camera with accessories for your trip (Security deposit required)',
      icon: <CameraAlt />
    },
    {
      id: 7,
      name: 'Personal Trip Guide',
      price: '₹1499/day',
      description: 'Expert local guide (₹1499/day for regular users, ₹999/day for premium users)',
      perDay: true,
      premiumPrice: '₹999/day',
      icon: <Tour />
    }
  ];

  useEffect(() => {
    fetchTrips();
  }, []);

  // Check for pre-filled booking data from itinerary
  useEffect(() => {
    if (location.state?.prefillBooking) {
      setPrefillBookingData(location.state.prefillBooking);
      setShowTravelBooking(true);
    }
  }, [location.state]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedTrips = await tripService.getAllTrips();
      
      if (!Array.isArray(fetchedTrips)) {
        throw new Error('Invalid trips data received');
      }
      
      setTrips(fetchedTrips);
      
      // Trigger a custom event to notify the navbar
      window.dispatchEvent(new CustomEvent('tripsUpdated', { 
        detail: { hasTrips: fetchedTrips.length > 0 } 
      }));
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.message || 'Failed to fetch trips');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to fetch trips',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (trip = null) => {
    if (trip) {
      setSelectedTrip(trip);
      setNewTrip({
        title: trip.title,
        startDate: trip.startDate.split('T')[0],
        endDate: trip.endDate.split('T')[0],
        destinations: (trip.destinations || []).join(', '),
      });
    } else {
      setSelectedTrip(null);
      setNewTrip({
        title: '',
        startDate: '',
        endDate: '',
        destinations: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTrip(null);
    setError('');
  };

  const handleSaveTrip = async (tripData) => {
    try {
      if (selectedTrip) {
        await tripService.updateTrip(selectedTrip._id, tripData);
        setSnackbar({
          open: true,
          message: 'Trip updated successfully',
          severity: 'success'
        });
      } else {
        const newTrip = await tripService.createTrip(tripData);
        setSnackbar({
          open: true,
          message: 'Trip created successfully! You can now download your ticket.',
          severity: 'success'
        });
        setOpenDialog(false);
        setOpenFeatureDialog(true);
        
        // Auto-download ticket after successful trip creation
        setTimeout(() => {
          handleDownloadTicket(newTrip._id);
        }, 2000);
      }

      handleCloseDialog();
      await fetchTrips();
    } catch (err) {
      setError(err.message || 'Failed to save trip');
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await tripService.deleteTrip(tripId);
      const updatedTrips = trips.filter(trip => trip._id !== tripId);
      setTrips(updatedTrips);
      // Trigger a custom event to notify the navbar
      window.dispatchEvent(new CustomEvent('tripsUpdated', { 
        detail: { hasTrips: updatedTrips.length > 0 } 
      }));
      setSnackbar({
        open: true,
        message: 'Trip deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (trip) => {
    if (onTripSelect) {
      onTripSelect(trip);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    setPaymentDialog(true);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleEMISelect = (option) => {
    setSelectedEMI(option);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      let result;
      const amount = selectedFeature?.price || '1999';
      if (paymentMethod === 'card') {
        result = await processCardPayment({
          amount,
          cardNumber: paymentDetails.cardNumber,
          expiryDate: paymentDetails.cardExpiry,
          cvv: paymentDetails.cardCvv,
          name: user?.name || 'User'
        });
      } else if (paymentMethod === 'upi') {
        result = await processUPIPayment({
          amount,
          upiId: paymentDetails.upiId || 'user@upi'
        });
      } else if (paymentMethod === 'emi') {
        result = await processEMIPayment({
          amount,
          bankAccount: paymentDetails.bankAccount || '1234567890',
          ifscCode: paymentDetails.ifscCode || 'EXMP0001234',
          months: selectedEMI?.months || 3
        });
      }
      setPaymentDialog(false);
      setSnackbar({
        open: true,
        message: (result?.message || `Successfully purchased ${selectedFeature.name}!`) + (result?.transactionId ? ` (Txn: ${result.transactionId})` : ''),
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Payment failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTravelBookingComplete = async (bookingData) => {
    try {
      setLoading(true);
      console.log('Received booking data:', bookingData);

      // Create a new trip with the booking data
      const newTripData = {
        title: `Trip to ${bookingData.to}`,
        startDate: bookingData.departureDate,
        endDate: bookingData.returnDate,
        destination: bookingData.to,
        destinations: [bookingData.from, bookingData.to],
        transportMode: bookingData.transportMode,
        accommodation: bookingData.accommodation,
        travelers: bookingData.travelers,
        duration: bookingData.duration,
        costEstimate: bookingData.costEstimate,
        status: 'planning',
        paymentMethod: bookingData.paymentMethod,
        paymentDetails: bookingData.paymentDetails,
        description: `Trip from ${bookingData.from} to ${bookingData.to}`,
        createdAt: new Date().toISOString()
      };

      console.log('BookingData to send:', newTripData);
      
      // Save the trip using tripService
      let savedTrip = null;
      try {
        savedTrip = await tripService.createTrip(newTripData);
        console.log('Trip saved successfully:', savedTrip);

        // Show success message
        setSnackbar({
          open: true,
          message: 'Trip created successfully! Your ticket will be downloaded automatically.',
          severity: 'success'
        });

        // Hide the travel booking form
        setShowTravelBooking(false);
        
        // Refresh the trips list
        await fetchTrips();
        
        // Auto-download ticket after successful booking
        setTimeout(() => {
          handleDownloadTicket(savedTrip._id);
        }, 2000);
        
        // Navigate to the trips list
        navigate('/trips');
      } catch (err) {
        console.error('Trip creation failed:', err);
        throw new Error(err.response?.data?.message || 'Failed to create trip');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to complete booking',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollaboration = (tripId) => {
    navigate(`/trips/${tripId}/collaboration`);
  };

  const handleDownloadTicket = async (tripId) => {
    try {
      setLoading(true);
      
      // First, test the connection
      console.log('Testing ticket generation...');
      await ticketService.testTicketGeneration(tripId);
      
      // Then generate the ticket
      await ticketService.generateTicket(tripId);
      setSnackbar({
        open: true,
        message: 'Ticket downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to download ticket',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add handler for cancelling a trip
  const handleCancelTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        await tripService.cancelTrip(tripId);
        setSnackbar({
          open: true,
          message: 'Trip cancelled successfully',
          severity: 'success'
        });
        await fetchTrips();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || 'Failed to cancel trip',
          severity: 'error'
        });
      }
    }
  };

  const renderFeatures = (trip) => {
    if (!user?.subscription) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star fontSize="small" />
          Premium Features Available:
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy fontSize="small" color="primary" />
              <Typography variant="body2">AI Planning</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Support fontSize="small" color="primary" />
              <Typography variant="body2">Priority Support</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics fontSize="small" color="primary" />
              <Typography variant="body2">Trip Analytics</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group fontSize="small" color="primary" />
              <Typography variant="body2">Collaboration</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handlePaymentDetailsChange}
              placeholder="1234 5678 9012 3456"
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Expiry Date"
                name="cardExpiry"
                value={paymentDetails.cardExpiry}
                onChange={handlePaymentDetailsChange}
                placeholder="MM/YY"
                required
              />
              <TextField
                label="CVV"
                name="cardCvv"
                value={paymentDetails.cardCvv}
                onChange={handlePaymentDetailsChange}
                type="password"
                required
              />
            </Box>
          </Stack>
        );

      case 'upi':
        return (
          <TextField
            fullWidth
            label="UPI ID"
            name="upiId"
            value={paymentDetails.upiId}
            onChange={handlePaymentDetailsChange}
            placeholder="username@upi"
            required
          />
        );

      case 'emi':
        const calculateEMI = (amount, months) => {
          const principal = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
          const ratePerMonth = 0.01; // 1% monthly interest
          const EMI = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) / 
                     (Math.pow(1 + ratePerMonth, months) - 1);
          return Math.round(EMI);
        };

        const featurePrice = selectedFeature?.price || '₹1,999';
        const emiOptions = [
          { months: 3, amount: calculateEMI(featurePrice, 3) },
          { months: 6, amount: calculateEMI(featurePrice, 6) },
          { months: 12, amount: calculateEMI(featurePrice, 12) }
        ];

        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" gutterBottom>
              EMI Options
            </Typography>
            <Grid container spacing={2}>
              {emiOptions.map((option) => (
                <Grid item xs={12} md={4} key={option.months}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      ...(selectedEMI?.amount === option.amount && {
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }),
                    }}
                    onClick={() => handleEMISelect(option)}
                  >
                    <Typography variant="h6" gutterBottom>
                      {option.months} Months
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      ₹{option.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per month
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <TextField
              fullWidth
              label="Bank Account Number"
              name="bankAccount"
              value={paymentDetails.bankAccount}
              onChange={handlePaymentDetailsChange}
              required
            />
            <TextField
              fullWidth
              label="IFSC Code"
              name="ifscCode"
              value={paymentDetails.ifscCode}
              onChange={handlePaymentDetailsChange}
              required
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  const renderTripCard = (trip) => (
    <Card 
      key={trip._id} 
      sx={{ 
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
        border: 'none',
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #4299e1, #38b2ac, #f6ad55)',
          zIndex: 1
        },
        height: 340, // Increased card height
      }}
    >
      <Box sx={{ display: 'flex', height: '240px' }}> {/* Increased image row height */}
        <CardMedia
          component="img"
          sx={{ 
            width: '40%',
            objectFit: 'cover',
            transition: 'all 0.5s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
            height: '240px', // Increased image height
          }}
          image={`https://source.unsplash.com/800x400/?travel,${trip.destinations?.[0] || 'landscape'}`}
          alt={trip.title}
        />
        <Box sx={{ 
          width: '60%', 
          display: 'flex', 
          flexDirection: 'column',
          p: 3,
          position: 'relative',
        }}>
          <Box sx={{ 
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 1,
          }}>
            <Tooltip title="View">
              <IconButton 
                onClick={() => handleViewDetails(trip)}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <DirectionsWalk fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton 
                onClick={() => handleOpenDialog(trip)}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                onClick={() => handleDeleteTrip(trip._id)}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              color: '#2d3748',
              fontSize: '1.25rem',
              lineHeight: 1.3,
            }}
          >
            {trip.title}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip
              label={trip.status}
              size="small"
              sx={{ 
                fontWeight: 600,
                textTransform: 'capitalize',
                backgroundColor: 
                  trip.status === 'confirmed' ? '#e6fffa' :
                  trip.status === 'planning' ? '#fffaf0' :
                  trip.status === 'completed' ? '#ebf8ff' :
                  trip.status === 'cancelled' ? '#fff5f5' : '#f0f0f0',
                color: 
                  trip.status === 'confirmed' ? '#2c7a7b' :
                  trip.status === 'planning' ? '#b7791f' :
                  trip.status === 'completed' ? '#3182ce' :
                  trip.status === 'cancelled' ? '#e53e3e' : '#4a5568',
              }}
            />
          </Box>
          
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {trip.startDate && trip.endDate ? 
                `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}` : 
                'Dates not set'}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {(trip.destinations || []).map((destination, index) => (
                <Chip 
                  key={index} 
                  label={destination} 
                  size="small"
                  sx={{ 
                    backgroundColor: '#edf2f7',
                    color: '#4a5568',
                    fontWeight: 500,
                    borderRadius: '4px',
                  }}
                />
              ))}
            </Stack>
          </Box>
          
          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DirectionsWalk />}
              onClick={() => handleViewDetails(trip)}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                borderColor: '#e2e8f0',
                color: '#4a5568',
                '&:hover': {
                  borderColor: '#cbd5e0',
                  backgroundColor: 'rgba(237, 242, 247, 0.5)',
                }
              }}
            >
              Details
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Flight />}
              onClick={() => navigate(`/trips/${trip._id}/flights`)}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                backgroundColor: '#4299e1',
                '&:hover': {
                  backgroundColor: '#3182ce',
                }
              }}
            >
              Book
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Hotel />}
              onClick={() => navigate(`/trips/${trip._id}/hotels`)}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                backgroundColor: '#38b2ac',
                '&:hover': {
                  backgroundColor: '#319795',
                }
              }}
            >
              Hotels
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DirectionsWalk />}
              onClick={() => navigate(`/trips/${trip._id}/activities`)}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                backgroundColor: '#f6ad55',
                color: '#2d3748',
                '&:hover': {
                  backgroundColor: '#dd6b20',
                  color: '#fff',
                }
              }}
            >
              Activities
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CreditCard />}
              onClick={() => handleDownloadTicket(trip._id)}
              disabled={loading}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                backgroundColor: '#9f7aea',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#805ad5',
                },
                '&:disabled': {
                  backgroundColor: '#cbd5e0',
                  color: '#a0aec0',
                }
              }}
            >
              {loading ? 'Downloading...' : 'Download Ticket'}
            </Button>
            {trip.status !== 'cancelled' && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => handleCancelTrip(trip._id)}
                sx={{
                  textTransform: 'none',
                  borderRadius: '6px',
                  borderColor: '#feb2b2',
                  color: '#e53e3e',
                  '&:hover': {
                    borderColor: '#fc8181',
                    backgroundColor: '#fff5f5',
                  }
                }}
              >
                Cancel Trip
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );

  if (loading && trips.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#4299e1' }} />
          <Typography variant="h6" color="text.secondary">
            Loading your trips...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <SplashCursor 
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1024}
        DENSITY_DISSIPATION={0.98}
        VELOCITY_DISSIPATION={0.98}
        PRESSURE={0.5}
        PRESSURE_ITERATIONS={20}
        CURL={20}
        SPLAT_RADIUS={0.3}
        SPLAT_FORCE={4000}
        SHADING={true}
        COLOR_UPDATE_SPEED={8}
        BACK_COLOR={{ r: 0, g: 0, b: 0 }}
        TRANSPARENT={true}
      />
      {showTravelBooking ? (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            console.log('Overlay clicked');
            if (e.target === e.currentTarget) {
              setShowTravelBooking(false);
            }
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              padding: 3,
              borderRadius: 2,
              width: '90%',
              maxWidth: 800,
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              zIndex: 1001,
              pointerEvents: 'auto'
            }}
            onClick={(e) => {
              console.log('Form container clicked');
              e.stopPropagation();
            }}
          >
            <TravelBooking
              onBookingComplete={handleTravelBookingComplete}
              onClose={() => {
                console.log('Closing booking form');
                setShowTravelBooking(false);
              }}
            />
          </Box>
        </Box>
      ) : (
        <>
                  <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 6,
          p: 4,
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                color: '#2d3748',
                letterSpacing: '-0.5px',
              }}
            >
              My Trips
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowTravelBooking(true)}
              sx={{
                backgroundColor: '#4299e1',
                color: 'white',
                borderRadius: '8px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#3182ce',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              New Trip
            </Button>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '8px',
                boxShadow: 'none',
                border: '1px solid #fed7d7',
              }}
            >
              {error}
            </Alert>
          )}

          {loading && trips.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '50vh',
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress size={60} thickness={4} sx={{ color: '#4299e1' }} />
              <Typography variant="h6" color="text.secondary">
                Loading your trips...
              </Typography>
            </Box>
          ) : trips.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              p: 8,
              borderRadius: '16px',
              backgroundColor: '#f8f9fa',
              border: '2px dashed #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
            }}>
              <Typography variant="h5" sx={{ mb: 2, color: '#4a5568' }}>
                No trips planned yet
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#718096' }}>
                Start by creating your first adventure
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowTravelBooking(true)}
                sx={{
                  backgroundColor: '#4299e1',
                  color: 'white',
                  borderRadius: '8px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#3182ce',
                  }
                }}
              >
                Plan Your First Trip
              </Button>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              '& > *': {
                width: '100%',
                mb: 4 // Add margin-bottom to each card
              }
            }}>
              {trips.map((trip) => renderTripCard(trip))}
            </Box>
          )}

          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedTrip ? 'Edit Trip' : 'Create New Trip'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Trip Title"
                  fullWidth
                  value={newTrip.title}
                  onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                  required
                  error={!newTrip.title}
                  helperText={!newTrip.title && 'Title is required'}
                />
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!newTrip.startDate}
                  helperText={!newTrip.startDate && 'Start date is required'}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!newTrip.endDate}
                  helperText={!newTrip.endDate && 'End date is required'}
                />
                <TextField
                  label="Destinations (comma-separated)"
                  fullWidth
                  value={newTrip.destinations}
                  onChange={(e) => setNewTrip({ ...newTrip, destinations: e.target.value })}
                  helperText="Enter destinations separated by commas"
                  required
                  error={!newTrip.destinations}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Enhance your trip with premium features
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Star />}
                    onClick={() => {
                      handleCloseDialog();
                      setOpenFeatureDialog(true);
                    }}
                    sx={{
                      background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FB8C00 30%, #FFA726 90%)',
                      }
                    }}
                  >
                    View Premium Features
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                onClick={() => handleSaveTrip(newTrip)} 
                variant="contained"
                disabled={!newTrip.title || !newTrip.startDate || !newTrip.endDate || !newTrip.destinations}
              >
                {selectedTrip ? 'Save Changes' : 'Create Trip'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openFeatureDialog} onClose={() => setOpenFeatureDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Star color="primary" />
                <Typography variant="h6">Enhance Your Trip with Premium Features</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" color="text.secondary" paragraph>
                Unlock premium features to make your trip planning experience even better!
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Premium Plan
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Get all features for just ₹799/month
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleSubscribe()}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      color: 'white',
                    }}
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Or purchase features individually
                </Typography>
              </Divider>

              <List>
                {premiumFeatures.map((feature) => (
                  <ListItem key={feature.id}>
                    <ListItemIcon>{feature.icon}</ListItemIcon>
                    <ListItemText
                      primary={feature.name}
                      secondary={
                        <>
                          {feature.description}
                          <br />
                          <Typography variant="body2" color="primary">
                            {feature.perDay ? (
                              <>
                                {feature.premiumPrice} (Premium) / {feature.price} (Regular)
                              </>
                            ) : (
                              feature.price
                            )}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <StarBorder
                        as="button"
                        color="#2196F3"
                        speed="4s"
                        onClick={() => handleFeatureSelect(feature)}
                        style={{ marginRight: '8px' }}
                      >
                        Add
                      </StarBorder>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenFeatureDialog(false)}>
                Maybe Later
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={paymentDialog} onClose={() => !loading && setPaymentDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              Purchase Feature
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedFeature?.name} - {selectedFeature?.price}
                </Typography>
                
                <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                  <FormLabel component="legend">Select Payment Method</FormLabel>
                  <RadioGroup
                    row
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCard sx={{ mr: 1 }} /> Card
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="upi"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneAndroid sx={{ mr: 1 }} /> UPI
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="emi"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccountBalance sx={{ mr: 1 }} /> EMI
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              {renderPaymentForm()}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setPaymentDialog(false)} 
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handlePayment}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Pay Now'}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
};

export default TripList; 