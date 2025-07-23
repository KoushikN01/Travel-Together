import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  LocationOn,
  DateRange,
  Person,
  Search,
  FilterList,
  Sort,
  Hotel,
  FlightTakeoff,
  Restaurant,
  Attractions,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    type: 'all'
  });
  const [sortBy, setSortBy] = useState('recommended');

  // Get search parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const travelers = searchParams.get('travelers');

  useEffect(() => {
    // Simulate API call to get search results
    const fetchResults = async () => {
      setLoading(true);
      try {
        // This is where you would make your actual API call
        // For now, we'll simulate some results
        const mockResults = [
          {
            id: 1,
            title: 'Luxury Hotel Package',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            price: 299,
            rating: 4.5,
            type: 'hotel',
            description: '5-star luxury accommodation with premium amenities',
            location: destination,
            availableDates: date,
            maxTravelers: 4
          },
          {
            id: 2,
            title: 'Adventure Tour Package',
            image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=80',
            price: 199,
            rating: 4.8,
            type: 'tour',
            description: 'Exciting adventure activities and guided tours',
            location: destination,
            availableDates: date,
            maxTravelers: 6
          },
          {
            id: 3,
            title: 'Cultural Experience',
            image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80',
            price: 149,
            rating: 4.3,
            type: 'experience',
            description: 'Immerse yourself in local culture and traditions',
            location: destination,
            availableDates: date,
            maxTravelers: 8
          }
        ];

        // Apply filters
        let filteredResults = mockResults;
        if (filters.priceRange !== 'all') {
          const [min, max] = filters.priceRange.split('-');
          filteredResults = filteredResults.filter(result => 
            result.price >= parseInt(min) && result.price <= parseInt(max)
          );
        }
        if (filters.rating !== 'all') {
          filteredResults = filteredResults.filter(result => 
            result.rating >= parseFloat(filters.rating)
          );
        }
        if (filters.type !== 'all') {
          filteredResults = filteredResults.filter(result => 
            result.type === filters.type
          );
        }

        // Apply sorting
        switch (sortBy) {
          case 'price-low':
            filteredResults.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            filteredResults.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filteredResults.sort((a, b) => b.rating - a.rating);
            break;
          default:
            // recommended sorting (default)
            break;
        }

        setResults(filteredResults);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [destination, date, travelers, filters, sortBy]);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    handleFilterClose();
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    handleSortClose();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hotel':
        return <Hotel />;
      case 'tour':
        return <FlightTakeoff />;
      case 'experience':
        return <Attractions />;
      default:
        return <Restaurant />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search Results for {destination}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            icon={<LocationOn />}
            label={`Destination: ${destination}`}
            variant="outlined"
          />
          <Chip
            icon={<DateRange />}
            label={`Date: ${date}`}
            variant="outlined"
          />
          <Chip
            icon={<Person />}
            label={`Travelers: ${travelers}`}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Filters and Sort */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleFilterClick}
        >
          Filters
        </Button>
        <Button
          variant="outlined"
          startIcon={<Sort />}
          onClick={handleSortClick}
        >
          Sort
        </Button>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem>
          <Typography variant="subtitle2">Price Range</Typography>
        </MenuItem>
        {['all', '0-100', '100-200', '200-300', '300+'].map((range) => (
          <MenuItem
            key={range}
            onClick={() => handleFilterChange('priceRange', range)}
            selected={filters.priceRange === range}
          >
            {range === 'all' ? 'All Prices' : `$${range}`}
          </MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem>
          <Typography variant="subtitle2">Rating</Typography>
        </MenuItem>
        {['all', '4.5', '4.0', '3.5', '3.0'].map((rating) => (
          <MenuItem
            key={rating}
            onClick={() => handleFilterChange('rating', rating)}
            selected={filters.rating === rating}
          >
            {rating === 'all' ? 'All Ratings' : `${rating}+ Stars`}
          </MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem>
          <Typography variant="subtitle2">Type</Typography>
        </MenuItem>
        {['all', 'hotel', 'tour', 'experience'].map((type) => (
          <MenuItem
            key={type}
            onClick={() => handleFilterChange('type', type)}
            selected={filters.type === type}
          >
            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        {[
          { value: 'recommended', label: 'Recommended' },
          { value: 'price-low', label: 'Price: Low to High' },
          { value: 'price-high', label: 'Price: High to Low' },
          { value: 'rating', label: 'Highest Rated' }
        ].map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            selected={sortBy === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Results Grid */}
      <Grid container spacing={4}>
        {results.map((result) => (
          <Grid item xs={12} md={6} lg={4} key={result.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={result.image}
                  alt={result.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getTypeIcon(result.type)}
                    <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                      {result.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {result.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${result.price}
                    </Typography>
                    <Chip
                      icon={<Star />}
                      label={result.rating}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/booking/${result.id}`, {
                      state: {
                        destination: result.location,
                        estimatedCost: `$${result.price}`,
                        bestTimeToVisit: result.availableDates,
                        category: result.type,
                        title: result.title,
                        description: result.description,
                        image: result.image,
                        rating: result.rating,
                        maxTravelers: result.maxTravelers
                      }
                    })}
                  >
                    Book Now
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {results.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No results found for your search criteria
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Modify Search
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default SearchResults; 