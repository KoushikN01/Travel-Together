import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add, Edit, Delete, Flight, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../contexts/AuthContext';

const FlightManagement = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    price: '',
    bookingReference: ''
  });

  useEffect(() => {
    loadFlights();
  }, [tripId]);

  const loadFlights = async () => {
    try {
      const trip = await tripService.getTripById(tripId);
      if (!trip) {
        setError('Trip not found');
        return;
      }

      // Get flights directly from the flights array
      const flightList = trip.flights || [];
      
      // Map the flights to the required format
      const formattedFlights = flightList.map(flight => ({
          _id: flight._id,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          departureAirport: flight.departureAirport,
          arrivalAirport: flight.arrivalAirport,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          duration: flight.duration,
          price: flight.price,
          bookingReference: flight.bookingReference,
          status: flight.status
        }));

      console.log('Loaded flights:', formattedFlights);
      setFlights(formattedFlights);
    } catch (error) {
      console.error('Error loading flights:', error);
      setError(error.response?.data?.message || 'Error loading flights');
    }
  };

  const handleOpenDialog = (flight = null) => {
    if (flight) {
      setCurrentFlight(flight);
      // Format dates for datetime-local input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        airline: flight.airline || '',
        flightNumber: flight.flightNumber || '',
        departureAirport: flight.departureAirport || '',
        arrivalAirport: flight.arrivalAirport || '',
        departureTime: formatDateForInput(flight.departureTime),
        arrivalTime: formatDateForInput(flight.arrivalTime),
        duration: flight.duration || '',
        price: flight.price || '',
        bookingReference: flight.bookingReference || ''
      });
    } else {
      setCurrentFlight(null);
      setFormData({
        airline: '',
        flightNumber: '',
        departureAirport: '',
        arrivalAirport: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        price: '',
        bookingReference: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentFlight(null);
    setFormData({
      airline: '',
      flightNumber: '',
      departureAirport: '',
      arrivalAirport: '',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      price: '',
      bookingReference: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveFlight = async () => {
    try {
      // Validate required fields
      const requiredFields = ['airline', 'flightNumber', 'departureAirport', 'arrivalAirport', 'departureTime', 'arrivalTime'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Format dates to ISO strings
      const departureTime = new Date(formData.departureTime);
      const arrivalTime = new Date(formData.arrivalTime);

      if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
        setError('Invalid date format for departure or arrival time');
        return;
      }

      if (arrivalTime <= departureTime) {
        setError('Arrival time must be after departure time');
        return;
      }

      const formattedFlightData = {
        ...formData,
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        duration: formData.duration || '',
        price: formData.price || '',
        bookingReference: formData.bookingReference || '',
        type: 'flight',
        status: 'confirmed'
      };

      console.log('Saving flight with data:', formattedFlightData);
      console.log('Trip ID:', tripId);
      console.log('Current flight:', currentFlight);

      if (currentFlight) {
        console.log('Updating existing flight');
        await tripService.updateFlight(tripId, currentFlight._id, formattedFlightData);
      } else {
        console.log('Adding new flight');
        await tripService.addFlight(tripId, formattedFlightData);
      }

      console.log('Flight saved successfully');
      setSuccess('Flight updated successfully');
      handleClose();
      loadFlights();
    } catch (error) {
      console.error('Error saving flight:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError(error.response?.data?.message || 'Error saving flight. Please try again.');
    }
  };

  const handleDeleteFlight = async (flightId) => {
    try {
      await tripService.deleteFlight(tripId, flightId);
      setSuccess('Flight deleted successfully');
      loadFlights();
    } catch (error) {
      console.error('Error deleting flight:', error);
      setError(error.response?.data?.message || 'Error deleting flight');
    }
  };

  const handleBack = () => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Trip
        </Button>
        <Typography variant="h4" component="h1">
          Flight Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Flight
        </Button>
      </Box>

      <List>
        {flights.map((flight) => (
          <ListItem key={flight._id} divider>
            <ListItemText
              primary={
                <Box>
                  <Typography variant="h6">
                    {flight.airline} - {flight.flightNumber}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle1">
                          From: {flight.departureAirport}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(flight.departureTime).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle1">
                          To: {flight.arrivalAirport}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(flight.arrivalTime).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {flight.duration} | Price: ${flight.price}
                  </Typography>
                  {flight.bookingReference && (
                    <Typography variant="body2" color="text.secondary">
                      Booking Ref: {flight.bookingReference}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleOpenDialog(flight)}>
                <Edit />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDeleteFlight(flight._id)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentFlight ? 'Edit Flight' : 'Add New Flight'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Airline"
                  name="airline"
                  value={formData.airline}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!formData.airline}
                  helperText={!formData.airline && 'Airline is required'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Flight Number"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!formData.flightNumber}
                  helperText={!formData.flightNumber && 'Flight number is required'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departure Airport"
                  name="departureAirport"
                  value={formData.departureAirport}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!formData.departureAirport}
                  helperText={!formData.departureAirport && 'Departure airport is required'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Arrival Airport"
                  name="arrivalAirport"
                  value={formData.arrivalAirport}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!formData.arrivalAirport}
                  helperText={!formData.arrivalAirport && 'Arrival airport is required'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departure Time"
                  name="departureTime"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!formData.departureTime}
                  helperText={!formData.departureTime && 'Departure time is required'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Arrival Time"
                  name="arrivalTime"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!formData.arrivalTime}
                  helperText={!formData.arrivalTime && 'Arrival time is required'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Booking Reference"
                  name="bookingReference"
                  value={formData.bookingReference}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSaveFlight} variant="contained" color="primary">
            {currentFlight ? 'Update' : 'Add'} Flight
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FlightManagement; 