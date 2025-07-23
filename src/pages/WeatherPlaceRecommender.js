import React, { useState } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, CircularProgress, ToggleButton, ToggleButtonGroup, Alert, useTheme, TextField, InputAdornment } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import SearchIcon from '@mui/icons-material/Search';
import weatherService from '../services/weatherService';

const cityGroups = {
  cool: [
    { name: 'San Francisco', country: 'US' },
    { name: 'Vancouver', country: 'CA' },
    { name: 'Melbourne', country: 'AU' },
    { name: 'Cape Town', country: 'ZA' },
    { name: 'Edinburgh', country: 'GB' },
    { name: 'Auckland', country: 'NZ' },
    { name: 'Lisbon', country: 'PT' },
    { name: 'Seattle', country: 'US' },
    { name: 'Buenos Aires', country: 'AR' },
    { name: 'Barcelona', country: 'ES' },
    { name: 'Zurich', country: 'CH' },
    { name: 'London', country: 'GB' },
    { name: 'Dublin', country: 'IE' },
    { name: 'Wellington', country: 'NZ' },
    { name: 'Brussels', country: 'BE' },
    { name: 'Munich', country: 'DE' },
    { name: 'Geneva', country: 'CH' },
    { name: 'Portland', country: 'US' },
    { name: 'Copenhagen', country: 'DK' },
    { name: 'Amsterdam', country: 'NL' },
    // Indian cities
    { name: 'Shimla', country: 'IN' },
    { name: 'Ooty', country: 'IN' },
    { name: 'Munnar', country: 'IN' },
    { name: 'Darjeeling', country: 'IN' },
    { name: 'Leh', country: 'IN' },
    { name: 'Gangtok', country: 'IN' },
    { name: 'Kodaikanal', country: 'IN' },
    { name: 'Coorg', country: 'IN' },
    { name: 'Mahabaleshwar', country: 'IN' },
    { name: 'Mount Abu', country: 'IN' },
  ],
  summer: [
    { name: 'Dubai', country: 'AE' },
    { name: 'Bangkok', country: 'TH' },
    { name: 'Cairo', country: 'EG' },
    { name: 'Miami', country: 'US' },
    { name: 'Athens', country: 'GR' },
    { name: 'Bali', country: 'ID' },
    { name: 'Cancun', country: 'MX' },
    { name: 'Rio de Janeiro', country: 'BR' },
    { name: 'Marrakech', country: 'MA' },
    { name: 'Phuket', country: 'TH' },
    { name: 'Honolulu', country: 'US' },
    { name: 'Ibiza', country: 'ES' },
    { name: 'Tel Aviv', country: 'IL' },
    { name: 'Goa', country: 'IN' },
    { name: 'Kuala Lumpur', country: 'MY' },
    { name: 'Lagos', country: 'NG' },
    { name: 'Seychelles', country: 'SC' },
    { name: 'Maldives', country: 'MV' },
    { name: 'Santorini', country: 'GR' },
    { name: 'Los Angeles', country: 'US' },
    // Indian cities
    { name: 'Chennai', country: 'IN' },
    { name: 'Hyderabad', country: 'IN' },
    { name: 'Ahmedabad', country: 'IN' },
    { name: 'Nagpur', country: 'IN' },
    { name: 'Pune', country: 'IN' },
    { name: 'Bengaluru', country: 'IN' },
    { name: 'Kolkata', country: 'IN' },
    { name: 'Delhi', country: 'IN' },
    { name: 'Mumbai', country: 'IN' },
    { name: 'Jaipur', country: 'IN' },
  ],
  fog: [
    { name: 'San Francisco', country: 'US' },
    { name: 'London', country: 'GB' },
    { name: 'Lima', country: 'PE' },
    { name: 'Chongqing', country: 'CN' },
    { name: 'Cape Town', country: 'ZA' },
    { name: 'Seattle', country: 'US' },
    { name: 'Hamburg', country: 'DE' },
    { name: 'Vancouver', country: 'CA' },
    { name: 'Brussels', country: 'BE' },
    { name: 'Dublin', country: 'IE' },
    { name: 'Shanghai', country: 'CN' },
    { name: 'Quito', country: 'EC' },
    { name: 'Edinburgh', country: 'GB' },
    { name: 'Oslo', country: 'NO' },
    { name: 'Lisbon', country: 'PT' },
    { name: 'Amsterdam', country: 'NL' },
    { name: 'Prague', country: 'CZ' },
    { name: 'Zurich', country: 'CH' },
    { name: 'Paris', country: 'FR' },
    { name: 'Stockholm', country: 'SE' },
    // Indian cities
    { name: 'Munnar', country: 'IN' },
    { name: 'Kodaikanal', country: 'IN' },
    { name: 'Ooty', country: 'IN' },
    { name: 'Shillong', country: 'IN' },
    { name: 'Darjeeling', country: 'IN' },
    { name: 'Cherrapunji', country: 'IN' },
    { name: 'Coorg', country: 'IN' },
    { name: 'Mahabaleshwar', country: 'IN' },
    { name: 'Pachmarhi', country: 'IN' },
    { name: 'Nainital', country: 'IN' },
  ],
  snowy: [
    { name: 'Reykjavik', country: 'IS' },
    { name: 'Moscow', country: 'RU' },
    { name: 'Oslo', country: 'NO' },
    { name: 'Helsinki', country: 'FI' },
    { name: 'Stockholm', country: 'SE' },
    { name: 'Zurich', country: 'CH' },
    { name: 'Geneva', country: 'CH' },
    { name: 'Munich', country: 'DE' },
    { name: 'Denver', country: 'US' },
    { name: 'Quebec', country: 'CA' },
    { name: 'Sapporo', country: 'JP' },
    { name: 'Anchorage', country: 'US' },
    { name: 'Calgary', country: 'CA' },
    { name: 'Tallinn', country: 'EE' },
    { name: 'Vilnius', country: 'LT' },
    { name: 'Kiev', country: 'UA' },
    { name: 'Warsaw', country: 'PL' },
    { name: 'Prague', country: 'CZ' },
    { name: 'Innsbruck', country: 'AT' },
    { name: 'Chamonix', country: 'FR' },
    // Indian cities
    { name: 'Gulmarg', country: 'IN' },
    { name: 'Manali', country: 'IN' },
    { name: 'Shimla', country: 'IN' },
    { name: 'Auli', country: 'IN' },
    { name: 'Leh', country: 'IN' },
    { name: 'Nainital', country: 'IN' },
    { name: 'Mussoorie', country: 'IN' },
    { name: 'Kufri', country: 'IN' },
    { name: 'Tawang', country: 'IN' },
    { name: 'Sikkim', country: 'IN' },
  ],
  rainy: [
    { name: 'Singapore', country: 'SG' },
    { name: 'Mumbai', country: 'IN' },
    { name: 'Kolkata', country: 'IN' },
    { name: 'Jakarta', country: 'ID' },
    { name: 'Kuala Lumpur', country: 'MY' },
    { name: 'Bangkok', country: 'TH' },
    { name: 'London', country: 'GB' },
    { name: 'Brisbane', country: 'AU' },
    { name: 'Seattle', country: 'US' },
    { name: 'Vancouver', country: 'CA' },
    { name: 'Manila', country: 'PH' },
    { name: 'Rio de Janeiro', country: 'BR' },
    { name: 'Bogota', country: 'CO' },
    { name: 'Dublin', country: 'IE' },
    { name: 'Amsterdam', country: 'NL' },
    { name: 'Brussels', country: 'BE' },
    { name: 'Lagos', country: 'NG' },
    { name: 'Hanoi', country: 'VN' },
    { name: 'Ho Chi Minh City', country: 'VN' },
    { name: 'Kigali', country: 'RW' },
    // Indian cities
    { name: 'Cherrapunji', country: 'IN' },
    { name: 'Mawsynram', country: 'IN' },
    { name: 'Shillong', country: 'IN' },
    { name: 'Agumbe', country: 'IN' },
    { name: 'Coorg', country: 'IN' },
    { name: 'Kerala', country: 'IN' },
    { name: 'Goa', country: 'IN' },
    { name: 'Pune', country: 'IN' },
    { name: 'Hyderabad', country: 'IN' },
    { name: 'Bengaluru', country: 'IN' },
  ],
};

