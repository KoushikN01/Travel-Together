import React, { useState, useEffect } from 'react';
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
  Rating,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  AttachMoney,
  Favorite,
  FavoriteBorder,
  Share,
  DirectionsWalk,
  Restaurant,
  LocalActivity,
  BeachAccess,
  Hiking,
  Museum,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SplashCursor from '../components/effects/SplashCursor';
import StarBorder from '../components/effects/StarBorder';
import ChromaGrid from '../components/effects/ChromaGrid';

const destinations = [
  {
    id: 1,
    name: 'Santorini, Greece',
    image: '/images1recomendtions/santorini.jpeg',
    rating: 4.8,
    description: 'Experience the stunning sunsets and white-washed buildings of this Mediterranean paradise.',
    activities: [
      { type: 'Sightseeing', name: 'Oia Sunset Tour', duration: '3 hours', cost: '₹5200', icon: <DirectionsWalk /> },
      { type: 'Dining', name: 'Wine Tasting', duration: '2 hours', cost: '₹8300', icon: <Restaurant /> },
      { type: 'Adventure', name: 'Caldera Cruise', duration: '5 hours', cost: '₹12000', icon: <BeachAccess /> },
    ],
  },
  {
    id: 2,
    name: 'Kyoto, Japan',
    image: '/images1recomendtions/kyoto japan.jpeg',
    rating: 4.9,
    description: 'Discover ancient temples, traditional gardens, and the art of Japanese culture.',
    activities: [
      { type: 'Cultural', name: 'Temple Tour', duration: '4 hours', cost: '₹7000', icon: <Museum /> },
      { type: 'Adventure', name: 'Bamboo Forest Walk', duration: '2 hours', cost: '₹4500', icon: <Hiking /> },
      { type: 'Entertainment', name: 'Tea Ceremony', duration: '1.5 hours', cost: '₹6800', icon: <LocalActivity /> },
    ],
  },
  {
    id: 3,
    name: 'Machu Picchu, Peru',
    image: '/images1recomendtions/pichhu.jpeg',
    rating: 4.9,
    description: 'Explore the ancient Incan citadel set high in the Andes Mountains.',
    activities: [
      { type: 'Adventure', name: 'Inca Trail Trek', duration: '4 days', cost: '₹52000', icon: <Hiking /> },
      { type: 'Sightseeing', name: 'Guided Tour', duration: '3 hours', cost: '₹9900', icon: <DirectionsWalk /> },
      { type: 'Cultural', name: 'Local Market Visit', duration: '2 hours', cost: '₹3100', icon: <LocalActivity /> },
    ],
  },
  {
    id: 4,
    name: 'Bali, Indonesia',
    image: '/images1recomendtions/bali.jpeg',
    rating: 4.7,
    description: 'Immerse yourself in the tropical paradise of Bali with its stunning beaches and rich culture.',
    activities: [
      { type: 'Adventure', name: 'Ubud Monkey Forest', duration: '2 hours', cost: '₹3500', icon: <Hiking /> },
      { type: 'Cultural', name: 'Temple Visit', duration: '3 hours', cost: '₹4200', icon: <Museum /> },
      { type: 'Relaxation', name: 'Spa Treatment', duration: '2 hours', cost: '₹8500', icon: <BeachAccess /> },
    ],
  },
  {
    id: 5,
    name: 'Paris, France',
    image: '/images1recomendtions/paris.jpeg',
    rating: 4.8,
    description: 'Experience the romance of the City of Light with its iconic landmarks and world-class cuisine.',
    activities: [
      { type: 'Sightseeing', name: 'Eiffel Tower Visit', duration: '2 hours', cost: '₹7500', icon: <DirectionsWalk /> },
      { type: 'Cultural', name: 'Louvre Museum Tour', duration: '4 hours', cost: '₹6800', icon: <Museum /> },
      { type: 'Dining', name: 'Seine River Dinner Cruise', duration: '3 hours', cost: '₹12000', icon: <Restaurant /> },
    ],
  },
  {
    id: 6,
    name: 'Dubai, UAE',
    image: '/images1recomendtions/dubai.jpeg',
    rating: 4.6,
    description: 'Discover the futuristic city of Dubai with its stunning architecture and luxury experiences.',
    activities: [
      { type: 'Adventure', name: 'Desert Safari', duration: '6 hours', cost: '₹3000', icon: <Hiking /> },
      { type: 'Sightseeing', name: 'Burj Khalifa Visit', duration: '2 hours', cost: '₹1900', icon: <DirectionsWalk /> },
      { type: 'Shopping', name: 'Dubai Mall Tour', duration: '4 hours', cost: '₹1000', icon: <LocalActivity /> },
    ],
  },
  {
    id: 7,
    name: 'Maldives',
    image: '/images1recomendtions/maldives.jpeg',
    rating: 4.9,
    description: 'Escape to the crystal-clear waters and pristine beaches of this tropical paradise.',
    activities: [
      { type: 'Adventure', name: 'Snorkeling Tour', duration: '3 hours', cost: '₹1700', icon: <BeachAccess /> },
      { type: 'Relaxation', name: 'Spa Day', duration: '4 hours', cost: '₹3000', icon: <LocalActivity /> },
      { type: 'Dining', name: 'Underwater Restaurant', duration: '2 hours', cost: '₹5000', icon: <Restaurant /> },
    ],
  },
  {
    id: 8,
    name: 'Swiss Alps',
    image: '/images1recomendtions/swiss.jpeg',
    rating: 4.8,
    description: 'Experience the breathtaking beauty of the Swiss Alps with its majestic mountains and charming villages.',
    activities: [
      { type: 'Adventure', name: 'Skiing', duration: 'Full day', cost: '₹3600', icon: <Hiking /> },
      { type: 'Sightseeing', name: 'Mountain Train Ride', duration: '3 hours', cost: '₹2400', icon: <DirectionsWalk /> },
      { type: 'Cultural', name: 'Cheese Tasting', duration: '2 hours', cost: '₹1500', icon: <Restaurant /> },
    ],
  },
];

