import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import DarkModeToggle from '../components/DarkModeToggle';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Rating,
  Avatar,
  Paper,
  Chip,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ExploreOutlined,
  TrendingUp,
  Public,
  Search,
  LocationOn,
  DateRange,
  Person,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Favorite,
  Share,
  Add,
  Remove,
  PlayArrow,
  Pause,
  FlightTakeoff,
  Hotel,
  Restaurant,
  Notifications,
  Language,
  TravelExplore,
  Update,
  Star,
} from '@mui/icons-material';

const featuredDestinations = [
  {
    title: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'Experience the city of love and its iconic landmarks.',
  },
  {
    title: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Discover tropical paradise and rich cultural heritage.',
  },
  {
    title: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in the blend of tradition and innovation.',
  },
];

const popularDestinations = [
  'New York', 'London', 'Dubai', 'Singapore', 'Rome', 'Barcelona', 'Sydney', 'Bangkok'
];

const testimonials = [
  {
    name: 'Shivaji S',
    avatar: '/testimonials/shivaji.jpg',
    rating: 5,
    comment: 'The best travel planning experience I\'ve ever had. The AI recommendations were spot on!',
    destination: 'Paris, France'
  },
  {
    name: 'Pavan',
    avatar: '/testimonials/pavan.jpg',
    rating: 5,
    comment: 'Made planning our family vacation so much easier. Highly recommended!',
    destination: 'Tokyo, Japan'
  },
  {
    name: 'Vidya Shree',
    avatar: '/testimonials/vidya.jpg',
    rating: 4,
    comment: 'Great features and user-friendly interface. Saved us so much time!',
    destination: 'Barcelona, Spain'
  }
];

