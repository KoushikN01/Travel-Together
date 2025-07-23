import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Paper,
  Chip,
  InputLabel,
  FormControl,
  Select,
  OutlinedInput
} from '@mui/material';

const INTEREST_OPTIONS = [
  'Art', 'Food', 'History', 'Nature', 'Adventure', 'Shopping', 'Nightlife', 'Culture', 'Relaxation', 'Sports', 'Technology', 'Music', 'Festivals', 'Family', 'Romance', 'Photography', 'Wildlife', 'Beaches', 'Mountains', 'Local Events'
];

const ItineraryGenerator = () => {
  const [form, setForm] = useState({
    destination: '',
    days: 1,
    interests: [],
    budget: '',
    groupSize: 1
  });
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'days' || name === 'groupSize' ? Number(value) : value
    }));
  };

  const handleInterestsChange = e => {
    setForm(prev => ({ ...prev, interests: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setItinerary(null);
    try {
      const res = await axios.post('/api/ai/itinerary', {
        ...form,
        interests: form.interests
      });
      setItinerary(res.data);
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
    }
    setLoading(false);
  };

  // Helper to render structured itinerary if JSON
  const renderItinerary = (data) => {
    if (!data) return null;
    if (typeof data === 'string') {
      // Try to parse JSON if possible
      try {
        const parsed = JSON.parse(data);
        return renderItinerary(parsed);
      } catch {
        return <Typography>{data}</Typography>;
      }
    }
    if (typeof data === 'object' && Array.isArray(data.days)) {
      return (
        <Box>
          {data.days.map((day, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 2 }} elevation={2}>
              <Typography variant="h6">Day {idx + 1}</Typography>
              {day.morning && <Typography><b>Morning:</b> {day.morning}</Typography>}
              {day.afternoon && <Typography><b>Afternoon:</b> {day.afternoon}</Typography>}
              {day.evening && <Typography><b>Evening:</b> {day.evening}</Typography>}
              {day.restaurants && <Typography><b>Restaurants:</b> {day.restaurants}</Typography>}
              {day.events && <Typography><b>Events:</b> {day.events}</Typography>}
            </Paper>
          ))}
        </Box>
      );
    }
    // fallback
    return <pre style={{ background: '#f4f4f4', padding: 10, borderRadius: 4 }}>{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, p: { xs: 2, sm: 4 }, background: '#fff', borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={2} align="center" color="primary">AI-Powered Itinerary Generator</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="destination"
          label="Destination"
          value={form.destination}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          name="days"
          label="Number of Days"
          type="number"
          inputProps={{ min: 1, max: 30 }}
          value={form.days}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="interests-label">Interests</InputLabel>
          <Select
            labelId="interests-label"
            multiple
            name="interests"
            value={form.interests}
            onChange={handleInterestsChange}
            input={<OutlinedInput label="Interests" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {INTEREST_OPTIONS.map((interest) => (
              <MenuItem key={interest} value={interest}>{interest}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          name="budget"
          label="Budget (e.g. moderate, luxury)"
          value={form.budget}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="groupSize"
          label="Group Size"
          type="number"
          inputProps={{ min: 1, max: 20 }}
          value={form.groupSize}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Itinerary'}
          </Button>
        </Box>
      </form>
      {error && <Typography color="error" mt={2} align="center">{error}</Typography>}
      {itinerary && (
        <Box mt={4}>
          <Typography variant="h5" fontWeight={600} mb={2} color="secondary">Your AI-Generated Itinerary</Typography>
          {renderItinerary(itinerary)}
        </Box>
      )}
    </Box>
  );
};

export default ItineraryGenerator; 