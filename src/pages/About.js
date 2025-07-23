import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Explore,
  Security,
  Group,
  EmojiPeople,
  LocalAirport,
  Favorite,
  FlightTakeoff,
  Hotel,
  Restaurant,
  Notifications,
  Language,
  TravelExplore,
  Update,
  Public,
  Star,
  LocalOffer,
  Speed,
  SmartToy,
  NewReleases,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

const About = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [featureDialog, setFeatureDialog] = useState({
    open: false,
    title: '',
    content: null,
    feature: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const features = [
    {
      icon: <Explore />,
      title: 'Discover Amazing Places',
      description: 'Explore handpicked destinations and create unforgettable memories with our curated travel experiences.',
      feature: 'explore'
    },
    {
      icon: <Security />,
      title: 'Safe and Secure',
      description: 'Your safety is our priority. We ensure secure bookings and verified accommodations for peace of mind.',
      feature: 'security'
    },
    {
      icon: <Group />,
      title: 'Travel Community',
      description: 'Connect with fellow travelers, share experiences, and get inspired by travel stories from around the world.',
      feature: 'community'
    },
    {
      icon: <EmojiPeople />,
      title: 'Local Experiences',
      description: 'Immerse yourself in local culture with authentic experiences and knowledgeable local guides.',
      feature: 'experiences'
    },
    {
      icon: <LocalAirport />,
      title: 'Smart Travel Planning',
      description: 'Effortlessly plan your trips with our intelligent travel planner and real-time recommendations.',
      feature: 'planning'
    },
    {
      icon: <Favorite />,
      title: 'Personalized Service',
      description: 'Get tailored travel suggestions based on your preferences and travel style.',
      feature: 'personalized'
    },
    {
      icon: <Star />,
      title: 'Premium Benefits',
      description: 'Unlock exclusive deals, priority support, and AI-powered features with our premium subscription plans.',
      feature: 'subscription'
    },
  ];

  const handleFeatureClick = (feature) => {
    let dialogContent = null;
    let dialogTitle = '';
    
    switch (feature) {
      case 'explore':
        dialogTitle = 'Discover Amazing Places';
        dialogContent = (
          <List>
            <ListItem>
              <ListItemIcon><TravelExplore /></ListItemIcon>
              <ListItemText 
                primary="Curated Destinations" 
                secondary="Handpicked locations perfect for your travel style"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Public /></ListItemIcon>
              <ListItemText 
                primary="Global Coverage" 
                secondary="Access to destinations worldwide with local insights"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Language /></ListItemIcon>
              <ListItemText 
                primary="Cultural Experiences" 
                secondary="Authentic local experiences and cultural immersion"
              />
            </ListItem>
          </List>
        );
        break;

      case 'planning':
        dialogTitle = 'Smart Travel Planning';
        dialogContent = (
          <List>
            <ListItem>
              <ListItemIcon><FlightTakeoff /></ListItemIcon>
              <ListItemText 
                primary="AI Trip Planner" 
                secondary="Get personalized itineraries based on your preferences"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Hotel /></ListItemIcon>
              <ListItemText 
                primary="Accommodation Finder" 
                secondary="Find and book the perfect places to stay"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Restaurant /></ListItemIcon>
              <ListItemText 
                primary="Local Recommendations" 
                secondary="Discover hidden gems and local favorites"
              />
            </ListItem>
          </List>
        );
        break;

      case 'subscription':
        dialogTitle = 'Premium Subscription Benefits';
        dialogContent = (
          <List>
            <ListItem>
              <ListItemIcon><LocalOffer /></ListItemIcon>
              <ListItemText 
                primary="Exclusive Deals" 
                secondary="Get special discounts on hotels, flights, and activities"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Speed /></ListItemIcon>
              <ListItemText 
                primary="Priority Support" 
                secondary="24/7 dedicated customer service with faster response times"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><SmartToy /></ListItemIcon>
              <ListItemText 
                primary="AI Trip Planner" 
                secondary="Advanced AI-powered trip suggestions and itineraries"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><NewReleases /></ListItemIcon>
              <ListItemText 
                primary="Early Access" 
                secondary="Be the first to try new features and updates"
              />
            </ListItem>
          </List>
        );
        break;

      default:
        dialogTitle = feature.charAt(0).toUpperCase() + feature.slice(1);
        dialogContent = (
          <List>
            <ListItem>
              <ListItemIcon><Update /></ListItemIcon>
              <ListItemText 
                primary="Coming Soon" 
                secondary="We're working on making this feature even better"
              />
            </ListItem>
          </List>
        );
    }

    setFeatureDialog({
      open: true,
      title: dialogTitle,
      content: dialogContent,
      feature: feature
    });
  };

  const handleTryFeature = (feature) => {
    setFeatureDialog({ ...featureDialog, open: false });
    
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please sign in to access this feature',
        severity: 'info'
      });
      navigate('/signin');
      return;
    }

    switch (feature) {
      case 'explore':
        navigate('/explore');
        break;
      case 'planning':
        navigate('/trips');
        break;
      case 'subscription':
        navigate('/subscription');
        break;
      default:
        navigate('/explore');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8, minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)', borderRadius: 6, boxShadow: 3, px: { xs: 1, sm: 4 }, mt: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 1.5,
                mb: 2
              }}
            >
              About TravelApp
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Transforming the way you explore the world
            </Typography>
          </motion.div>
        </Box>

        {/* Mission Statement */}
        <motion.div variants={itemVariants}>
          <Card
            elevation={3}
            sx={{
              mb: 8,
              borderRadius: 4,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              boxShadow: 6
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                We're dedicated to making travel planning seamless and enjoyable. Our platform combines cutting-edge technology with personalized service to help you create unforgettable journeys. Whether you're a solo adventurer or traveling with family and friends, we're here to transform your travel dreams into reality.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div variants={itemVariants}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                    },
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.95)'
                  }}
                  onClick={() => handleFeatureClick(feature.feature)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          mb: 2,
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
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
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

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
              onClick={() => handleTryFeature(featureDialog.feature)}
            >
              Try Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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
      </motion.div>
    </Container>
  );
};

export default About; 