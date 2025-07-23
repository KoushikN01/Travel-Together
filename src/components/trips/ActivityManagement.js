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
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  DirectionsWalk,
  AccessTime,
  LocationOn,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../contexts/AuthContext';

const ActivityManagement = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [activityData, setActivityData] = useState({
    title: '',
    category: '',
    location: '',
    date: '',
    startTime: '',
    duration: '',
    cost: '',
    description: '',
    bookingReference: '',
    createdBy: user?._id || '',
  });

  useEffect(() => {
    fetchActivities();
    fetchCategories();
  }, [tripId]);

  useEffect(() => {
    if (user?._id) {
      setActivityData(prev => ({
        ...prev,
        createdBy: user._id
      }));
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await tripService.getActivities(tripId);
      console.log('Fetched activities:', data);
      
      // Check if data and itinerary exist
      if (!data || !data.itinerary) {
        console.log('No itinerary data found, initializing empty activities array');
        setActivities([]);
        return;
      }
      
      // Extract activities from all days in the itinerary
      const allActivities = data.itinerary.reduce((acc, day) => {
        if (day && day.activities && day.activities.length > 0) {
          return [...acc, ...day.activities];
        }
        return acc;
      }, []);
      
      // Sort activities by date and time
      const sortedActivities = allActivities.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() === dateB.getTime()) {
          return a.startTime.localeCompare(b.startTime);
        }
        return dateA.getTime() - dateB.getTime();
      });
      
      console.log('Sorted activities:', sortedActivities);
      setActivities(sortedActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await tripService.getActivityCategories(tripId);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleOpenDialog = (activity = null) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please log in to manage activities',
        severity: 'error'
      });
      return;
    }

    if (activity) {
      setSelectedActivity(activity);
      setActivityData(activity);
    } else {
      setSelectedActivity(null);
      setActivityData({
        title: '',
        category: '',
        location: '',
        date: '',
        startTime: '',
        duration: '',
        cost: '',
        description: '',
        bookingReference: '',
        createdBy: user._id,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedActivity(null);
    setError('');
  };

  const handleSaveActivity = async () => {
    try {
      if (!user) {
        throw new Error('Please log in to add activities');
      }

      // Validate required fields
      const requiredFields = ['title', 'date', 'startTime'];
      const missingFields = requiredFields.filter(field => !activityData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(activityData.startTime)) {
        throw new Error('Invalid time format. Use HH:MM format');
      }

      // Validate date
      const date = new Date(activityData.date);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }

      // Format the activity data
      const formattedData = {
        ...activityData,
        title: activityData.title.trim(),
        description: activityData.description?.trim() || '',
        location: activityData.location?.trim() || '',
        duration: activityData.duration?.trim() || '',
        cost: activityData.cost ? Number(activityData.cost) : 0,
        bookingReference: activityData.bookingReference?.trim() || '',
        createdBy: user._id,
        type: 'activity',
        date: new Date(activityData.date).toISOString(),
        startTime: activityData.startTime, // Keep as string in HH:MM format
        updatedAt: new Date().toISOString()
      };

      setLoading(true);
      console.log('Saving activity with data:', formattedData);

      if (selectedActivity) {
        await tripService.updateActivity(tripId, selectedActivity._id, formattedData);
      } else {
        await tripService.addActivity(tripId, formattedData);
      }

      setSnackbar({
        open: true,
        message: `Activity ${selectedActivity ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
      handleCloseDialog();
      fetchActivities();
    } catch (err) {
      console.error('Error saving activity:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      setLoading(true);
      await tripService.deleteActivity(tripId, activityId);
      setSnackbar({
        open: true,
        message: 'Activity deleted successfully',
        severity: 'success'
      });
      fetchActivities();
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

  const handleBack = () => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Trip
        </Button>
        <Typography variant="h4" component="h1">
          Activity Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Activity
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : activities.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No activities added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click the "Add Activity" button to create your first activity
          </Typography>
        </Box>
      ) : (
        <List>
          {activities.map((activity) => (
            <ListItem
              key={activity._id}
              sx={{
                mb: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DirectionsWalk />
                    <Typography variant="h6">
                      {activity.title}
                    </Typography>
                    {activity.category && (
                      <Chip
                        label={activity.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                }
                secondary={
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {activity.location && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">
                          {activity.location}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime fontSize="small" />
                      <Typography variant="body2">
                        {new Date(activity.date).toLocaleDateString()} at {activity.startTime}
                        {activity.duration && ` (${activity.duration})`}
                      </Typography>
                    </Stack>
                    {activity.description && (
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                    )}
                    {activity.cost > 0 && (
                      <Typography variant="body2">
                        Cost: ₹{activity.cost}
                      </Typography>
                    )}
                    {activity.bookingReference && (
                      <Typography variant="body2">
                        Booking Reference: {activity.bookingReference}
                      </Typography>
                    )}
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(activity)}
                  sx={{ mr: 1 }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteActivity(activity._id)}
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
          {selectedActivity ? 'Edit Activity' : 'Add Activity'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              value={activityData.title}
              onChange={(e) => setActivityData({ ...activityData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Category"
              value={activityData.category}
              onChange={(e) => setActivityData({ ...activityData, category: e.target.value })}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Location"
              value={activityData.location}
              onChange={(e) => setActivityData({ ...activityData, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={activityData.date}
              onChange={(e) => setActivityData({ ...activityData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Start Time"
              type="time"
              value={activityData.startTime}
              onChange={(e) => setActivityData({ ...activityData, startTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Duration"
              value={activityData.duration}
              onChange={(e) => setActivityData({ ...activityData, duration: e.target.value })}
              fullWidth
              placeholder="e.g., 2 hours"
            />
            <TextField
              label="Cost"
              type="number"
              value={activityData.cost}
              onChange={(e) => setActivityData({ ...activityData, cost: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography>₹</Typography>
              }}
            />
            <TextField
              label="Description"
              value={activityData.description}
              onChange={(e) => setActivityData({ ...activityData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Booking Reference"
              value={activityData.bookingReference}
              onChange={(e) => setActivityData({ ...activityData, bookingReference: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveActivity} 
            variant="contained"
            disabled={!activityData.title || !activityData.date || !activityData.startTime}
          >
            {selectedActivity ? 'Update' : 'Add'} Activity
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ActivityManagement; 