const weatherTypes = {
  cool: {
    label: 'Cool Places',
    filter: (temp, desc) => temp !== null && temp >= 10 && temp <= 20 && !desc.includes('fog'),
  },
  summer: {
    label: 'Summer Places',
    filter: (temp, desc) => temp !== null && temp > 25 && (desc.includes('clear') || desc.includes('sunny')),
  },
  fog: {
    label: 'Foggy Places',
    filter: (temp, desc) => desc.includes('fog'),
  },
  snowy: {
    label: 'Snowy Places',
    filter: (temp, desc) => desc.includes('snow'),
  },
  rainy: {
    label: 'Rainy Places',
    filter: (temp, desc) => desc.includes('rain'),
  },
};

const WeatherPlaceRecommender = () => {
  const [selectedType, setSelectedType] = useState('cool');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);
  const [forecastCity, setForecastCity] = useState('');
  const [forecastCountry, setForecastCountry] = useState('');
  const [forecastData, setForecastData] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const theme = useTheme();

  const handleTypeChange = (event, newType) => {
    if (newType) setSelectedType(newType);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    setFallback(false);
    try {
      const cities = cityGroups[selectedType];
      const weatherData = await Promise.all(
        cities.map(city => weatherService.getCityWeather(city.name, city.country))
      );
      const type = weatherTypes[selectedType];
      let filtered = weatherData.filter(w => type.filter(w.temp, w.description.toLowerCase()));
      if ((selectedType === 'fog' || selectedType === 'snowy') && filtered.length === 0) {
        filtered = weatherData;
        setFallback(true);
      }
      setResults(filtered);
    } catch (err) {
      setError('Failed to fetch weather data.');
    }
    setLoading(false);
  };

  const handleForecastSearch = async () => {
    setForecastLoading(true);
    setForecastError('');
    setForecastData([]);
    if (!forecastCity) {
      setForecastError('Please enter a city name.');
      setForecastLoading(false);
      return;
    }
    try {
      // Default to IN if no country provided
      const country = forecastCountry || 'IN';
      const data = await weatherService.getCityForecast(forecastCity, country, 16);
      if (!data.length) {
        setForecastError('No forecast data found for this city.');
      } else {
        setForecastData(data);
      }
    } catch (e) {
      setForecastError('Failed to fetch forecast.');
    }
    setForecastLoading(false);
  };

  // Weather icons for toggle buttons
  const weatherIcons = {
    cool: <CloudIcon sx={{ color: '#2196f3', mr: 1 }} />,
    summer: <WbSunnyIcon sx={{ color: '#ffb300', mr: 1 }} />,
    fog: <BlurOnIcon sx={{ color: '#90a4ae', mr: 1 }} />,
    snowy: <AcUnitIcon sx={{ color: '#00bcd4', mr: 1 }} />,
    rainy: <GrainIcon sx={{ color: '#1976d2', mr: 1 }} />,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
        py: 6,
        px: 0,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 6,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            p: { xs: 2, sm: 4 },
            mb: 4,
          }}
        >
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Weather-Based Place Recommendations
          </Typography>
          <Box display="flex" justifyContent="center" mb={3}>
            <ToggleButtonGroup
              value={selectedType}
              exclusive
              onChange={handleTypeChange}
              aria-label="weather type"
              sx={{
                background: 'rgba(240,240,240,0.7)',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                p: 1,
              }}
            >
              <ToggleButton value="cool" sx={{ fontWeight: 600, px: 2, py: 1 }}>
                {weatherIcons.cool} Cool
              </ToggleButton>
              <ToggleButton value="summer" sx={{ fontWeight: 600, px: 2, py: 1 }}>
                {weatherIcons.summer} Summer
              </ToggleButton>
              <ToggleButton value="fog" sx={{ fontWeight: 600, px: 2, py: 1 }}>
                {weatherIcons.fog} Foggy
              </ToggleButton>
              <ToggleButton value="snowy" sx={{ fontWeight: 600, px: 2, py: 1 }}>
                {weatherIcons.snowy} Snowy
              </ToggleButton>
              <ToggleButton value="rainy" sx={{ fontWeight: 600, px: 2, py: 1 }}>
                {weatherIcons.rainy} Rainy
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box display="flex" justifyContent="center" mb={2}>
            <Button
              variant="contained"
              onClick={fetchRecommendations}
              disabled={loading}
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
            </Button>
          </Box>
          {error && <Typography color="error" align="center">{error}</Typography>}
          {fallback && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No real-time matches found for this weather. Showing all places known for this weather type.
            </Alert>
          )}
          <Grid container spacing={3} mt={2}>
            {results.map((city, idx) => (
              <Grid item xs={12} sm={6} md={4} key={city.name + idx}>
                <Card
                  elevation={6}
                  sx={{
                    borderRadius: 5,
                    boxShadow: '0 4px 24px 0 rgba(33,150,243,0.10)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.03)',
                      boxShadow: '0 8px 32px 0 rgba(33,150,243,0.18)',
                    },
                    background: 'linear-gradient(120deg, #f8fafc 60%, #e3f2fd 100%)',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {city.name}, {city.country}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', mb: 0.5 }}>
                      Temperature: {city.temp !== null ? `${city.temp}°C` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', mb: 0.5 }}>
                      Weather: {city.description}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      Humidity: {city.humidity !== null ? `${city.humidity}%` : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Weather Forecast Section */}
        <Box
          sx={{
            background: 'rgba(255,255,255,0.98)',
            borderRadius: 6,
            boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)',
            p: { xs: 2, sm: 4 },
            mb: 4,
          }}
        >
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 2, letterSpacing: 1 }}>
            Weather Forecast Lookup
          </Typography>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center" alignItems="center" mb={2}>
            <TextField
              label="City"
              variant="outlined"
              value={forecastCity}
              onChange={e => setForecastCity(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Country Code (optional)"
              variant="outlined"
              value={forecastCountry}
              onChange={e => setForecastCountry(e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <Button
              variant="contained"
              onClick={handleForecastSearch}
              disabled={forecastLoading}
              sx={{ fontWeight: 600, px: 3, py: 1.2, borderRadius: 3 }}
            >
              {forecastLoading ? <CircularProgress size={22} /> : 'Get Forecast'}
            </Button>
          </Box>
          {forecastError && <Typography color="error" align="center">{forecastError}</Typography>}
          {forecastData.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
                {forecastCity}, {forecastCountry || 'IN'} - Next {forecastData.length >= 16 ? '16' : '7'} Days Forecast
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {forecastData.slice(0, 7).map((day, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Card elevation={4} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #f8fafc 60%, #e3f2fd 100%)' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {day.date.toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">Min: {day.min}°C</Typography>
                        <Typography variant="body2">Max: {day.max}°C</Typography>
                        <Typography variant="body2">{day.description}</Typography>
                        <Typography variant="body2">Humidity: {day.humidity}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {forecastData.length > 7 && (
                <>
                  <Typography variant="subtitle1" align="center" sx={{ mt: 3, fontWeight: 500 }}>
                    8-16 Day Extended Forecast
                  </Typography>
                  <Grid container spacing={2} justifyContent="center">
                    {forecastData.slice(7, 16).map((day, idx) => (
                      <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Card elevation={2} sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #f8fafc 60%, #e3f2fd 100%)' }}>
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {day.date.toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">Min: {day.min}°C</Typography>
                            <Typography variant="body2">Max: {day.max}°C</Typography>
                            <Typography variant="body2">{day.description}</Typography>
                            <Typography variant="body2">Humidity: {day.humidity}%</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default WeatherPlaceRecommender; 