const Explore = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();

  const handleFavorite = (destinationId) => {
    setFavorites(prev => ({
      ...prev,
      [destinationId]: !prev[destinationId]
    }));
  };

  const handlePlanTrip = (destination) => {
    navigate('/trips', {
      state: {
        prefillBooking: {
          to: destination.name,
          from: '',
          transportMode: 'flight',
          accommodation: 'hotel',
        }
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const destinationItems = destinations.map(dest => ({
    image: dest.image,
    title: dest.name,
    subtitle: dest.description,
    handle: `@${dest.name.toLowerCase().replace(/\s+/g, '')}`,
    borderColor: "#FF4081",
    gradient: "linear-gradient(145deg, #FF4081, #000)",
    url: `/destination/${dest.id}`
  }));

  const renderTripCard = (destination) => (
    <Grid item xs={12} key={destination.id}>
      <motion.div variants={itemVariants}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-8px)',
            },
          }}
        >
          <Grid container>
            <Grid item xs={12} md={5}>
              <CardMedia
                component="img"
                height="100%"
                image={destination.image}
                alt={destination.name}
                sx={{ minHeight: 300 }}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h2">
                    {destination.name}
                  </Typography>
                  <Box>
                    <StarBorder
                      as="button"
                      color="#FF4081"
                      speed="5s"
                      onClick={() => handleFavorite(destination.id)}
                      style={{ marginRight: '8px' }}
                    >
                      {favorites[destination.id] ? <Favorite /> : <FavoriteBorder />}
                    </StarBorder>
                    <StarBorder
                      as="button"
                      color="#4CAF50"
                      speed="5s"
                      onClick={() => handlePlanTrip(destination)}
                    >
                      Plan Trip
                    </StarBorder>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={destination.rating} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({destination.rating})
                  </Typography>
                </Box>

                <Typography variant="body1" paragraph>
                  {destination.description}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Popular Activities
                </Typography>
                <Grid container spacing={2}>
                  {destination.activities.map((activity, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {activity.icon}
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                              {activity.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                              size="small"
                              icon={<AccessTime />}
                              label={activity.duration}
                            />
                            <Chip
                              size="small"
                              icon={<AttachMoney />}
                              label={activity.cost}
                            />
                            <Chip
                              size="small"
                              icon={<LocalActivity />}
                              label={activity.type}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </motion.div>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Explore Destinations
      </Typography>
      
      {/* Add ChromaGrid for destinations */}
      <Box sx={{ height: '600px', position: 'relative', mb: 4 }}>
        <ChromaGrid 
          items={destinationItems}
          radius={300}
          damping={0.45}
          fadeOut={0.6}
          ease="power3.out"
        />
      </Box>

      {/* Existing destination grid */}
      <Grid container spacing={3}>
        {destinations.map((destination) => (
          renderTripCard(destination))
        )}
      </Grid>
    </Container>
  );
};

export default Explore; 