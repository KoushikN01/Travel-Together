import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tripService } from '../../services/tripService';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Star,
  SmartToy,
  Support,
  Analytics,
  Group,
  People as PeopleIcon,
} from '@mui/icons-material';
import CollaborationInvitations from './CollaborationInvitations';

const TripList = () => {
  console.log('TripList component rendering...');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips();
      setTrips(response.data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (trip = null) => {
    if (trip) {
      setSelectedTrip(trip);
      setEditForm({
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
        endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setSelectedTrip(null);
      setEditForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTrip(null);
    setEditForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTrip) {
        await tripService.updateTrip(selectedTrip._id, editForm);
        toast.success('Trip updated successfully');
      } else {
        await tripService.createTrip(editForm);
        toast.success('Trip created successfully');
      }
      handleCloseDialog();
      loadTrips();
    } catch (err) {
      toast.error(err.message || 'Failed to save trip');
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripService.deleteTrip(tripId);
        toast.success('Trip deleted successfully');
        loadTrips();
      } catch (err) {
        toast.error(err.message || 'Failed to delete trip');
      }
    }
  };

  const handleViewDetails = (trip) => {
    navigate(`/trips/${trip._id}`);
  };

  const handleCollaboration = (tripId) => {
    navigate(`/trips/${tripId}/collaboration`);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">My Trips</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create New Trip
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <CollaborationInvitations />
      </Box>

      <Grid container spacing={3}>
        {trips.map((trip, idx) => {
          // Map each trip to a specific image file from public/my trips/
          // You can adjust this mapping as needed
          const tripImages = [
            'download (1).png',
            'download (1).jpeg',
            'download.jpeg',
            'download.png',
            'download1.jpeg',
            'images.jpeg',
          ];
          // Use idx to select image, fallback to first if out of range
          const imageFile = tripImages[idx % tripImages.length];
          const imagePath = `/my trips/${imageFile}`;
          return (
            <Grid item xs={12} sm={6} md={4} key={trip._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Trip Image */}
                <img
                  src={imagePath}
                  alt={trip.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}
                  onError={e => { e.target.onerror = null; e.target.src = '/my trips/images.jpeg'; }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {trip.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {trip.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={new Date(trip.startDate).toLocaleDateString()}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={new Date(trip.endDate).toLocaleDateString()}
                      size="small"
                    />
                  </Box>
                  {renderFeatures(trip)}
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleCollaboration(trip._id)} 
                      color="primary" 
                      title="Collaboration"
                      sx={{ 
                        background: '#f5f5f5',
                        color: '#333333',
                        border: '1px solid #e0e0e0',
                        '&:hover': { 
                          background: '#eeeeee',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <PeopleIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDialog(trip)} 
                      color="primary" 
                      title="Edit Trip"
                      sx={{ 
                        background: '#f5f5f5',
                        color: '#333333',
                        border: '1px solid #e0e0e0',
                        '&:hover': { 
                          background: '#eeeeee',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(trip._id)} 
                      color="error" 
                      title="Delete Trip"
                      sx={{ 
                        background: '#f5f5f5',
                        color: '#333333',
                        border: '1px solid #e0e0e0',
                        '&:hover': { 
                          background: '#eeeeee',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTrip ? 'Edit Trip' : 'Create New Trip'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={editForm.startDate}
              onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={editForm.endDate}
              onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedTrip ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default TripList; 