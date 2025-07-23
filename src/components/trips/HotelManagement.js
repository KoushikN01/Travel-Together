import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  Alert,
  Snackbar,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Hotel, LocationOn, AccessTime, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';

const HotelManagement = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    hotelName: '',
    address: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    price: '',
    bookingReference: '',
    amenities: '',
    notes: ''
  });

  useEffect(() => {
    loadHotels();
  }, [tripId]);

  const loadHotels = async () => {
    try {
      console.log('Loading hotels for trip:', tripId);
      setLoading(true);
      setError('');
      
      // Get hotels directly from the hotels endpoint
      const response = await tripService.getHotels(tripId);
      console.log('Hotels response:', response);
      
      if (!response || !Array.isArray(response)) {
        console.error('Invalid response format:', response);
        setError('Error loading hotels: Invalid response format');
        return;
      }

      // Map the hotels to the required format
      const formattedHotels = response.map(hotel => ({
        _id: hotel._id,
        hotelName: hotel.hotelName,
        address: hotel.address,
        checkIn: new Date(hotel.checkIn).toISOString(),
        checkOut: new Date(hotel.checkOut).toISOString(),
        roomType: hotel.roomType || '',
        price: hotel.price || '',
        bookingReference: hotel.bookingReference || '',
        amenities: hotel.amenities || '',
        notes: hotel.notes || ''
      }));

      console.log('Formatted hotels:', formattedHotels);
      setHotels(formattedHotels);
    } catch (error) {
      console.error('Error loading hotels:', error);
      setError(error.response?.data?.message || 'Error loading hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hotel = null) => {
    if (hotel) {
      setSelectedHotel(hotel);
      // Format dates for datetime-local input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        hotelName: hotel.hotelName || '',
        address: hotel.address || '',
        checkIn: formatDateForInput(hotel.checkIn),
        checkOut: formatDateForInput(hotel.checkOut),
        roomType: hotel.roomType || '',
        price: hotel.price || '',
        bookingReference: hotel.bookingReference || '',
        amenities: hotel.amenities || '',
        notes: hotel.notes || ''
      });
    } else {
      setSelectedHotel(null);
      setFormData({
        hotelName: '',
        address: '',
        checkIn: '',
        checkOut: '',
        roomType: '',
        price: '',
        bookingReference: '',
        amenities: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHotel(null);
    setError('');
    setFormData({
      hotelName: '',
      address: '',
      checkIn: '',
      checkOut: '',
      roomType: '',
      price: '',
      bookingReference: '',
      amenities: '',
      notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveHotel = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      const requiredFields = ['hotelName', 'address', 'checkIn', 'checkOut'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Format dates to ISO strings
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);

      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        setError('Invalid date format for check-in or check-out time');
        return;
      }

      if (checkOut <= checkIn) {
        setError('Check-out time must be after check-in time');
        return;
      }

      // Format the hotel data
      const formattedHotelData = {
        hotelName: formData.hotelName.trim(),
        address: formData.address.trim(),
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        roomType: formData.roomType?.trim() || '',
        price: formData.price ? Number(formData.price) : 0,
        bookingReference: formData.bookingReference?.trim() || '',
        amenities: formData.amenities?.trim() || '',
        notes: formData.notes?.trim() || ''
      };

      console.log('Saving hotel with data:', formattedHotelData);
      console.log('Trip ID:', tripId);
      console.log('Selected hotel:', selectedHotel);

      if (selectedHotel) {
        console.log('Updating existing hotel');
        await tripService.updateHotel(tripId, selectedHotel._id, formattedHotelData);
      } else {
        console.log('Adding new hotel');
        await tripService.addHotel(tripId, formattedHotelData);
      }

      console.log('Hotel saved successfully');
      setSuccess('Hotel saved successfully');
      handleCloseDialog();
      await loadHotels();
    } catch (err) {
      console.error('Error saving hotel:', err);
      setError(err.message || 'Error saving hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    try {
      setLoading(true);
      await tripService.deleteHotel(tripId, hotelId);
      setSuccess('Hotel deleted successfully');
      await loadHotels();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Trip
        </Button>
        <Typography variant="h4" component="h1">
          Hotel Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Add Hotel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : hotels.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No hotels added yet. Click "Add Hotel" to get started.
          </Typography>
        </Box>
      ) : (
      <List>
        {hotels.map((hotel) => (
          <ListItem
            key={hotel._id}
            sx={{
              mb: 2,
                border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
            }}
          >
            <ListItemText
              primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Hotel color="primary" />
                    <Typography variant="h6">{hotel.hotelName}</Typography>
                  </Box>
              }
              secondary={
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">{hotel.address}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2">
                        Check-in: {new Date(hotel.checkIn).toLocaleString()} | Check-out: {new Date(hotel.checkOut).toLocaleString()}
                    </Typography>
                    </Box>
                    {hotel.roomType && (
                      <Typography variant="body2">Room Type: {hotel.roomType}</Typography>
                    )}
                    {hotel.price && (
                      <Typography variant="body2">Price: {hotel.price}</Typography>
                    )}
                    {hotel.bookingReference && (
                      <Typography variant="body2">Booking Ref: {hotel.bookingReference}</Typography>
                  )}
                </Stack>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                  aria-label="edit"
                onClick={() => handleOpenDialog(hotel)}
                sx={{ mr: 1 }}
              >
                <Edit />
              </IconButton>
              <IconButton
                edge="end"
                  aria-label="delete"
                onClick={() => handleDeleteHotel(hotel._id)}
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedHotel ? 'Edit Hotel' : 'Add New Hotel'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              required
              label="Hotel Name"
              name="hotelName"
              value={formData.hotelName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="Check-in"
              name="checkIn"
              type="datetime-local"
              value={formData.checkIn}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              label="Check-out"
              name="checkOut"
              type="datetime-local"
              value={formData.checkOut}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Room Type"
              name="roomType"
              value={formData.roomType}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Booking Reference"
              name="bookingReference"
              value={formData.bookingReference}
              onChange={handleInputChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveHotel}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HotelManagement; 