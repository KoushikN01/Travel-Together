import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  MenuItem,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Share,
  Download,
  WbSunny,
  Favorite,
  LocationOn,
  AttachFile,
  Add as AddIcon,
  BookOnline,
} from '@mui/icons-material';
import recommendationService from '../../services/recommendationService';
import documentService from '../../services/documentService';
import { useItinerary } from '../../contexts/ItineraryContext';

const TripRecommendations = ({ tripId, destinations }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [weatherSuggestions, setWeatherSuggestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [userInterests, setUserInterests] = useState('');
  const [weatherCity, setWeatherCity] = useState('');
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { addToItinerary } = useItinerary();

  useEffect(() => {
    fetchRecommendations();
    fetchDocuments();
    if (destinations && destinations.length > 0) {
      setWeatherCity(destinations[0]);
    }
  }, [tripId, destinations]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Only fetch weather suggestions if a city is provided
      const weatherPromise = weatherCity 
        ? recommendationService.getWeatherBasedSuggestions(weatherCity)
        : Promise.resolve([]);
      
      const [personalizedRecs, weatherRecs] = await Promise.all([
        recommendationService.getPersonalizedRecommendations(tripId, userInterests),
        weatherPromise
      ]);
      
      setRecommendations(personalizedRecs);
      setWeatherSuggestions(weatherRecs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (activity) => {
    setSelectedActivity(activity);
    setBookingDialog(true);
  };

  const handleBookingConfirm = async () => {
    try {
      // Here you would typically make an API call to book the activity
      setSnackbar({
        open: true,
        message: `Successfully booked ${selectedActivity.title}!`,
        severity: 'success'
      });
      setBookingDialog(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to book activity. Please try again.',
        severity: 'error'
      });
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await documentService.getDocuments(tripId);
      setDocuments(docs);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !documentType) {
      setSnackbar({
        open: true,
        message: 'Please select a file and document type.',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      await documentService.uploadDocument(tripId, selectedFile, documentType);
      setSnackbar({
        open: true,
        message: 'Document uploaded successfully!',
        severity: 'success'
      });
      await fetchDocuments();
      setUploadDialog(false);
      setSelectedFile(null);
      setDocumentType('');
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: `Failed to upload document: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await documentService.deleteDocument(tripId, documentId);
      setSnackbar({
        open: true,
        message: 'Document deleted successfully!',
        severity: 'success'
      });
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: `Failed to delete document: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      // The server now handles the redirect to Cloudinary URL
      window.open(documentService.getDownloadUrl(tripId, documentId), '_blank');
      setSnackbar({
        open: true,
        message: 'Document download initiated.',
        severity: 'info'
      });
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: `Failed to download document: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const documentTypes = [
    { value: 'ticket', label: 'Flight/Train Ticket' },
    { value: 'hotel_booking', label: 'Hotel Booking' },
    { value: 'visa', label: 'Visa' },
    { value: 'passport', label: 'Passport' },
    { value: 'itinerary', label: 'Itinerary' },
    { value: 'insurance', label: 'Travel Insurance' },
    { value: 'photo', label: 'Photo' },
    { value: 'other', label: 'Other' },
  ];

  // Add handler for Add to Itinerary
  const handleAddToItinerary = (item) => {
    try {
      addToItinerary(item);
      setSnackbar({
        open: true,
        message: `Added to itinerary!`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add to itinerary.',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customize Your Recommendations
        </Typography>
        <TextField
          label="Your Interests (e.g., museums, hiking, food)"
          fullWidth
          value={userInterests}
          onChange={(e) => setUserInterests(e.target.value)}
          margin="normal"
        />
        <TextField
          label="City for Weather Prediction (e.g., London)"
          fullWidth
          value={weatherCity}
          onChange={(e) => setWeatherCity(e.target.value)}
          margin="normal"
          required
          error={!weatherCity}
          helperText={!weatherCity ? "City is required for weather predictions" : ""}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={fetchRecommendations}
          sx={{ mt: 2 }}
          disabled={loading || !weatherCity}
        >
          Get Personalized Recommendations
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personalized Recommendations
        </Typography>
        {loading && <CircularProgress sx={{ display: 'block', margin: '0 auto' }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && recommendations.length === 0 && (
          <Typography variant="body2" color="text.secondary">No personalized recommendations yet. Try adding your interests!</Typography>
        )}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {recommendations.map((rec) => (
            <Grid item xs={12} sm={6} md={4} key={rec.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={rec.image || 'https://source.unsplash.com/random/300x200/?travel'}
                  alt={rec.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {rec.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rec.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip icon={<LocationOn />} label={rec.location} size="small" />
                    <Chip icon={<Favorite />} label={`${rec.rating}★`} size="small" />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<BookOnline />}
                      onClick={() => handleBookingClick(rec)}
                      fullWidth
                    >
                      Book Now
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddToItinerary(rec)}
                      fullWidth
                    >
                      Add to Itinerary
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Weather-based Activity Suggestions
        </Typography>
        {loading && <CircularProgress sx={{ display: 'block', margin: '0 auto' }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && weatherSuggestions.length === 0 && (
          <Typography variant="body2" color="text.secondary">No weather suggestions yet. Enter a city and try!</Typography>
        )}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {weatherSuggestions.map((suggestion) => (
            <Grid item xs={12} sm={6} key={suggestion.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <WbSunny color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {suggestion.activity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.weather} - {suggestion.recommendation}
                      </Typography>
                      {suggestion.temperature && (
                        <Typography variant="body2" color="text.secondary">
                          Temperature: {suggestion.temperature}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="column" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<BookOnline />}
                        onClick={() => handleBookingClick(suggestion)}
                        size="small"
                      >
                        Book
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddToItinerary(suggestion)}
                        size="small"
                      >
                        Add to Itinerary
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Travel Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialog(true)}
          >
            Upload New Document
          </Button>
        </Box>
        <List>
          {documents.length === 0 && !loading && !error && (
            <Typography variant="body2" color="text.secondary">No documents uploaded yet.</Typography>
          )}
          {documents.map((doc) => (
            <ListItem
              key={doc._id}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton edge="end" aria-label="download" onClick={() => handleDownloadDocument(doc._id)}>
                    <Download />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDocument(doc._id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={doc.fileName}
                secondary={`Type: ${doc.fileType} | Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<AttachFile />}
            >
              {selectedFile ? selectedFile.name : 'Choose File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <FormControl fullWidth margin="normal">
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                labelId="document-type-label"
                value={documentType}
                label="Document Type"
                onChange={(e) => setDocumentType(e.target.value)}
              >
                {documentTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={loading || !selectedFile || !documentType}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)}>
        <DialogTitle>Book Activity</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedActivity.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedActivity.description}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Location: {selectedActivity.location}
              </Typography>
              {selectedActivity.priceRange && (
                <Typography variant="body2">
                  Price Range: {selectedActivity.priceRange}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button onClick={handleBookingConfirm} variant="contained">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TripRecommendations; 