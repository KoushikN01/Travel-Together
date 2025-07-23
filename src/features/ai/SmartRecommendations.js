import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CardActionArea
} from '@mui/material';
import recommendationService from './recommendationService';

const SmartRecommendations = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    budget: '',
    preferredSeason: '',
    category: ''
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await recommendationService.getRecommendations(preferences);
      setRecommendations(response.recommendations || []);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationClick = (destination) => {
    // Navigate to booking page with destination details
    navigate('/booking', {
      state: {
        destination: destination.destination,
        estimatedCost: destination.estimatedCost,
        bestTimeToVisit: destination.bestTimeToVisit,
        category: destination.category
      }
    });
  };

  const seasons = [
    { value: 'Summer', label: 'Summer' },
    { value: 'Winter', label: 'Winter' },
    { value: 'Spring', label: 'Spring' },
    { value: 'Fall', label: 'Fall' }
  ];

  const categories = [
    { value: 'City', label: 'City' },
    { value: 'Beach', label: 'Beach' },
    { value: 'Island', label: 'Island' },
    { value: 'Mountain', label: 'Mountain' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI-Powered Travel Recommendations
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              value={preferences.budget}
              onChange={handleInputChange}
              placeholder="e.g., 2000"
              inputProps={{
                'data-testid': 'budget-input'
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Preferred Season</InputLabel>
              <Select
                name="preferredSeason"
                value={preferences.preferredSeason}
                onChange={handleInputChange}
                label="Preferred Season"
                inputProps={{
                  'data-testid': 'season-input'
                }}
              >
                {seasons.map((season) => (
                  <MenuItem key={season.value} value={season.value}>
                    {season.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={preferences.category}
                onChange={handleInputChange}
                label="Category"
                inputProps={{
                  'data-testid': 'category-input'
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {recommendations.length > 0 && (
        <Grid container spacing={3}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardActionArea onClick={() => handleDestinationClick(rec)}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {rec.destination}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rec.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">
                        Estimated Cost: {rec.estimatedCost}
                      </Typography>
                      <Typography variant="subtitle2">
                        Best Time to Visit: {rec.bestTimeToVisit}
                      </Typography>
                      <Typography variant="subtitle2">
                        Category: {rec.category}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        size="small"
                      >
                        Book Now
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SmartRecommendations; 