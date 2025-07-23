import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Paper,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Flight,
  Hotel,
  DirectionsWalk,
  Restaurant,
  AccessTime,
  LocationOn,
  AttachMoney,
  CalendarMonth,
  ArrowBack,
  CreditCard,
} from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { ticketService } from '../../services/ticketService';
import TripCollaboration from './TripCollaboration';
import TripRecommendations from './TripRecommendations';
import DayActivities from './DayActivities';
import { useAuth } from '../../contexts/AuthContext';

const TripDetails = ({ trip: initialTrip, onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trip, setTrip] = useState(initialTrip);
  const [itinerary, setItinerary] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'activity',
    location: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: '',
    cost: '',
    description: '',
    bookingReference: '',
    category: '',
    createdBy: user?._id || '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [activeTab, setActiveTab] = useState('details');
  const [selectedDay, setSelectedDay] = useState(0);
  const [activityType, setActivityType] = useState('activity');

  useEffect(() => {
    if (initialTrip) {
      setTrip(initialTrip);
      initializeItinerary(initialTrip);
    }
  }, [initialTrip]);

  useEffect(() => {
    if (user?._id) {
      setNewActivity(prev => ({
        ...prev,
        createdBy: user._id
      }));
    }
  }, [user]);

  const initializeItinerary = (tripData) => {
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const newItinerary = Array.from({ length: days }, (_, index) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + index);
      
      // Find existing activities for this date
      const existingDay = tripData.itinerary?.find(day => 
        new Date(day.date).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      );
      
      return {
        day: index + 1,
        date: currentDate.toISOString().split('T')[0],
        activities: existingDay?.activities || [],
      };
    });
    
    setItinerary(newItinerary);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (day, activity = null) => {
    if (activity) {
      setSelectedActivity({ ...activity, day });
      setNewActivity(activity);
    } else {
      setSelectedActivity(null);
      setNewActivity({
        title: '',
        type: 'activity',
        location: '',
        date: '',
        startTime: '',
        duration: '',
        cost: '',
        description: '',
        bookingReference: '',
        category: '',
        createdBy: user?._id || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedActivity(null);
    setError('');
  };

  const handleActivityTypeSelect = (type) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please log in to add activities',
        severity: 'error'
      });
      return;
    }

    setActivityType(type);
    const dayIndex = selectedDay;
    const date = itinerary[dayIndex].date;

    // Initialize activity data based on type
    const baseActivity = {
      title: '',
      type,
      location: '',
      date,
      description: '',
      cost: '',
      bookingReference: '',
      category: '',
      createdBy: user._id,
    };

    if (type === 'flight') {
      setNewActivity({
        ...baseActivity,
        flightNumber: '',
        airline: '',
        departureAirport: '',
        arrivalAirport: '',
        departureTime: '',
        arrivalTime: '',
      });
    } else if (type === 'hotel') {
      setNewActivity({
        ...baseActivity,
        hotelName: '',
        address: '',
        roomType: '',
        checkIn: date,
        checkOut: date,
      });
    } else {
      setNewActivity({
        ...baseActivity,
        startTime: '',
        duration: '',
      });
    }

    handleOpenDialog(dayIndex + 1);
  };

  const handleSaveActivity = async () => {
    try {
      if (!user) {
        throw new Error('Please log in to add activities');
      }

      setLoading(true);
      const dayIndex = selectedActivity ? selectedActivity.day - 1 : selectedDay;
      const date = itinerary[dayIndex].date;

      // Prepare activity data based on type
      let activityData = {
        ...newActivity,
        title: newActivity.title.trim(),
        date,
        createdBy: user._id,
        type: activityType,
        updatedAt: new Date().toISOString()
      };

      // Validate common required fields
      const missingFields = [];
      if (!activityData.title) missingFields.push('Title');
      if (!activityData.date) missingFields.push('Date');

      // Validate type-specific required fields
      if (activityType === 'flight') {
        if (!activityData.flightNumber) missingFields.push('Flight Number');
        if (!activityData.airline) missingFields.push('Airline');
        if (!activityData.departureAirport) missingFields.push('Departure Airport');
        if (!activityData.arrivalAirport) missingFields.push('Arrival Airport');
        if (!activityData.departureTime) missingFields.push('Departure Time');
        if (!activityData.arrivalTime) missingFields.push('Arrival Time');
        if (!activityData.bookingReference) missingFields.push('Booking Reference');

        // Format flight data
        activityData = {
          ...activityData,
          departureTime: new Date(activityData.departureTime).toISOString(),
          arrivalTime: new Date(activityData.arrivalTime).toISOString(),
        };
      }

      if (activityType === 'hotel') {
        if (!activityData.hotelName) missingFields.push('Hotel Name');
        if (!activityData.address) missingFields.push('Address');
        if (!activityData.roomType) missingFields.push('Room Type');
        if (!activityData.checkIn) missingFields.push('Check-in Date');
        if (!activityData.checkOut) missingFields.push('Check-out Date');
        if (!activityData.bookingReference) missingFields.push('Booking Reference');

        // Format hotel data
        activityData = {
          ...activityData,
          checkIn: new Date(activityData.checkIn).toISOString(),
          checkOut: new Date(activityData.checkOut).toISOString(),
        };
      }

      if (activityType === 'activity') {
        if (!activityData.startTime) missingFields.push('Start Time');
      }

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Save the activity
      if (selectedActivity) {
        if (activityType === 'flight') {
          await tripService.updateFlight(trip._id, selectedActivity._id, activityData);
        } else if (activityType === 'hotel') {
          await tripService.updateHotel(trip._id, selectedActivity._id, activityData);
        } else {
          await tripService.updateActivity(trip._id, selectedActivity._id, activityData);
        }
      } else {
        if (activityType === 'flight') {
          await tripService.addFlight(trip._id, activityData);
        } else if (activityType === 'hotel') {
          await tripService.addHotel(trip._id, activityData);
        } else {
          await tripService.addActivity(trip._id, date, activityData);
        }
      }

      setSnackbar({
        open: true,
        message: `${activityType} ${selectedActivity ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
      handleCloseDialog();
      await fetchTrip();
    } catch (error) {
      console.error('Error saving activity:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error saving activity',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrip = async () => {
    try {
      const updatedTrip = await tripService.getTrip(trip._id);
      setTrip(updatedTrip);
      initializeItinerary(updatedTrip);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteActivity = async (dayIndex, activityId) => {
    try {
      setLoading(true);
      const updatedTrip = await tripService.updateTrip(trip._id, {
        itinerary: itinerary.map((day, index) => {
          if (index === dayIndex) {
            return {
              ...day,
              activities: day.activities.filter(act => act._id !== activityId)
            };
          }
          return day;
        })
      });
      setTrip(updatedTrip);
      initializeItinerary(updatedTrip);
      setSnackbar({
        open: true,
        message: 'Activity deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadTicket = async () => {
    try {
      setLoading(true);
      await ticketService.generateTicket(trip._id);
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Flight />;
      case 'hotel':
        return <Hotel />;
      case 'activity':
        return <DirectionsWalk />;
      case 'restaurant':
        return <Restaurant />;
      default:
        return <DirectionsWalk />;
    }
  };

  if (!trip) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 10, py: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            mb: 4,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              minWidth: 120,
              color: '#1a1a1a',
              '&.Mui-selected': {
                color: '#1a1a1a',
              }
            },
            '& .MuiTabs-indicator': {
              height: 2,
              backgroundColor: '#1a1a1a',
            }
          }}
        >
          <Tab label="Trip Details" value="details" />
          <Tab label="Collaboration" value="collaboration" onClick={() => navigate(`/trips/${trip._id}/collaboration`)} />
          <Tab label="Recommendations & Documents" value="recommendations" onClick={() => navigate(`/trips/${trip._id}/recommendations`)} />
        </Tabs>

        {activeTab === 'details' && (
          <>
            <Box sx={{ 
              mb: 4,
              background: '#ffffff',
              p: 4,
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              {/* Trip Title and Status */}
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 3,
                  letterSpacing: '-0.5px'
                }}
              >
                {trip.title}
                {/* Status Chip */}
                <Chip
                  label={trip.status}
                  size="medium"
                  sx={{ ml: 2, verticalAlign: 'middle' }}
                  color={
                    trip.status === 'confirmed' ? 'success' :
                    trip.status === 'planning' ? 'warning' :
                    trip.status === 'completed' ? 'primary' :
                    trip.status === 'cancelled' ? 'error' : 'default'
                  }
                />
              </Typography>
              {/* Back Button below title */}
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/trips')}
                  sx={{ borderRadius: 2, fontWeight: 600, background: '#1976d2', color: '#fff', '&:hover': { background: '#115293' } }}
                >
                  Back to My Trips
                </Button>
              </Box>
              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ 
                  mb: 3,
                  '& .MuiButton-root': {
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    py: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  }
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Flight />}
                  onClick={() => handleActivityTypeSelect('flight')}
                  sx={{
                    background: '#1a1a1a',
                    '&:hover': {
                      background: '#2d2d2d',
                    }
                  }}
                >
                  Flights
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Hotel />}
                  onClick={() => handleActivityTypeSelect('hotel')}
                  sx={{
                    background: '#1a1a1a',
                    '&:hover': {
                      background: '#2d2d2d',
                    }
                  }}
                >
                  Hotels
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DirectionsWalk />}
                  onClick={() => handleActivityTypeSelect('activity')}
                  sx={{
                    background: '#1a1a1a',
                    '&:hover': {
                      background: '#2d2d2d',
                    }
                  }}
                >
                  Activities
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CreditCard />}
                  onClick={handleDownloadTicket}
                  disabled={loading}
                  sx={{
                    background: '#9f7aea',
                    color: '#fff',
                    '&:hover': {
                      background: '#805ad5',
                    },
                    '&:disabled': {
                      background: '#cbd5e0',
                      color: '#a0aec0',
                    }
                  }}
                >
                  {loading ? 'Downloading...' : 'Download Ticket'}
                </Button>
              </Stack>
            </Box>

            <Tabs
              value={selectedDay}
              onChange={(e, newValue) => setSelectedDay(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              {itinerary.map((day, index) => (
                <Tab
                  key={index}
                  label={`Day ${day.day}`}
                  value={index}
                />
              ))}
            </Tabs>

            {itinerary.map((day, index) => (
              <Box
                key={index}
                role="tabpanel"
                hidden={selectedDay !== index}
              >
                {selectedDay === index && (
                  <DayActivities
                    day={day}
                    onEdit={(activity) => handleOpenDialog(index + 1, activity)}
                    onDelete={(activityId) => handleDeleteActivity(index, activityId)}
                  />
                )}
              </Box>
            ))}
          </>
        )}

        {activeTab === 'recommendations' && (
          <TripRecommendations tripId={trip._id} destinations={trip.destinations} />
        )}
      </Box>

      {/* Activity Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedActivity ? `Edit ${activityType}` : `Add ${activityType}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              fullWidth
              required
            />

            {activityType === 'flight' && (
              <>
                <TextField
                  label="Flight Number"
                  value={newActivity.flightNumber}
                  onChange={(e) => setNewActivity({ ...newActivity, flightNumber: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Airline"
                  value={newActivity.airline}
                  onChange={(e) => setNewActivity({ ...newActivity, airline: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Departure Airport"
                  value={newActivity.departureAirport}
                  onChange={(e) => setNewActivity({ ...newActivity, departureAirport: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Arrival Airport"
                  value={newActivity.arrivalAirport}
                  onChange={(e) => setNewActivity({ ...newActivity, arrivalAirport: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Departure Time"
                  type="datetime-local"
                  value={newActivity.departureTime}
                  onChange={(e) => setNewActivity({ ...newActivity, departureTime: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Arrival Time"
                  type="datetime-local"
                  value={newActivity.arrivalTime}
                  onChange={(e) => setNewActivity({ ...newActivity, arrivalTime: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {activityType === 'hotel' && (
              <>
                <TextField
                  label="Hotel Name"
                  value={newActivity.hotelName}
                  onChange={(e) => setNewActivity({ ...newActivity, hotelName: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Address"
                  value={newActivity.address}
                  onChange={(e) => setNewActivity({ ...newActivity, address: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Room Type"
                  value={newActivity.roomType}
                  onChange={(e) => setNewActivity({ ...newActivity, roomType: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Check-in Date"
                  type="date"
                  value={newActivity.checkIn}
                  onChange={(e) => setNewActivity({ ...newActivity, checkIn: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Check-out Date"
                  type="date"
                  value={newActivity.checkOut}
                  onChange={(e) => setNewActivity({ ...newActivity, checkOut: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {activityType === 'activity' && (
              <>
                <TextField
                  label="Location"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Start Time"
                  type="time"
                  value={newActivity.startTime}
                  onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Duration"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                  fullWidth
                  placeholder="e.g., 2 hours"
                />
              </>
            )}

            <TextField
              label="Cost"
              type="number"
              value={newActivity.cost}
              onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography>₹</Typography>
              }}
            />
            <TextField
              label="Description"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Booking Reference"
              value={newActivity.bookingReference}
              onChange={(e) => setNewActivity({ ...newActivity, bookingReference: e.target.value })}
              fullWidth
              required={activityType === 'flight' || activityType === 'hotel'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveActivity} 
            variant="contained"
            disabled={!newActivity.title || (activityType === 'activity' && !newActivity.startTime)}
          >
            {selectedActivity ? 'Update' : 'Add'} {activityType}
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
    </Container>
  );
};

export default TripDetails; 