const AnimatedBackground = () => {
  return (
    <Box 
      sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        bgcolor: 'black',
        '@keyframes gradient': {
          '0%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0% 50%'
          }
        },
        '@keyframes movePattern': {
          '0%': {
            transform: 'translate(0, 0)'
          },
          '100%': {
            transform: 'translate(100px, 100px)'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, #2196F3, #21CBF3, #2196F3)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
          opacity: 0.8,
          zIndex: 1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 2
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          opacity: 0.3,
          animation: 'movePattern 30s linear infinite',
          zIndex: 1
        }}
      />
    </Box>
  );
};

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const [searchParams, setSearchParams] = useState({
    destination: '',
    date: null,
    travelers: 1,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [favorites, setFavorites] = useState({});
  const [travelersAnchorEl, setTravelersAnchorEl] = useState(null);
  const [featureDialog, setFeatureDialog] = useState({
    open: false,
    title: '',
    content: null
  });

  const handleButtonClick = (path) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please sign in to access this feature',
        severity: 'info',
      });
      navigate('/signin');
      return;
    }
    navigate(path);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setSnackbar({
        open: true,
        message: 'Please enter your email address',
        severity: 'error',
      });
      return;
    }
    setSnackbar({
      open: true,
      message: 'Successfully subscribed to newsletter!',
      severity: 'success',
    });
    setEmail('');
  };

  const handleSearch = () => {
    if (!searchParams.destination) {
      setSnackbar({
        open: true,
        message: 'Please enter a destination',
        severity: 'error'
      });
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      // If not authenticated, save search params to sessionStorage and redirect to signin
      sessionStorage.setItem('pendingSearch', JSON.stringify(searchParams));
      navigate('/signin');
      return;
    }

    // If authenticated, navigate directly to trips page with search params
    navigate('/trips', {
      state: {
        prefillBooking: {
          to: searchParams.destination,
          from: '',
          startDate: searchParams.date,
          travelers: searchParams.travelers,
          transportMode: 'flight',
          accommodation: 'hotel'
        }
      }
    });
  };

  const handleFavorite = (destinationTitle) => {
    setFavorites(prev => ({
      ...prev,
      [destinationTitle]: !prev[destinationTitle]
    }));
    setSnackbar({
      open: true,
      message: `${favorites[destinationTitle] ? 'Removed from' : 'Added to'} favorites!`,
      severity: 'success',
    });
  };

  const handleTravelersClick = (event) => {
    setTravelersAnchorEl(event.currentTarget);
  };

  const handleTravelersClose = () => {
    setTravelersAnchorEl(null);
  };

  const adjustTravelers = (amount) => {
    const newValue = Math.max(1, Math.min(10, searchParams.travelers + amount));
    setSearchParams(prev => ({ ...prev, travelers: newValue }));
  };

  const handleFeatureClick = (feature) => {
    let dialogContent = null;
    
    switch (feature) {
      case 'planning':
        dialogContent = (
          <List>
            <ListItem>
              <ListItemIcon><FlightTakeoff /></ListItemIcon>
              <ListItemText 
                primary="AI Trip Planner" 
                secondary="Get personalized itineraries based on your preferences and travel style"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Hotel /></ListItemIcon>
              <ListItemText 
                primary="Accommodation Finder" 
                secondary="Find and book the perfect places to stay within your budget"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Restaurant /></ListItemIcon>
              <ListItemText 
                primary="Local Experience Recommendations" 
                secondary="Discover hidden gems and local favorites at your destination"
              />
            </ListItem>
          </List>
        );
        break;

      case 'updates':
        dialogContent = (
          <List>
            <ListItem>
              <ListItemIcon><Notifications /></ListItemIcon>
              <ListItemText 
                primary="Travel Alerts" 
                secondary="Receive instant notifications about flight changes, weather alerts, and travel advisories"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Language /></ListItemIcon>
              <ListItemText 
                primary="Local Updates" 
                secondary="Stay informed about local events, festivals, and cultural activities"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Update /></ListItemIcon>
              <ListItemText 
                primary="Price Tracking" 
                secondary="Get alerts when prices drop for flights, hotels, and activities"
              />
            </ListItem>
          </List>
        );
        break;

      case 'coverage':
        dialogContent = (
          <List>
            <ListItem>
              <ListItemIcon><Public /></ListItemIcon>
              <ListItemText 
                primary="Worldwide Destinations" 
                secondary="Access information about destinations across all continents"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><TravelExplore /></ListItemIcon>
              <ListItemText 
                primary="Local Partnerships" 
                secondary="Connect with verified local tour operators and service providers"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Language /></ListItemIcon>
              <ListItemText 
                primary="Multi-language Support" 
                secondary="Get assistance in multiple languages for a seamless travel experience"
              />
            </ListItem>
          </List>
        );
        break;
    }

    setFeatureDialog({
      open: true,
      title: feature === 'planning' ? 'Smart Planning Features' :
             feature === 'updates' ? 'Real-time Updates Features' :
             'Global Coverage Features',
      content: dialogContent
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box>
      {/* Hero Section with Animated Background */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <AnimatedBackground />
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative',
            zIndex: 2,
            pt: { xs: 8, md: 0 }
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant={isMobile ? 'h3' : 'h2'} 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  Your Next Adventure Starts Here
                </Typography>
                <Typography 
                  variant="h6" 
                  paragraph
                  sx={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    mb: 4
                  }}
                >
                  Plan, explore, and create unforgettable travel experiences with our intelligent travel companion.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleButtonClick('/explore')}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    Explore
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleButtonClick('/trips')}
                    sx={{
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    Start Planning
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleButtonClick('/about')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    About
                  </Button>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Section */}
      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Where to?"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={searchParams.date}
                    onChange={(newDate) => setSearchParams(prev => ({ ...prev, date: newDate }))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: "When?",
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRange color="primary" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Travelers"
                  value={`${searchParams.travelers} Traveler${searchParams.travelers > 1 ? 's' : ''}`}
                  onClick={handleTravelersClick}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Menu
                  anchorEl={travelersAnchorEl}
                  open={Boolean(travelersAnchorEl)}
                  onClose={handleTravelersClose}
                >
                  <MenuItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconButton size="small" onClick={() => adjustTravelers(-1)}>
                        <Remove />
                      </IconButton>
                      <Typography>{searchParams.travelers}</Typography>
                      <IconButton size="small" onClick={() => adjustTravelers(1)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </MenuItem>
                </Menu>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ height: '100%' }}
                  startIcon={<Search />}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Popular Destinations:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {popularDestinations.map((dest) => (
                  <Chip
                    key={dest}
                    label={dest}
                    onClick={() => {
                      setSearchParams(prev => ({ ...prev, destination: dest }));
                    }}
                    sx={{
                      '&:hover': { bgcolor: 'primary.light', color: 'white' },
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Grid container spacing={4}>
            {[
              { icon: <ExploreOutlined />, title: 'Smart Planning', desc: 'AI-powered recommendations for your perfect trip', feature: 'planning', img: '/home/smart planning.jpg' },
              { icon: <TrendingUp />, title: 'Real-time Updates', desc: 'Stay informed with live travel information', feature: 'updates', img: '/home/real time.png' },
              { icon: <Public />, title: 'Global Coverage', desc: 'Explore destinations worldwide', feature: 'coverage', img: '/home/global coverage.png' }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Box
                    textAlign="center"
                    component={motion.div}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => handleFeatureClick(feature.feature)}
                    sx={{
                      cursor: 'pointer',
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': {
                        boxShadow: 3,
                        bgcolor: 'grey.50',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <img src={feature.img} alt={feature.title} style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }} />
                    </Box>
                    <Box sx={{ fontSize: 50, color: '#2196F3', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.desc}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeatureClick(feature.feature);
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Feature Dialog */}
      <Dialog
        open={featureDialog.open}
        onClose={() => setFeatureDialog({ ...featureDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          pb: 2
        }}>
          {featureDialog.title}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {featureDialog.content}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setFeatureDialog({ ...featureDialog, open: false })}
            color="primary"
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setFeatureDialog({ ...featureDialog, open: false });
              if (!user) {
                setSnackbar({
                  open: true,
                  message: 'Please sign in to access these features',
                  severity: 'info'
                });
                navigate('/signin');
              } else {
                navigate('/explore');
              }
            }}
          >
            Try Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Featured Destinations */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 6 }}>
              Featured Destinations
            </Typography>
            <Grid container spacing={4}>
              {featuredDestinations.map((destination) => (
                <Grid item key={destination.title} xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={2}
                      component={motion.div}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={destination.image}
                        alt={destination.title}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {destination.title}
                          </Typography>
                          <Box>
                            <Tooltip title="Add to favorites">
                              <IconButton
                                onClick={() => handleFavorite(destination.title)}
                                color={favorites[destination.title] ? "primary" : "default"}
                              >
                                <Favorite />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Share">
                              <IconButton>
                                <Share />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {destination.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          What Our Travelers Say
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.name}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">{testimonial.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.destination}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    "{testimonial.comment}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Newsletter Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                Get Travel Updates
              </Typography>
              <Typography variant="body1">
                Subscribe to our newsletter and never miss out on exclusive deals and travel tips.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSubscribe}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'white' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{ height: '100%' }}
                      onClick={handleSubscribe}
                    >
                      Subscribe
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                TravelApp
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your intelligent travel companion for creating unforgettable experiences.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Facebook />
                <Twitter />
                <Instagram />
                <LinkedIn />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Company
              </Typography>
              <Typography variant="body2" paragraph>About Us</Typography>
              <Typography variant="body2" paragraph>Careers</Typography>
              <Typography variant="body2" paragraph>Press</Typography>
              <Typography variant="body2">Blog</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Typography variant="body2" paragraph>Help Center</Typography>
              <Typography variant="body2" paragraph>Contact Us</Typography>
              <Typography variant="body2" paragraph>Privacy Policy</Typography>
              <Typography variant="body2">Terms of Service</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Download Our App
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  style={{ height: 40 }}
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  style={{ height: 40 }}
                />
              </Box>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ mt: 4, textAlign: 'center' }}>
            © {new Date().getFullYear()} TravelApp. All rights reserved.
          </Typography>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

      {/* Dark Mode Toggle */}
      <DarkModeToggle />
    </Box>
  );
};

export default Home; 