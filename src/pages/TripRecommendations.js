import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardMedia, Button, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, ListItemAvatar, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Stack, Alert, CircularProgress, Badge, MenuItem, Select, FormControl, InputLabel, Skeleton
} from '@mui/material';
import {
  CloudUpload, Delete, Share, Download, WbSunny, Favorite, LocationOn, AttachFile, ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryDrawer from '../components/ItineraryDrawer';
import { tripService } from '../services/tripService';
import recommendationService from '../services/recommendationService';

const TripRecommendations = () => {
  const { addToItinerary } = useItinerary();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [userInterests, setUserInterests] = useState('');
  const [weatherCity, setWeatherCity] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [weatherSuggestions, setWeatherSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bookedIds, setBookedIds] = useState([]); // Track booked recommendations by id

  // Fetch user's trips on mount
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const tripsData = await tripService.getAllTrips();
        setTrips(tripsData);
        if (tripsData.length > 0) {
          setSelectedTripId(tripsData[0]._id);
          if (tripsData[0].destinations && tripsData[0].destinations.length > 0) {
            setWeatherCity(tripsData[0].destinations[0]);
          }
        }
      } catch (err) {
        setError('Failed to fetch trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // Fetch recommendations when trip or user input changes
  useEffect(() => {
    const fetchRecs = async () => {
      if (!selectedTripId) return;
      setLoading(true);
      setError('');
      try {
        const [personalized, weather] = await Promise.all([
          recommendationService.getPersonalizedRecommendations(selectedTripId, userInterests),
          weatherCity ? recommendationService.getWeatherBasedSuggestions(weatherCity) : Promise.resolve([])
        ]);
        setRecommendations(personalized);
        setWeatherSuggestions(weather);
      } catch (err) {
        setError(err.message || 'Failed to fetch recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [selectedTripId, userInterests, weatherCity]);

  // Add to Itinerary (prevent duplicates)
  const handleAddToItinerary = (item) => {
    try {
      addToItinerary(item);
      setSnackbar({ open: true, message: 'Added to itinerary!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add to itinerary.', severity: 'error' });
    }
  };

  // Book recommendation (in-place, no redirect)
  const handleBook = (item) => {
    if (!bookedIds.includes(item.id || item._id)) {
      setBookedIds(prev => [...prev, item.id || item._id]);
      // Optionally add to itinerary if not already present
      handleAddToItinerary(item);
      setSnackbar({ open: true, message: 'Booked successfully!', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Already booked!', severity: 'info' });
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3, position: 'relative', zIndex: 1 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Trip Recommendations</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="trip-picker-label">Select Trip</InputLabel>
          <Select
            labelId="trip-picker-label"
            value={selectedTripId}
            label="Select Trip"
            onChange={e => {
              setSelectedTripId(e.target.value);
              const trip = trips.find(t => t._id === e.target.value);
              if (trip && trip.destinations && trip.destinations.length > 0) {
                setWeatherCity(trip.destinations[0]);
              }
            }}
          >
            {trips.map(trip => (
              <MenuItem key={trip._id} value={trip._id}>
                {trip.destinations && trip.destinations.length > 0 ? trip.destinations.join(', ') : 'Unnamed Trip'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Your Interests (e.g., museums, hiking, food)"
          fullWidth
          value={userInterests}
          onChange={e => setUserInterests(e.target.value)}
          margin="normal"
        />
        <TextField
          label="City for Weather Prediction (e.g., London)"
          fullWidth
          value={weatherCity}
          onChange={e => setWeatherCity(e.target.value)}
          margin="normal"
        />
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
        <Typography variant="h6">Personalized Recommendations</Typography>
        <IconButton color="primary" onClick={() => setDrawerOpen(true)} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }, position: 'relative', zIndex: 2 }}>
          <CartIcon />
        </IconButton>
      </Box>
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(3)].map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={2}>
          {recommendations.map((rec) => {
            const isBooked = bookedIds.includes(rec.id || rec._id);
            return (
              <Grid item xs={12} sm={6} md={4} key={rec.id || rec._id}>
                <Card>
                  {rec.image && (
                    <CardMedia component="img" height="140" image={rec.image} alt={rec.title} />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{rec.title}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{rec.description}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {rec.location && <Chip icon={<LocationOn />} label={rec.location} size="small" />}
                      {rec.category && <Chip icon={<Favorite />} label={rec.category} size="small" />}
                      {isBooked && <Chip label="Booked" color="success" size="small" />}
                    </Stack>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="outlined" fullWidth onClick={() => { setSelectedRecommendation(rec); setShowDetails(true); }}>View Details</Button>
                      <Button variant="contained" fullWidth onClick={() => handleAddToItinerary(rec)} disabled={isBooked}>Add to Itinerary</Button>
                      <Button variant="contained" color="success" fullWidth onClick={() => handleBook(rec)} disabled={isBooked}>{isBooked ? 'Booked' : 'Book'}</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Weather-Based Suggestions</Typography>
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(2)].map((_, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List>
          {weatherSuggestions.map((suggestion) => {
            const isBooked = bookedIds.includes(suggestion.id || suggestion._id);
            return (
              <ListItem key={suggestion.id || suggestion._id}>
                <ListItemAvatar>
                  <Avatar><WbSunny /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={suggestion.title || suggestion.activity}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">{suggestion.description || suggestion.recommendation}</Typography>
                      {suggestion.weather && <Typography variant="caption" display="block">Weather: {suggestion.weather}</Typography>}
                      {isBooked && <Chip label="Booked" color="success" size="small" sx={{ ml: 1 }} />}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small" onClick={() => handleAddToItinerary(suggestion)} disabled={isBooked}>Add to Itinerary</Button>
                  <Button variant="contained" color="success" size="small" onClick={() => handleBook(suggestion)} disabled={isBooked} sx={{ ml: 1 }}>{isBooked ? 'Booked' : 'Book'}</Button>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      )}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        {selectedRecommendation && (
          <>
            <DialogTitle>{selectedRecommendation.title}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Details</Typography>
                  <List dense>
                    {selectedRecommendation.location && <ListItem><ListItemText primary="Location" secondary={selectedRecommendation.location} /></ListItem>}
                    {selectedRecommendation.category && <ListItem><ListItemText primary="Category" secondary={selectedRecommendation.category} /></ListItem>}
                    {selectedRecommendation.duration && <ListItem><ListItemText primary="Duration" secondary={selectedRecommendation.duration} /></ListItem>}
                    {selectedRecommendation.priceRange && <ListItem><ListItemText primary="Price Range" secondary={selectedRecommendation.priceRange} /></ListItem>}
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Additional Information</Typography>
                  <Typography variant="body2" paragraph>{selectedRecommendation.additionalInfo || selectedRecommendation.description}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
              <Button variant="contained" onClick={() => handleAddToItinerary(selectedRecommendation)} disabled={bookedIds.includes(selectedRecommendation.id || selectedRecommendation._id)}>Add to Itinerary</Button>
              <Button variant="contained" color="success" onClick={() => handleBook(selectedRecommendation)} disabled={bookedIds.includes(selectedRecommendation.id || selectedRecommendation._id)}>{bookedIds.includes(selectedRecommendation.id || selectedRecommendation._id) ? 'Booked' : 'Book'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <ItineraryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
};

export default TripRecommendations; 